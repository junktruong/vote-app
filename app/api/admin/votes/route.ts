import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

type VoterGroup = {
  _id: unknown;
  count?: number;
  candidateIds?: unknown[];
};

type CandidateGroup = {
  _id: unknown;
  count?: number;
};

type UserRow = {
  _id: unknown;
  fullName?: string;
};

type CandidateStat = {
  candidateId: string;
  fullName: string;
  voteCount: number;
};

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const poll =
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }).lean());

  if (!poll) return NextResponse.json({ poll: null, voters: [], candidateStats: [], totalVotes: 0 });

  const grouped = (await Vote.aggregate([
    { $match: { pollId: poll._id } },
    {
      $group: {
        _id: "$voterUserId",
        count: { $sum: 1 },
        candidateIds: { $push: "$candidateId" },
      },
    },
    { $sort: { count: -1 } },
  ])) as VoterGroup[];

  const voterIds = grouped.map((g) => g._id);
  const users = (await User.find({ _id: { $in: voterIds } }).select("fullName").lean()) as UserRow[];
  const userMap = new Map<string, string>(users.map((u) => [String(u._id), u.fullName || "Ẩn danh"]));
  const candidateMap = new Map<string, string>(
    (poll.candidates || []).map((c: { id: string; name: string }) => [String(c.id), c.name])
  );

  const candidateGrouped = (await Vote.aggregate([
    { $match: { pollId: poll._id } },
    {
      $group: {
        _id: "$candidateId",
        count: { $sum: 1 },
      },
    },
  ])) as CandidateGroup[];
  const candidateCountMap = new Map<string, number>(
    candidateGrouped.map((item) => [String(item._id), Number(item.count) || 0])
  );
  const candidateStats: CandidateStat[] = (poll.candidates || [])
    .map((candidate: { id: string; name: string }) => ({
      candidateId: String(candidate.id),
      fullName: candidate.name,
      voteCount: candidateCountMap.get(String(candidate.id)) || 0,
    }))
    .sort((a: CandidateStat, b: CandidateStat) => {
      return b.voteCount - a.voteCount || a.fullName.localeCompare(b.fullName);
    });
  const totalVotes = candidateStats.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);

  const voters = grouped.map((g) => {
    const userId = String(g._id);
    const candidateNames = (Array.isArray(g.candidateIds) ? g.candidateIds : [])
      .map((id) => candidateMap.get(String(id)))
      .filter((name): name is string => Boolean(name));
    return {
      userId,
      fullName: userMap.get(userId) || "Ẩn danh",
      count: Number(g.count) || 0,
      candidateNames,
    };
  });

  return NextResponse.json({
    poll: { id: String(poll._id), title: poll.title },
    voters,
    candidateStats,
    totalVotes,
  });
}

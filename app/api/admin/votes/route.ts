import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const poll =
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }).lean());

  if (!poll) return NextResponse.json({ poll: null, voters: [] });

  const grouped = await Vote.aggregate([
    { $match: { pollId: poll._id } },
    {
      $group: {
        _id: "$voterUserId",
        count: { $sum: 1 },
        candidateIds: { $push: "$candidateId" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const voterIds = grouped.map((g: any) => g._id);
  const users = await User.find({ _id: { $in: voterIds } }).select("fullName").lean();
  const userMap = new Map<string, string>(users.map((u: any) => [String(u._id), u.fullName]));
  const candidateMap = new Map<string, string>(
    (poll.candidates || []).map((c: any) => [String(c.id), c.name])
  );

  const voters = grouped.map((g: any) => {
    const userId = String(g._id);
    const candidateNames = (g.candidateIds || [])
      .map((id: string) => candidateMap.get(String(id)))
      .filter(Boolean);
    return {
      userId,
      fullName: userMap.get(userId) || "Ẩn danh",
      count: g.count || 0,
      candidateNames,
    };
  });

  return NextResponse.json({
    poll: { id: String(poll._id), title: poll.title },
    voters,
  });
}

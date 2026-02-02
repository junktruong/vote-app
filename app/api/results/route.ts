import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";

export async function GET() {
  await dbConnect();
  const poll =
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }).lean());

  if (!poll) return NextResponse.json({ poll: null, candidates: [], top: null });

  const counts = await Vote.aggregate([
    { $match: { pollId: poll._id } },
    { $group: { _id: "$candidateId", votes: { $sum: 1 } } },
  ]);

  const map = new Map<string, number>(counts.map((c: any) => [String(c._id), c.votes]));
  const candidates = (poll.candidates || [])
    .map((c: any) => ({
      candidateId: String(c.id),
      fullName: c.name,
      voteCount: map.get(String(c.id)) || 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount || a.fullName.localeCompare(b.fullName));

  const top = candidates[0] || null;

  return NextResponse.json({
    poll: {
      id: String(poll._id),
      title: poll.title,
      isActive: poll.isActive,
      revealWinner: poll.revealWinner,
      showOnResults: poll.showOnResults,
      maxVotes: poll.maxVotes ?? 3,
    },
    candidates,
    top,
  });
}

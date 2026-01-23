import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import User from "@/models/User";
import Vote from "@/models/Vote";

export async function GET() {
  await dbConnect();
  const poll =
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }).lean());

  if (!poll) return NextResponse.json({ poll: null, candidates: [], top: null });

  const users = await User.find({ _id: { $in: poll.candidateUserIds } })
    .select("fullName username photoUrl")
    .lean();

  const counts = await Vote.aggregate([
    { $match: { pollId: poll._id } },
    { $group: { _id: "$candidateUserId", votes: { $sum: 1 } } },
  ]);

  const map = new Map<string, number>(counts.map((c: any) => [String(c._id), c.votes]));
  const candidates = users
    .map((u: any) => ({
      userId: String(u._id),
      fullName: u.fullName,
      username: u.username,
      photoUrl: u.photoUrl,
      votes: map.get(String(u._id)) || 0,
    }))
    .sort((a, b) => b.votes - a.votes || a.fullName.localeCompare(b.fullName));

  const top = candidates[0] || null;

  return NextResponse.json({
    poll: { id: String(poll._id), title: poll.title, isActive: poll.isActive, revealWinner: poll.revealWinner },
    candidates,
    top,
  });
}

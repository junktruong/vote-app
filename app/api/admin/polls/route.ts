import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const polls = await Poll.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    polls: polls.map((poll: any) => ({
      id: String(poll._id),
      title: poll.title,
      isActive: poll.isActive,
      revealWinner: poll.revealWinner,
      showOnResults: poll.showOnResults,
      maxVotes: poll.maxVotes ?? 3,
      candidateCount: poll.candidates?.length ?? 0,
      createdAt: poll.createdAt,
    })),
  });
}

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

  const now = Date.now();
  const durationSec = Number.isFinite(Number(poll.countdownDurationSec))
    ? Number(poll.countdownDurationSec)
    : 180;
  const startedAt = poll.countdownStartedAt ? new Date(poll.countdownStartedAt).getTime() : null;
  let revealState = poll.revealState || "NOT_STARTED";
  if (poll.revealWinner && revealState !== "REVEALED") {
    revealState = "REVEALED";
  }

  if (revealState === "COUNTING") {
    if (!startedAt) {
      revealState = "NOT_STARTED";
    } else if (now - startedAt >= durationSec * 1000) {
      revealState = "WAITING_REVEAL";
      await Poll.findByIdAndUpdate(poll._id, { revealState: "WAITING_REVEAL" }).catch(() => null);
    }
  }

  const shouldReveal = revealState === "REVEALED";
  let candidates = (poll.candidates || []).map((c: any) => ({
    candidateId: String(c.id),
    fullName: c.name,
    voteCount: 0,
  }));
  let top = null;

  if (shouldReveal) {
    const counts = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: "$candidateId", votes: { $sum: 1 } } },
    ]);
    const map = new Map<string, number>(counts.map((c: any) => [String(c._id), c.votes]));
    candidates = candidates
      .map((c:any) => ({ ...c, voteCount: map.get(String(c.candidateId)) || 0 }))
      .sort((a : any, b : any) => b.voteCount - a.voteCount || a.fullName.localeCompare(b.fullName));
    top = candidates[0] || null;
  } else {
    candidates = candidates.sort((a: any , b : any ) => a.fullName.localeCompare(b.fullName));
  }

  return NextResponse.json({
    poll: {
      id: String(poll._id),
      title: poll.title,
      isActive: poll.isActive,
      status: poll.status ?? "OPEN",
      revealState,
      countdownStartedAt: poll.countdownStartedAt ?? null,
      countdownDurationSec: durationSec,
      serverNow: new Date(now).toISOString(),
      spinState: poll.spinState ?? "IDLE",
      spinWinnerId: poll.spinWinnerId ?? null,
      spinWinnerName: poll.spinWinnerName ?? null,
      spinRevealedAt: poll.spinRevealedAt ?? null,
      spinLatestNumber: poll.spinLatestNumber ?? null,
      spinLatestPrize: poll.spinLatestPrize ?? null,
      revealWinner: poll.revealWinner,
      showOnResults: poll.showOnResults,
      maxVotes: poll.maxVotes ?? 3,
      votingEndsAt: poll.votingEndsAt ?? null,
    },
    candidates,
    top,
  });
}

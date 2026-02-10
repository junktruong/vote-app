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
      status: poll.status ?? "OPEN",
      revealState: poll.revealState ?? "NOT_STARTED",
      countdownStartedAt: poll.countdownStartedAt ?? null,
      countdownDurationSec: poll.countdownDurationSec ?? 180,
      spinState: poll.spinState ?? "IDLE",
      spinWinnerId: poll.spinWinnerId ?? null,
      spinWinnerName: poll.spinWinnerName ?? null,
      spinRevealedAt: poll.spinRevealedAt ?? null,
      spinConfigSpecial: poll.spinConfigSpecial ?? null,
      spinConfigFirst: poll.spinConfigFirst ?? null,
      spinConfigSecond: poll.spinConfigSecond ?? [],
      spinConfigThird: poll.spinConfigThird ?? [],
      spinLatestNumber: poll.spinLatestNumber ?? null,
      spinLatestPrize: poll.spinLatestPrize ?? null,
      receiptSpinState: poll.receiptSpinState ?? "IDLE",
      receiptSpinNumber: poll.receiptSpinNumber ?? null,
      receiptSpinRevealedAt: poll.receiptSpinRevealedAt ?? null,
      viewMode: poll.viewMode ?? "RESULTS",
      revealWinner: poll.revealWinner,
      showOnResults: poll.showOnResults,
      maxVotes: poll.maxVotes ?? 3,
      candidateCount: poll.candidates?.length ?? 0,
      votingEndsAt: poll.votingEndsAt ?? null,
      createdAt: poll.createdAt,
    })),
  });
}

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

const BASE_THIRD_LIMIT = 3;
const BASE_ENCOURAGE_LIMIT = 5;
const FIXED_LUCKY_PRIZE_COUNT = 4; // 1 đặc biệt + 1 nhất + 2 nhì

function normalizeLimit(value: unknown, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const polls = await Poll.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    polls: polls.map((poll) => {
      const spinHistory = Array.isArray(poll.spinHistory) ? poll.spinHistory : [];
      const spinDrawnCount = Array.isArray(poll.spinDrawnNumbers)
        ? poll.spinDrawnNumbers.length
        : spinHistory.length;
      const spinThirdLimit = normalizeLimit(poll.spinThirdLimit, BASE_THIRD_LIMIT);
      const spinEncourageLimit = normalizeLimit(poll.spinEncourageLimit, BASE_ENCOURAGE_LIMIT);
      const spinTotalPrizeCount = FIXED_LUCKY_PRIZE_COUNT + spinThirdLimit + spinEncourageLimit;
      const spinFirstDrawnCount = spinHistory.reduce((count: number, item: { prize?: unknown }) => {
        return item?.prize === "Giải nhất" ? count + 1 : count;
      }, 0);
      const spinSecondDrawnCount = spinHistory.reduce((count: number, item: { prize?: unknown }) => {
        return item?.prize === "Giải nhì" ? count + 1 : count;
      }, 0);
      return {
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
        spinThirdIndex: poll.spinThirdIndex ?? 0,
        spinEncourageCount: poll.spinEncourageCount ?? 0,
        spinFirstDrawnCount: Math.min(spinFirstDrawnCount, 1),
        spinSecondDrawnCount: Math.min(spinSecondDrawnCount, 2),
        spinDrawnCount: Math.min(spinDrawnCount, spinTotalPrizeCount),
        spinThirdLimit,
        spinEncourageLimit,
        spinTotalPrizeCount,
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
      };
    }),
  });
}

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import { isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const pollId = (await params).id;

  await Vote.deleteMany({ pollId });

  const poll = await Poll.findByIdAndUpdate(
    pollId,
    {
      revealState: "NOT_STARTED",
      countdownStartedAt: null,
      countdownDurationSec: 180,
      revealWinner: false,
      spinState: "IDLE",
      spinWinnerId: null,
      spinWinnerName: null,
      spinRevealedAt: null,
      spinConfigSpecial: null,
      spinConfigFirst: null,
      spinConfigSecond: [],
      spinConfigThird: [],
      spinDrawnNumbers: [],
      spinHistory: [],
      spinSecondIndex: 0,
      spinThirdIndex: 0,
      spinEncourageCount: 0,
      spinThirdLimit: 3,
      spinEncourageLimit: 5,
      spinLatestNumber: null,
      spinLatestPrize: null,
      viewMode: "RESULTS",
      receiptSpinState: "IDLE",
      receiptSpinNumber: null,
      receiptSpinRevealedAt: null,
    },
    { new: true }
  );

  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

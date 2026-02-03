import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  await dbConnect();
  const pollId = (await params).id;

  const poll = await Poll.findById(pollId);
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  if (poll.revealState === "NOT_STARTED") {
    poll.revealState = "COUNTING";
    poll.countdownStartedAt = new Date();
    if (!Number.isFinite(Number(poll.countdownDurationSec))) {
      poll.countdownDurationSec = 180;
    }
    await poll.save();
  }

  return NextResponse.json({
    ok: true,
    revealState: poll.revealState,
    countdownStartedAt: poll.countdownStartedAt,
    countdownDurationSec: poll.countdownDurationSec ?? 180,
  });
}

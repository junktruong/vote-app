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
    const durationSec = Number.isFinite(Number(poll.countdownDurationSec)) ? Number(poll.countdownDurationSec) : 180;
    const now = Date.now();
    poll.revealState = "COUNTING";
    poll.countdownStartedAt = new Date();
    poll.countdownDurationSec = durationSec;
    poll.status = "OPEN";
    poll.isActive = true;
    poll.endedAt = null;
    poll.votingEndsAt = new Date(now + durationSec * 1000);
    poll.viewMode = "RESULTS";
    await poll.save();
  }

  return NextResponse.json({
    ok: true,
    revealState: poll.revealState,
    countdownStartedAt: poll.countdownStartedAt,
    countdownDurationSec: poll.countdownDurationSec ?? 180,
  });
}

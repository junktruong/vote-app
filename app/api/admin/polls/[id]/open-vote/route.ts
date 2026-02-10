import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const pollId = (await params).id;
  const poll = await Poll.findById(pollId);
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  const durationSec = Number.isFinite(Number(poll.countdownDurationSec)) ? Number(poll.countdownDurationSec) : 180;
  const votingEndsAt = new Date(Date.now() + durationSec * 1000);

  await Poll.updateMany({ isActive: true }, { $set: { isActive: false, endedAt: new Date() } });

  poll.isActive = true;
  poll.status = "OPEN";
  poll.endedAt = null;
  poll.votingEndsAt = votingEndsAt;
  poll.viewMode = "RESULTS";
  await poll.save();

  return NextResponse.json({ ok: true, votingEndsAt });
}

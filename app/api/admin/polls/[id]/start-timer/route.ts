import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const pollId = (await params).id;
  const payload = await req.json().catch(() => null);
  const minutes = Number(payload?.minutes);
  if (!Number.isFinite(minutes) || minutes < 1) {
    return NextResponse.json({ error: "Thời lượng không hợp lệ." }, { status: 400 });
  }

  const votingEndsAt = new Date(Date.now() + minutes * 60 * 1000);
  const poll = await Poll.findByIdAndUpdate(pollId, { votingEndsAt }, { new: true });
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  return NextResponse.json({ ok: true, votingEndsAt });
}

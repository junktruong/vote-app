import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!poll) return NextResponse.json({ error: "Không có poll đang chạy." }, { status: 400 });

  poll.isActive = false;
  poll.status = "CLOSED";
  poll.endedAt = new Date();
  await poll.save();

  return NextResponse.json({ ok: true });
}

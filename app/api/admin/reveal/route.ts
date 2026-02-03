import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const poll =
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }));

  if (!poll) return NextResponse.json({ error: "Chưa có poll." }, { status: 400 });

  poll.revealWinner = true;
  poll.revealState = "REVEALED";
  await poll.save();

  return NextResponse.json({ ok: true });
}

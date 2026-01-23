import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const { title, candidateUserIds } = await req.json();
  if (!title || !Array.isArray(candidateUserIds) || candidateUserIds.length < 2) {
    return NextResponse.json({ error: "Cần tiêu đề và ít nhất 2 ứng viên." }, { status: 400 });
  }

  // chỉ 1 poll active
  await Poll.updateMany({ isActive: true }, { $set: { isActive: false, endedAt: new Date() } });

  const poll = await Poll.create({
    title: String(title).trim(),
    isActive: true,
    revealWinner: false,
    candidateUserIds,
  });

  return NextResponse.json({ ok: true, pollId: String(poll._id) });
}

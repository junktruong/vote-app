import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import crypto from "crypto";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const { title, candidateNames, maxVotes } = await req.json();
  const names = Array.isArray(candidateNames)
    ? candidateNames.map((name: string) => String(name || "").trim()).filter(Boolean)
    : [];
  const uniqueNames = Array.from(new Set(names.map((name) => name)));
  if (!title || uniqueNames.length < 2) {
    return NextResponse.json({ error: "Cần tiêu đề và ít nhất 2 ứng viên." }, { status: 400 });
  }

  // chỉ 1 poll active
  await Poll.updateMany({ isActive: true }, { $set: { isActive: false, endedAt: new Date() } });
  await Poll.updateMany({ showOnResults: true }, { $set: { showOnResults: false } });

  const poll = await Poll.create({
    title: String(title).trim(),
    isActive: true,
    revealWinner: false,
    showOnResults: true,
    maxVotes: Number.isFinite(Number(maxVotes)) ? Math.max(1, Number(maxVotes)) : 3,
    candidates: uniqueNames.map((name) => ({ id: crypto.randomUUID(), name })),
  });

  return NextResponse.json({ ok: true, pollId: String(poll._id) });
}

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/auth";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";

export async function POST(req: Request) {
  await dbConnect();
  const userId = getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { candidateUserId } = await req.json();
  const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (!poll) return NextResponse.json({ error: "Không có cuộc bình chọn đang diễn ra." }, { status: 400 });

  const okCandidate = poll.candidateUserIds.some((id: any) => String(id) === String(candidateUserId));
  if (!okCandidate) return NextResponse.json({ error: "Ứng viên không hợp lệ." }, { status: 400 });

  try {
    await Vote.create({ pollId: poll._id, voterUserId: userId, candidateUserId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Bạn đã bình chọn rồi (mỗi poll 1 lần)." }, { status: 400 });
  }
}

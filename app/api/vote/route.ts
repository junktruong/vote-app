import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/auth";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";

export async function POST(req: Request) {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { candidateUserId, candidateUserIds } = await req.json();
  const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (!poll) return NextResponse.json({ error: "Không có cuộc bình chọn đang diễn ra." }, { status: 400 });

  const incomingIds = Array.isArray(candidateUserIds) ? candidateUserIds : [candidateUserId];
  const uniqueIds = Array.from(new Set(incomingIds.filter(Boolean).map((id: string) => String(id))));
  if (uniqueIds.length === 0) return NextResponse.json({ error: "Chưa chọn ứng viên." }, { status: 400 });

  const maxVotes = Number.isFinite(Number(poll.maxVotes)) ? Number(poll.maxVotes) : 3;
  if (uniqueIds.length > maxVotes) {
    return NextResponse.json({ error: `Bạn chỉ được chọn tối đa ${maxVotes} ứng viên.` }, { status: 400 });
  }

  const okCandidates = uniqueIds.every((id) => poll.candidateUserIds.some((c: any) => String(c) === id));
  if (!okCandidates) return NextResponse.json({ error: "Ứng viên không hợp lệ." }, { status: 400 });

  const existingCount = await Vote.countDocuments({ pollId: poll._id, voterUserId: userId });
  if (existingCount + uniqueIds.length > maxVotes) {
    return NextResponse.json({ error: "Bạn đã bình chọn đủ lượt cho poll này." }, { status: 400 });
  }

  const existingCandidates = await Vote.find({
    pollId: poll._id,
    voterUserId: userId,
    candidateUserId: { $in: uniqueIds },
  }).lean();
  if (existingCandidates.length > 0) {
    return NextResponse.json({ error: "Bạn đã bình chọn ứng viên này rồi." }, { status: 400 });
  }

  try {
    await Vote.insertMany(uniqueIds.map((id) => ({ pollId: poll._id, voterUserId: userId, candidateUserId: id })));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Không thể ghi nhận bình chọn." }, { status: 400 });
  }
}

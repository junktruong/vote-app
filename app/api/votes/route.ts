import { NextRequest, NextResponse } from "next/server";

import {
  CURRENT_POLL_ID,
  getCandidateById,
  getVoteForUser,
  recordVote,
} from "@/app/lib/votes";

const getUserId = (request: NextRequest) =>
  request.headers.get("x-user-id") ?? request.cookies.get("user_id")?.value ?? "";

export const GET = async (request: NextRequest) => {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ authenticated: false, hasVoted: false });
  }

  const vote = getVoteForUser(CURRENT_POLL_ID, userId);

  return NextResponse.json({
    authenticated: true,
    hasVoted: Boolean(vote),
    vote,
  });
};

export const POST = async (request: NextRequest) => {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { message: "Người dùng chưa đăng nhập." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { candidateId?: string };
  const candidateId = body?.candidateId?.trim();

  if (!candidateId) {
    return NextResponse.json(
      { message: "Ứng viên không hợp lệ." },
      { status: 400 },
    );
  }

  if (!getCandidateById(candidateId)) {
    return NextResponse.json(
      { message: "Ứng viên không tồn tại." },
      { status: 404 },
    );
  }

  const result = recordVote(CURRENT_POLL_ID, userId, candidateId);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Bạn đã bỏ phiếu trong cuộc bình chọn này.",
        vote: result.vote,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, vote: result.vote });
};

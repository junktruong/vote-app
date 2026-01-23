import { NextResponse } from "next/server";

import { getResults, revealResults, stopVoting } from "@/app/lib/voteStore";

type AdminPayload = {
  action?: "stop" | "reveal";
};

export const POST = async (request: Request) => {
  const body = (await request.json()) as AdminPayload;

  if (body.action === "stop") {
    stopVoting();
  } else if (body.action === "reveal") {
    revealResults();
  } else {
    return NextResponse.json(
      { message: "Hành động không hợp lệ." },
      { status: 400 },
    );
  }

  return NextResponse.json(getResults());
};

import { NextResponse } from "next/server";

import { candidates, CURRENT_POLL_ID } from "@/app/lib/votes";

export const GET = async () =>
  NextResponse.json({
    pollId: CURRENT_POLL_ID,
    candidates,
  });

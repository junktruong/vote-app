import { NextResponse } from "next/server";

import { getResults } from "@/app/lib/voteStore";

export const dynamic = "force-dynamic";

export const GET = () => {
  const results = getResults();

  return NextResponse.json(results);
};

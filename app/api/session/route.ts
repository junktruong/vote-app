import { NextResponse } from "next/server";
import { getUserIdFromAccessToken, setUserSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const userId = accessToken ? getUserIdFromAccessToken(accessToken) : null;

  if (!userId) {
    return NextResponse.json({ error: "Access token không hợp lệ." }, { status: 401 });
  }

  await setUserSession(userId);
  return NextResponse.json({ ok: true });
}

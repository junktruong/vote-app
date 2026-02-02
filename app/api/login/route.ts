import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createAccessToken, setUserSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const payload = await req.json().catch(() => null);
  const fullName = String(payload?.fullName || "").trim();
  if (!fullName) {
    return NextResponse.json({ error: "Vui lòng nhập tên." }, { status: 400 });
  }
  if (fullName.length > 60) {
    return NextResponse.json({ error: "Tên không được vượt quá 60 ký tự." }, { status: 400 });
  }

  let user = await User.findOne({ fullName });
  if (!user) {
    user = await User.create({ fullName });
  }

  await setUserSession(String(user._id));
  return NextResponse.json({ ok: true, accessToken: createAccessToken(String(user._id)) });
}

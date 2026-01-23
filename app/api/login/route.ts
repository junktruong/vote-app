import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getOrSetDeviceId, setUserSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const deviceId = await getOrSetDeviceId();
  const { username } = await req.json();

  const u = await User.findOne({ username: String(username || "").trim(), deviceId }).lean();
  if (!u) return NextResponse.json({ error: "Sai username hoặc không đúng máy đã tạo." }, { status: 400 });

  await setUserSession(String(u._id));
  return NextResponse.json({ ok: true });
}

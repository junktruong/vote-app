import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getOrSetDeviceId, setUserSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const deviceId = await getOrSetDeviceId();

  const u = await User.findOne({ deviceId }).lean();
  if (!u) {
    return NextResponse.json({ error: "Máy này chưa tạo tài khoản. Vui lòng đăng ký trước." }, { status: 400 });
  }

  await setUserSession(String(u._id));
  return NextResponse.json({ ok: true });
}

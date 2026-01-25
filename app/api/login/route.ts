import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createAccessToken, getOrSetDeviceId, setUserSession } from "@/lib/auth";
import { getClientIp } from "@/lib/request";

export async function POST(req: Request) {
  await dbConnect();
  const deviceId = await getOrSetDeviceId();
  const clientIp = await getClientIp();

  let user = await User.findOne({ deviceId });
  if (!user && clientIp) {
    user = await User.findOne({ lastKnownIp: clientIp });
    if (user) {
      user.deviceId = deviceId;
      user.lastKnownIp = clientIp;
      await user.save();
    }
  } else if (user && clientIp && user.lastKnownIp !== clientIp) {
    user.lastKnownIp = clientIp;
    await user.save();
  }

  if (!user) {
    return NextResponse.json({ error: "Máy này chưa tạo tài khoản. Vui lòng đăng ký trước." }, { status: 400 });
  }

  await setUserSession(String(user._id));
  return NextResponse.json({ ok: true, accessToken: createAccessToken(String(user._id)) });
}

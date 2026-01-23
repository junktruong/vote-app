import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getOrSetDeviceId, setUserSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const deviceId = await getOrSetDeviceId();

  const form = await req.formData();
  const fullName = String(form.get("fullName") || "").trim();
  const username = String(form.get("username") || "").trim();
  const photoUrl = String(form.get("photoUrl") || "").trim();

  if (!fullName || !username || !photoUrl) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "Username chỉ gồm a-z A-Z 0-9 _ . (3-30 ký tự)" }, { status: 400 });
  }

  const existedDevice = await User.findOne({ deviceId }).lean();
  if (existedDevice) return NextResponse.json({ error: "Máy này đã tạo tài khoản rồi." }, { status: 400 });

  try {
    const user = await User.create({ fullName, username, photoUrl, deviceId });
    await setUserSession(String(user._id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Username đã tồn tại hoặc lỗi hệ thống." }, { status: 400 });
  }
}

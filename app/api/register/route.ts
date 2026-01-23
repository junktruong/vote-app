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
  const photoFile = form.get("photo");

  if (!fullName || !username || !photoFile) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "Username chỉ gồm a-z A-Z 0-9 _ . (3-30 ký tự)" }, { status: 400 });
  }
  if (!(photoFile instanceof File)) {
    return NextResponse.json({ error: "Ảnh đại diện không hợp lệ." }, { status: 400 });
  }

  const existedDevice = await User.findOne({ deviceId }).lean();
  if (existedDevice) return NextResponse.json({ error: "Máy này đã tạo tài khoản rồi." }, { status: 400 });

  const apiKey = process.env.IMGBB_API_KEY ?? "5a3bdb946de1c12c9e08eceab90e406f";
  const uploadForm = new FormData();
  uploadForm.append("image", photoFile);

  let photoUrl = "";
  try {
    const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();
    photoUrl = uploadData?.data?.url || "";
    if (!uploadRes.ok || !photoUrl) {
      return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
  }

  try {
    const user = await User.create({ fullName, username, photoUrl, deviceId });
    await setUserSession(String(user._id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Username đã tồn tại hoặc lỗi hệ thống." }, { status: 400 });
  }
}

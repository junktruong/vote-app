import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getOrSetDeviceId, setUserSession } from "@/lib/auth";
import { getClientIp } from "@/lib/request";

export async function POST(req: Request) {
  await dbConnect();
  const deviceId = await getOrSetDeviceId();
  const clientIp = await getClientIp();

  const form = await req.formData();
  const fullName = String(form.get("fullName") || "").trim();
  const photoFile = form.get("photo");

  if (!fullName || !photoFile) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  if (!(photoFile instanceof File)) {
    return NextResponse.json({ error: "Ảnh đại diện không hợp lệ." }, { status: 400 });
  }

  const existedDevice = await User.findOne({ deviceId }).lean();
  if (existedDevice) return NextResponse.json({ error: "Máy này đã tạo tài khoản rồi." }, { status: 400 });

  if (clientIp) {
    const existedIp = await User.findOne({ lastKnownIp: clientIp }).lean();
    if (existedIp) {
      return NextResponse.json(
        { error: "IP này đã tạo tài khoản rồi. Vui lòng đăng nhập trên máy đó." },
        { status: 400 }
      );
    }
  }

  const apiKey = process.env.IMGBB_API_KEY ?? "5a3bdb946de1c12c9e08eceab90e406f";
  const uploadForm = new FormData();
  uploadForm.append("image", photoFile);

  let thumb = "";
  let photo = "";
  try {
    const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();

    thumb = uploadData?.data?.thumb?.url || "";
    photo = uploadData?.data?.url || "";
    if (!uploadRes.ok || !thumb || !photo) {
      return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
  }

  try {
    const user = await User.create({ fullName, thumb, photo, deviceId, lastKnownIp: clientIp || undefined });
    await setUserSession(String(user._id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.log("error : ", e.message);

    return NextResponse.json({ error: "Không thể tạo tài khoản. Vui lòng thử lại." }, { status: 400 });
  }
}

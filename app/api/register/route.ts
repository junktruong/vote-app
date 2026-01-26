import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createAccessToken, getOrSetDeviceId, setUserSession } from "@/lib/auth";
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

  // ✅ Upload lên PHP server (direct link)
  let photo = "";
  let thumb = "";

  try {
    const uploadForm = new FormData();
    // IMPORTANT: PHP endpoint nhận field name là "file"
    uploadForm.append("file", photoFile);

    // Bạn có thể đưa URL này vào ENV: PHP_UPLOAD_URL
    const uploadUrl = process.env.PHP_UPLOAD_URL || "https://truongdat.id.vn/api/upload.php";

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: uploadForm,
      // headers: { "Authorization": "Bearer YOUR_SECRET" }, // nếu bạn bật auth ở PHP
    });

    const uploadData = await uploadRes.json().catch(() => ({} as any));

    photo = uploadData?.url || "";
    thumb = photo; // nếu chưa tạo thumbnail riêng thì dùng tạm photo

    if (!uploadRes.ok || !uploadData?.ok || !photo) {
      return NextResponse.json(
        { error: uploadData?.error || "Không thể tải ảnh lên." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
  }

  try {
    const user = await User.create({
      fullName,
      thumb,
      photo,
      deviceId,
      lastKnownIp: clientIp || undefined,
    });

    await setUserSession(String(user._id));

    return NextResponse.json({
      ok: true,
      accessToken: createAccessToken(String(user._id)),
    });
  } catch (e: any) {
    console.log("error : ", e.message);
    return NextResponse.json({ error: "Không thể tạo tài khoản. Vui lòng thử lại." }, { status: 400 });
  }
}

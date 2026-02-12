import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createAccessToken, setUserSession } from "@/lib/auth";

type UploadResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

export async function POST(req: Request) {
  await dbConnect();

  const form = await req.formData();
  const fullName = String(form.get("fullName") || "").trim();
  const photoFile = form.get("photo");

  if (!fullName) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  if (fullName.length > 60) {
    return NextResponse.json({ error: "Tên không được vượt quá 60 ký tự." }, { status: 400 });
  }

  // ✅ Upload lên PHP server (direct link)
  let photo = "";
  let thumb = "";

  if (photoFile instanceof File) {
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

      const uploadData: UploadResponse = await uploadRes.json().catch(() => ({}));

      photo = uploadData?.url || "";
      thumb = photo; // nếu chưa tạo thumbnail riêng thì dùng tạm photo

      if (!uploadRes.ok || !uploadData?.ok || !photo) {
        return NextResponse.json(
          { error: uploadData?.error || "Không thể tải ảnh lên." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
    }
  }

  try {
    const user = await User.create({ fullName, thumb: thumb || undefined, photo: photo || undefined });

    await setUserSession(String(user._id));

    return NextResponse.json({
      ok: true,
      accessToken: createAccessToken(String(user._id)),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    console.log("error : ", message);
    return NextResponse.json({ error: "Không thể tạo tài khoản. Vui lòng thử lại." }, { status: 400 });
  }
}

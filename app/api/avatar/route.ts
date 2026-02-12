import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

type UploadResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

export async function POST(req: Request) {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const form = await req.formData();
  const photoFile = form.get("photo");
  if (!(photoFile instanceof File)) {
    return NextResponse.json({ error: "Ảnh đại diện không hợp lệ." }, { status: 400 });
  }

  try {
    const uploadForm = new FormData();
    uploadForm.append("file", photoFile);

    const uploadUrl = process.env.PHP_UPLOAD_URL || "https://truongdat.id.vn/api/upload.php";

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: uploadForm,
    });

    const uploadData: UploadResponse = await uploadRes.json().catch(() => ({}));
    const photo = uploadData?.url || "";
    const thumb = photo;
    if (!uploadRes.ok || !uploadData?.ok || !photo) {
      return NextResponse.json({ error: uploadData?.error || "Không thể tải ảnh lên." }, { status: 400 });
    }

    await User.findByIdAndUpdate(userId, { thumb, photo });
    return NextResponse.json({ ok: true, thumb, photo });
  } catch {
    return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
  }
}

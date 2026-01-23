import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const form = await req.formData();
  const photoFile = form.get("photo");
  if (!(photoFile instanceof File)) {
    return NextResponse.json({ error: "Ảnh đại diện không hợp lệ." }, { status: 400 });
  }

  const apiKey = process.env.IMGBB_API_KEY ?? "5a3bdb946de1c12c9e08eceab90e406f";
  const uploadForm = new FormData();
  uploadForm.append("image", photoFile);

  try {
    const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();

    const thumb = uploadData?.data?.thumb?.url || "";
    const photo = uploadData?.data?.url || "";
    if (!uploadRes.ok || !thumb || !photo) {
      return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
    }

    await User.findByIdAndUpdate(userId, { thumb, photo, photoUrl: thumb });
    return NextResponse.json({ ok: true, thumb, photo });
  } catch (error) {
    return NextResponse.json({ error: "Không thể tải ảnh lên." }, { status: 400 });
  }
}

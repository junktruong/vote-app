import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ user: null });

  const u = await User.findById(userId).select("fullName username thumb photo photoUrl").lean();
  return NextResponse.json({
    user: u
      ? { ...u, _id: String(u._id), thumb: u.thumb || u.photo || u.photoUrl, photo: u.photo || u.thumb || u.photoUrl }
      : null,
  });
}
export async function PATCH(req: Request) {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const payload = await req.json().catch(() => null);
  const fullName = String(payload?.fullName || "").trim();
  if (!fullName) {
    return NextResponse.json({ error: "Vui lòng nhập tên hợp lệ." }, { status: 400 });
  }
  if (fullName.length > 60) {
    return NextResponse.json({ error: "Tên không được vượt quá 60 ký tự." }, { status: 400 });
  }

  const updated = await User.findByIdAndUpdate(userId, { fullName }, { new: true })
    .select("fullName")
    .lean();

  return NextResponse.json({ ok: true, fullName: updated?.fullName || fullName });
}


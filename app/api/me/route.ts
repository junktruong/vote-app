import { NextRequest, NextResponse } from "next/server";
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

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json().catch(() => ({}));
  const fullName = typeof payload?.fullName === "string" ? payload.fullName.trim() : "";

  if (!fullName) {
    return NextResponse.json({ error: "Tên không hợp lệ." }, { status: 400 });
  }
  if (fullName.length > 60) {
    return NextResponse.json({ error: "Tên quá dài (tối đa 60 ký tự)." }, { status: 400 });
  }

  const u = await User.findByIdAndUpdate(
    userId,
    { $set: { fullName } },
    { new: true, runValidators: true }
  )
    .select("fullName username thumb photo photoUrl")
    .lean();

  return NextResponse.json({
    user: u
      ? { ...u, _id: String(u._id), thumb: u.thumb || u.photo || u.photoUrl, photo: u.photo || u.thumb || u.photoUrl }
      : null,
  });
}

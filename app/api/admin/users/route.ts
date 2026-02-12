import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();
  const users = await User.find({}).select("fullName username thumb photo photoUrl").sort({ createdAt: -1 }).lean();

  type UserRow = {
    _id: unknown;
    fullName?: string;
    username?: string;
    thumb?: string;
    photo?: string;
    photoUrl?: string;
  };

  return NextResponse.json({
    users: (users as UserRow[]).map((u) => ({
      id: String(u._id),
      fullName: u.fullName,
      username: u.username,
      thumb: u.thumb || u.photo || u.photoUrl,
      photo: u.photo || u.thumb || u.photoUrl,
    })),
  });
}

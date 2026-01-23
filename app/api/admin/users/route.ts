import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();
  const users = await User.find({}).select("fullName username photoUrl").sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    users: users.map((u: any) => ({ id: String(u._id), fullName: u.fullName, username: u.username, photoUrl: u.photoUrl })),
  });
}

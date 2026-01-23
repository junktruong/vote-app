import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ user: null });

  const u = await User.findById(userId).select("fullName username photoUrl").lean();
  return NextResponse.json({ user: u ? { ...u, _id: String(u._id) } : null });
}

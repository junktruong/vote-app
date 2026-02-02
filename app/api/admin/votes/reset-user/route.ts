import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const payload = await req.json().catch(() => null);
  const userId = String(payload?.userId || "").trim();
  if (!userId) return NextResponse.json({ error: "Thiếu userId." }, { status: 400 });

  const poll =
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 }).lean()) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }).lean());
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  await Vote.deleteMany({ pollId: poll._id, voterUserId: userId });
  return NextResponse.json({ ok: true });
}

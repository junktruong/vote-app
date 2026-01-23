import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Vote from "@/models/Vote";
import { isAdmin } from "@/lib/auth";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  await Vote.deleteMany({ pollId: params.id });
  return NextResponse.json({ ok: true });
}

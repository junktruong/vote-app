import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Sai mật khẩu admin." }, { status: 400 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}

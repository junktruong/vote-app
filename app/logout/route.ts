import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export async function GET(req: Request) {
  await clearUserSession();
  const url = new URL(req.url);
  url.pathname = "/";
  url.searchParams.set("logged_out", "1");
  return NextResponse.redirect(url);
}
    

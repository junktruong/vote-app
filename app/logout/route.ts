import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export async function GET() {
  await clearUserSession();
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}
    

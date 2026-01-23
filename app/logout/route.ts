import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export async function GET() {
  clearUserSession();
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}
    
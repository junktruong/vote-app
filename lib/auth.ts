import crypto from "crypto";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET!;
const DEVICE_COOKIE = "device_id";
const SESSION_COOKIE = "session"; // chứa userId đã ký
const ADMIN_COOKIE = "admin";     // chứa "1" đã ký

function hmac(data: string) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("hex");
}
function sign(value: string) {
  return `${value}.${hmac(value)}`;
}
function verify(signed: string | undefined | null) {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  return hmac(value) === sig ? value : null;
}

export async function getOrSetDeviceId() { 
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomBytes(16).toString("hex");
  jar.set(DEVICE_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 * 5 });
  return id;
}

export async function setUserSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(userId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function getUserIdFromSession() {
  const jar = await cookies();
  return verify(jar.get(SESSION_COOKIE)?.value) ?? null;
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign("1"), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
}

export async function isAdmin() {
  const jar = await cookies();
  return verify(jar.get(ADMIN_COOKIE)?.value) === "1";
}

import { headers } from "next/headers";

export async function getClientIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  return headerList.get("x-real-ip") ?? "";
}

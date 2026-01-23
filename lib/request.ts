import { headers } from "next/headers";

export function getClientIp() {
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  return headerList.get("x-real-ip") ?? "";
}

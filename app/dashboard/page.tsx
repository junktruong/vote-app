import Link from "next/link";

export default async function Dashboard() {
  const meRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/me`, { cache: "no-store" }).catch(()=>null);

  // Nếu deploy Vercel bạn không cần NEXT_PUBLIC_BASE_URL; cách đơn giản hơn là dùng client.
  // Để nhanh: cho phép render basic links.
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>
      <p>
        <Link href="/vote">Đi bình chọn</Link> • <Link href="/results">Xem kết quả</Link> • <Link href="/admin">Admin</Link> •{" "}
        <Link href="/logout">Logout</Link>
      </p>
      <p style={{ opacity: 0.8 }}>Trang kết quả tự refresh 2s/lần.</p>
    </main>
  );
}

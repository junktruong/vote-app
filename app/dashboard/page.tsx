import Link from "next/link";
import AvatarPanel from "./avatar-panel";

export default async function Dashboard() {
  const meRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/me`, { cache: "no-store" }).catch(()=>null);

  // Nếu deploy Vercel bạn không cần NEXT_PUBLIC_BASE_URL; cách đơn giản hơn là dùng client.
  // Để nhanh: cho phép render basic links.
  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-14">
          <header className="rounded-3xl border border-red-100 bg-white/85 p-6 shadow-md">
            <p className="text-sm font-semibold text-red-700">Tết an khang</p>
            <h1 className="mt-3 text-3xl font-bold text-red-700">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Trang kết quả tự refresh 2s/lần.</p>
          </header>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-yellow-100 bg-white/95 p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Điều hướng nhanh</h2>
              <p className="mt-2 text-sm text-slate-600">Chọn một hành động để tiếp tục trải nghiệm Tết.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="rounded-full bg-[#D32F2F] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B71C1C]" href="/vote">
                  Đi bình chọn
                </Link>
                <Link className="rounded-full bg-[#FBC02D] px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-[#F9A825]" href="/results">
                  Xem kết quả
                </Link>
                <Link className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50" href="/admin">
                  Admin
                </Link>
                <Link className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50" href="/logout">
                  Logout
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
              <h2 className="text-lg font-semibold text-red-700">Không khí Tết</h2>
              <p className="mt-2 text-sm text-slate-600">
                Duy trì tinh thần rộn ràng với giao diện sáng sủa, gọn gàng và nổi bật sắc đỏ may mắn.
              </p>
              <div className="mt-5 rounded-2xl border border-yellow-200 bg-[#FFF7D1] p-4 text-sm text-slate-700">
                Ưu tiên thao tác nhanh: bình chọn, xem bảng xếp hạng và cập nhật kết quả thời gian thực.
              </div>
            </div>
          </section>

          <AvatarPanel />
        </div>
      </div>
    </main>
  );
}

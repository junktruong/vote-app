import Link from "next/link";
import AvatarPanel from "./avatar-panel";

export default async function Dashboard() {
const meRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/me`, { cache: "no-store" }).catch(() => null);

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900 selection:bg-red-100">
      {/* Background nhẹ nhàng hơn */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,192,45,0.1),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(211,47,47,0.1),_transparent_40%)]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* HEADER: Gồm Chào mừng + Avatar */}
        <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-red-600">
              Xuân Ất Tỵ 2025
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              Dashboard
            </h1>
          </div>
          {/* AvatarPanel đưa lên đây cho hợp lý */}
          <div className="flex-shrink-0">
             <AvatarPanel />
          </div>
        </header>

        {/* MAIN ACTIONS GRID */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Bình chọn (Quan trọng nhất - Màu đỏ) */}
          <Link 
            href="/vote"
            className="group relative overflow-hidden rounded-3xl bg-red-600 p-6 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-all group-hover:scale-150" />
            <h3 className="relative text-xl font-bold">Đi bình chọn</h3>
            <p className="relative mt-2 text-red-100 text-sm">
              Tham gia bình chọn ngay cho các hạng mục Tết.
            </p>
            <div className="relative mt-4 inline-flex items-center text-sm font-semibold text-white group-hover:underline">
              Bắt đầu ngay &rarr;
            </div>
          </Link>

          {/* Card 2: Xem kết quả (Quan trọng nhì - Màu vàng) */}
          <Link 
            href="/results"
            className="group relative overflow-hidden rounded-3xl bg-yellow-400 p-6 text-slate-900 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 transition-all group-hover:scale-150" />
            <h3 className="relative text-xl font-bold">Xem kết quả</h3>
            <p className="relative mt-2 text-slate-800 text-sm">
              Cập nhật bảng xếp hạng thời gian thực.
            </p>
            <div className="relative mt-4 inline-flex items-center text-sm font-semibold text-slate-900 group-hover:underline">
              Xem chi tiết &rarr;
            </div>
          </Link>

          {/* Các tác vụ phụ: Admin & Logout gộp vào cột hoặc để riêng tùy số lượng */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            {/* Admin Link */}
            <Link 
              href="/admin"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50"
            >
              <div>
                <h3 className="font-semibold text-slate-900">Quản trị viên</h3>
                <p className="text-xs text-slate-500">Dành cho BTC</p>
              </div>
              <span className="text-slate-400">⚙️</span>
            </Link>

            {/* Logout Link */}
            <Link 
              href="/logout"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <div>
                <h3 className="font-semibold text-slate-700">Đăng xuất</h3>
              </div>
              <span className="text-slate-400">👋</span>
            </Link>
          </div>

        </section>
      </div>
    </main>
  );
}
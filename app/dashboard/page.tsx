import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/auth"; // Giả sử path này đúng
import AvatarPanel from "./avatar-panel";

export default async function Dashboard() {
  const userId = await getUserIdFromSession();
  
  // Logic verify session
  if (!userId) {
    redirect("/?mode=login");
  }

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900 selection:bg-red-100 font-sans">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient nhẹ tạo khối */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(251,192,45,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(211,47,47,0.08),_transparent_70%)]" />
        {/* Pattern mờ (nếu muốn) */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        
        {/* --- HEADER --- */}
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600 shadow-sm backdrop-blur-sm">
              <span>🌸 Xuân Bính Ngọ 2026</span>
            </div>
            <h1 className="mt-3 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-500 font-medium">
              Chào mừng bạn quay trở lại.
            </p>
          </div>
          
          {/* Avatar Component (Đã tối ưu gọn gàng ở bước trước) */}
          <div className="flex-shrink-0">
             <AvatarPanel />
          </div>
        </header>

        {/* --- MAIN ACTIONS (GRID 2 CỘT) --- */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Card 1: BÌNH CHỌN (Primary) */}
          <Link 
            href="/vote"
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 to-red-700 p-8 text-white shadow-xl shadow-red-900/10 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                {/* Icon Vote Box */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Bắt đầu Bình chọn</h3>
              <p className="mt-2 text-red-100 text-sm font-medium opacity-90">
                Ủng hộ cho các cá nhân và tập thể xuất sắc nhất năm.
              </p>
            </div>
            
            <div className="relative z-10 mt-8 flex items-center text-sm font-bold uppercase tracking-wider">
              Tiến hành ngay <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: KẾT QUẢ (Secondary) */}
          <Link 
            href="/results"
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-8 text-slate-900 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/60"
          >
             <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl transition-all group-hover:bg-yellow-400/30" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                {/* Icon Chart */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Xem Kết quả</h3>
              <p className="mt-2 text-slate-500 text-sm font-medium">
                Theo dõi bảng xếp hạng thời gian thực (Real-time).
              </p>
            </div>

            <div className="relative z-10 mt-8 flex items-center text-sm font-bold uppercase tracking-wider text-slate-900">
              Xem chi tiết <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

        </section>

        {/* --- SECONDARY ACTIONS (UTILITIES) --- */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:flex md:justify-center">
          
          <Link 
            href="/admin"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Quản trị viên</span>
          </Link>

          <Link 
            href="/logout"
            className="flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-slate-100 px-6 py-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Đăng xuất</span>
          </Link>

        </section>

        {/* Footer Text */}
        <div className="mt-12 text-center">
            <p className="text-xs text-slate-400">© 2026 Tet Voting System. Designed for joy.</p>
        </div>

      </div>
    </main>
  );
}
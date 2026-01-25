import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/auth";
import AvatarPanel from "./avatar-panel";

export default async function Dashboard() {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/?mode=login");

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900 selection:bg-red-100 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[radial-gradient(circle_at_center,_rgba(251,192,45,0.08),_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[radial-gradient(circle_at_center,_rgba(211,47,47,0.08),_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
      </div>

      {/* Container chỉnh padding cho mobile */}
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        
        {/* --- HEADER RESPONSIVE --- */}
        {/* Mobile: Flex Column (Căn giữa). Desktop: Flex Row (Space Between) */}
        <header className="mb-8 flex flex-col items-center gap-6 text-center md:mb-12 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600 shadow-sm backdrop-blur-sm">
              <span>🌸 Xuân Bính Ngọ 2026</span>
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl md:text-5xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium sm:text-base">
              Hệ thống bình chọn trực tuyến.
            </p>
          </div>
          
          <div className="flex-shrink-0">
             <AvatarPanel />
          </div>
        </header>

        {/* --- MAIN ACTIONS --- */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          
          <Link 
            href="/vote"
            className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-red-600 to-red-700 p-6 md:p-8 text-white shadow-xl shadow-red-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150 md:h-32 md:w-32" />
            
            <div className="relative z-10">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md md:h-12 md:w-12 md:rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 md:h-6 md:w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold md:text-2xl">Bắt đầu Bình chọn</h3>
              <p className="mt-1 text-red-100 text-xs font-medium opacity-90 md:mt-2 md:text-sm">
                Ủng hộ cho các cá nhân xuất sắc.
              </p>
            </div>
            
            <div className="relative z-10 mt-6 flex items-center text-xs font-bold uppercase tracking-wider md:text-sm">
              Tiến hành ngay <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

          <Link 
            href="/results"
            className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-white p-6 md:p-8 text-slate-900 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
             <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-yellow-400/20 blur-2xl transition-all group-hover:bg-yellow-400/30 md:h-40 md:w-40" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 md:h-12 md:w-12 md:rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 md:h-6 md:w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold md:text-2xl">Xem Kết quả</h3>
              <p className="mt-1 text-slate-500 text-xs font-medium md:mt-2 md:text-sm">
                Bảng xếp hạng thời gian thực.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-slate-900 md:text-sm">
              Xem chi tiết <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

        </section>

        {/* --- SECONDARY ACTIONS --- */}
        <section className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:flex md:justify-center md:gap-4">
          
          <Link 
            href="/admin"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600 shadow-sm transition active:scale-95 md:flex-row md:px-6 md:py-4 md:text-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Quản trị</span>
          </Link>

          <Link 
            href="/logout"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent bg-slate-100 p-4 text-xs font-semibold text-slate-500 transition active:scale-95 md:flex-row md:px-6 md:py-4 md:text-sm hover:bg-slate-200 hover:text-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Đăng xuất</span>
          </Link>

        </section>

        {/* Footer Text */}
        <div className="mt-12 text-center pb-8 md:pb-0">
            <p className="text-[10px] text-slate-400 md:text-xs">© 2026 Tet Voting System.</p>
        </div>

      </div>
    </main>
  );
}
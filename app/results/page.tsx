"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// --- COMPONENT PHÁO HOA (Pure CSS) ---
const Fireworks = () => {
  // Tạo mảng ngẫu nhiên vị trí pháo hoa
  const fireworks = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    left: Math.floor(Math.random() * 80) + 10 + "%",
    top: Math.floor(Math.random() * 50) + 10 + "%",
    delay: Math.random() * 2 + "s",
    color: ["#FFD700", "#FF4444", "#00C851", "#33B5E5"][Math.floor(Math.random() * 4)]
  })), []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="firework-explosion"
          style={{
            left: fw.left,
            top: fw.top,
            animationDelay: fw.delay,
            ["--color" as any]: fw.color,
          }}
        />
      ))}
      <style jsx>{`
        .firework-explosion {
          position: absolute;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          box-shadow: 0 0 0 0 var(--color);
          animation: explode 2s infinite ease-out;
        }
        @keyframes explode {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 var(--color); }
          50% { opacity: 1; }
          100% {
            transform: scale(0);
            opacity: 0;
            box-shadow: 
              -40px -40px 0 var(--color), 40px -40px 0 var(--color), 
              -40px 40px 0 var(--color), 40px 40px 0 var(--color),
              -70px 0 0 var(--color), 70px 0 0 var(--color),
              0 -70px 0 var(--color), 0 70px 0 var(--color);
          }
        }
      `}</style>
    </div>
  );
};

export default function Results() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang cập nhật số liệu...");
  const lastReveal = useRef<boolean | null>(null);
  const r = useRouter();
  const accessTokenKey = "accessToken";

  // --- LOGIC FETCH DATA (GIỮ NGUYÊN) ---
  async function tick() {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const d = await res.json();
      setData(d);
      
      if (!d.poll) setMsg("Chưa có dữ liệu.");
      else if (d.poll.revealWinner) setMsg("CHÚC MỪNG NGƯỜI CHIẾN THẮNG");
      else setMsg("Đang kiểm phiếu trực tiếp...");
      
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let active = true;

    async function start() {
      const token = localStorage.getItem(accessTokenKey);
      if (token) {
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token }),
        }).catch(() => localStorage.removeItem(accessTokenKey));
      }
      
      const res = await fetch("/api/me").catch(() => null);
      if (!res || !res.ok) {
        r.push("/?mode=login");
        return;
      }

      if (active) {
        tick();
        interval = setInterval(tick, 3000); // 3s refresh 1 lần cho đỡ lag hiệu ứng
      }
    }

    start();
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [r]);

  // Hiệu ứng "Bật mí"
  useEffect(() => {
    if (!data?.poll) return;
    // Nếu chuyển từ ẩn -> hiện
    if (lastReveal.current === false && data.poll.revealWinner === true) {
      const el = document.getElementById("winner-card");
      if (el) {
        el.animate(
          [
            { transform: "scale(0.5) translateY(50px)", opacity: 0 },
            { transform: "scale(1.1)", opacity: 1, offset: 0.7 },
            { transform: "scale(1) translateY(0)", opacity: 1 }
          ],
          { duration: 1000, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
        );
      }
    }
    lastReveal.current = !!data.poll.revealWinner;
  }, [data]);


  if (!data) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
    </div>
  );

  const showWinner = data.poll?.revealWinner && data.top;
  // Danh sách Top (loại bỏ người thắng nếu đã hiện)
  const otherCandidates = data.candidates
    ?.sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0))
    .filter((c: any) => showWinner ? c.candidateId !== data.top.candidateId : true) || [];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0F172A] font-sans text-slate-100">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient nền tối sang trọng */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e] via-[#2a0e18] to-[#1a0b0b]" />
        
        {/* Các đốm sáng trang trí */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-yellow-600/20 blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-3xl mix-blend-screen" />
        
        {/* Pattern mờ */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* --- FIREWORKS LAYER (Chỉ hiện khi công bố giải) --- */}
      {showWinner && <Fireworks />}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-12">
        
        {/* HEADER */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-yellow-400 backdrop-blur-sm">
             <span>✨ Kết quả bình chọn ✨</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl drop-shadow-lg">
            {msg}
          </h1>
        </header>

        {/* --- WINNER SECTION (QUÁN QUÂN) --- */}
        <section className="mb-16 flex justify-center">
          {showWinner ? (
            <div id="winner-card" className="relative flex flex-col items-center">
              
              {/* Sunburst Effect Behind Winner */}
              <div className="absolute -inset-[100%] animate-[spin_10s_linear_infinite] opacity-30 pointer-events-none">
                <div className="h-full w-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,#FFD700_40deg,transparent_60deg,transparent_80deg,#FFD700_100deg,transparent_120deg)] mix-blend-overlay blur-xl" />
              </div>

              {/* Crown Icon */}
              <div className="relative z-20 mb-[-1.5rem] animate-bounce">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                   <path d="M2 17L5.5 6L9.5 13L14.5 4L19.5 13L23.5 6L22 17H2Z" fill="url(#paint0_linear)" stroke="#B45309" strokeWidth="1" strokeLinejoin="round"/>
                   <defs>
                     <linearGradient id="paint0_linear" x1="12" y1="4" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                       <stop stopColor="#FDE68A" />
                       <stop offset="1" stopColor="#F59E0B" />
                     </linearGradient>
                   </defs>
                </svg>
              </div>

              {/* Avatar Frame */}
              <div className="relative z-10 group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                <div className="relative h-48 w-48 overflow-hidden rounded-full border-[6px] border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.4)] md:h-64 md:w-64">
                   <div className="flex h-full w-full items-center justify-center bg-slate-900 text-5xl font-black text-yellow-200">
                     {data.top.fullName?.trim()?.slice(0, 1)?.toUpperCase() || "?"}
                   </div>
                </div>
                {/* Badge #1 */}
                <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xl font-bold text-white shadow-lg">
                  1
                </div>
              </div>

              {/* Name & Vote */}
              <div className="relative z-10 mt-6 text-center">
                 <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 sm:text-4xl drop-shadow-sm">
                   {data.top.fullName}
                 </h2>
                 {/* <p className="mt-2 text-lg font-medium text-yellow-100/80">
                   Tổng số phiếu: <span className="text-white font-bold text-xl">{data.top.voteCount}</span>
                 </p> */}
              </div>

            </div>
          ) : (
            /* --- WAITING STATE --- */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
               <div className="mb-4 text-6xl">🫣</div>
               <h3 className="text-xl font-bold text-slate-200">Đang chờ công bố...</h3>
               <p className="text-slate-400 text-sm mt-2">Dữ liệu đang được tổng hợp.</p>
               {/* Thanh bar loading giả lập */}
               <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-full animate-progress origin-left bg-gradient-to-r from-yellow-500 to-red-500" />
               </div>
            </div>
          )}
        </section>

        {/* --- LEADERBOARD SECTION (Các vị trí còn lại) --- */}
        <section className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex items-center gap-4">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
             <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Bảng xếp hạng</span>
             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
          </div>

          <div className="flex flex-col gap-3">
            {otherCandidates.map((c: any, index: number) => {
              // Nếu đã có winner thì rank bắt đầu từ 2, nếu chưa thì từ 1
              const rank = showWinner ? index + 2 : index + 1;
              return (
                <div 
                  key={c.candidateId}
                  className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3 pr-5 transition-all hover:border-white/10 hover:bg-white/10"
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                    rank === 2 ? 'bg-slate-300 text-slate-900' : 
                    rank === 3 ? 'bg-amber-700 text-amber-100' : 
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {rank}
                  </div>
                  
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-100 ring-2 ring-white/10">
                    {c.fullName?.trim()?.slice(0, 1)?.toUpperCase() || "?"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {c.fullName}
                    </h4>
                    {/* Thanh bar vote tỷ lệ */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800">
                       <div 
                         className="h-full rounded-full bg-slate-500 opacity-60" 
                         style={{ width: `${Math.min((c.voteCount / (data.top?.voteCount || 1)) * 100, 100)}%` }} 
                       />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-sm font-bold text-white">{c.voteCount}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Phiếu</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

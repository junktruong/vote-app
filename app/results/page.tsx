"use client";
import { useEffect, useRef, useState } from "react";

export default function Results() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang tải...");
  const lastReveal = useRef<boolean | null>(null);

  async function tick() {
    const res = await fetch("/api/results", { cache: "no-store" });
    const d = await res.json();
    setData(d);
    if (!d.poll) setMsg("Chưa có poll.");
    else setMsg(d.poll.revealWinner ? "Đã công bố người dẫn đầu." : "Admin đang ẩn người dẫn đầu.");
  }

  useEffect(() => {
    tick();
    const t = setInterval(tick, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!data?.poll) return;
    if (lastReveal.current === false && data.poll.revealWinner === true) {
      // hiệu ứng khi vừa bật reveal
      const el = document.getElementById("winnerBox");
      el?.animate(
        [{ transform: "translateY(10px) scale(0.98)", opacity: 0.2 }, { transform: "translateY(0) scale(1)", opacity: 1 }],
        { duration: 650, easing: "cubic-bezier(.2,.9,.2,1)" }
      );
    }
    lastReveal.current = !!data.poll.revealWinner;
  }, [data]);

  if (!data) return <main className="min-h-screen bg-[#FFFAF0] px-6 py-10 text-slate-700">{msg}</main>;

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-14">
          <header className="rounded-3xl border border-red-100 bg-white/90 p-6 shadow-md">
            <p className="text-sm font-semibold text-red-700">Bảng kết quả Tết</p>
            <h1 className="mt-3 text-3xl font-bold text-red-700">Kết quả</h1>
            <p className="mt-2 text-sm text-slate-600">
              {data.poll
                ? `${data.poll.title} • ${data.poll.isActive ? "Đang diễn ra" : "Đã dừng"} • Reveal: ${data.poll.revealWinner ? "HIỆN" : "ẨN"}`
                : "—"}
            </p>
          </header>

          {data.top && data.poll?.revealWinner && (
            <div
              id="winnerBox"
              className="flex flex-col gap-4 rounded-3xl border border-yellow-200 bg-[#FFF7D1] p-5 shadow-md sm:flex-row sm:items-center"
            >
              <img src={data.top.photoUrl} className="h-24 w-24 rounded-2xl object-cover shadow" />
              <div>
                <div className="text-sm font-semibold text-yellow-700">Người dẫn đầu</div>
                <div className="text-xl font-bold text-slate-900">
                  {data.top.fullName} (@{data.top.username})
                </div>
                <div className="mt-1 text-sm text-slate-700">{data.top.votes} phiếu</div>
              </div>
            </div>
          )}

          <section className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">Bảng phiếu</h3>
            <div className="mt-4 grid gap-3">
              {data.candidates.map((c: any) => (
                <div
                  key={c.userId}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm"
                >
                  <img src={c.photoUrl} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{c.fullName}</div>
                    <div className="text-sm text-slate-500">@{c.username}</div>
                  </div>
                  <div className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                    {c.votes} phiếu
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-3xl border border-yellow-100 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
            {msg}
          </div>
        </div>
      </div>
    </main>
  );
}

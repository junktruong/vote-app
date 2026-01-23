"use client";
import { useEffect, useState } from "react";

export default function VotePage() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang tải...");

  async function load() {
    const res = await fetch("/api/results");
    const d = await res.json();
    setData(d);
    setMsg("");
  }

  useEffect(() => { load(); }, []);

  async function vote(candidateUserId: string) {
    setMsg("Đang gửi bình chọn...");
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Bình chọn thành công!");
  }

  if (!data) return <main className="min-h-screen bg-[#FFFAF0] px-6 py-10 text-slate-700">{msg}</main>;
  if (!data.poll || !data.poll.isActive) {
    return <main className="min-h-screen bg-[#FFFAF0] px-6 py-10 text-slate-700">Chưa có cuộc bình chọn đang diễn ra.</main>;
  }

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-14">
          <header className="rounded-3xl border border-red-100 bg-white/90 p-6 shadow-md">
            <p className="text-sm font-semibold text-red-700">Bình chọn Tết</p>
            <h1 className="mt-3 text-3xl font-bold text-red-700">{data.poll.title}</h1>
            <p className="mt-2 text-sm text-slate-600">Chọn 1 người để bình chọn (mỗi poll 1 lần).</p>
          </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.candidates.map((c: any) => (
              <div key={c.userId} className="rounded-3xl border border-red-100 bg-white/95 p-4 shadow-md">
                <img src={c.photoUrl} className="h-40 w-full rounded-2xl object-cover" />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-900">{c.fullName}</h3>
                  <div className="text-sm text-slate-500">@{c.username}</div>
                  <button
                    className="mt-4 w-full rounded-full bg-[#D32F2F] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#B71C1C]"
                    onClick={() => vote(c.userId)}
                  >
                    Bình chọn
                  </button>
                </div>
              </div>
            ))}
          </section>

          <div className="rounded-3xl border border-yellow-100 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
            {msg}
          </div>
        </div>
      </div>
    </main>
  );
}

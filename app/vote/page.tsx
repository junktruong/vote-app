"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function VotePage() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang tải...");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [justVoted, setJustVoted] = useState<string[]>([]);
  const r = useRouter();

  async function load() {
    const res = await fetch("/api/results");
    const d = await res.json();
    setData(d);
    setMsg("");
  }

  useEffect(() => { load(); }, []);

  async function vote() {
    setMsg("Đang gửi bình chọn...");
    setSubmitting(true);
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserIds: selected }),
    });
    const d = await res.json();
    if (!res.ok) {
      setSubmitting(false);
      return setMsg(d.error || "Lỗi");
    }
    const votedNames = selected
      .map((id) => data.candidates.find((c: any) => c.userId === id)?.fullName)
      .filter(Boolean);
    setJustVoted(votedNames);
    setMsg("Bình chọn thành công!");
    setSubmitting(false);
    setTimeout(() => r.push("/results"), 1600);
  }

  const maxVotes = data?.poll?.maxVotes ?? 3;
  const selectedNames = useMemo(
    () => selected.map((id) => data?.candidates?.find((c: any) => c.userId === id)?.fullName).filter(Boolean),
    [selected, data]
  );

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
            <p className="mt-2 text-sm text-slate-600">Chọn {maxVotes} người để bình chọn.</p>
          </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.candidates.map((c: any) => (
              <div
                key={c.userId}
                className={`rounded-3xl border bg-white/95 p-4 shadow-md transition ${
                  selected.includes(c.userId) ? "border-yellow-300 ring-2 ring-yellow-200" : "border-red-100"
                }`}
              >
                <img src={c.thumb} className="h-40 w-full rounded-2xl object-cover" />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-900">{c.fullName}</h3>
                  <button
                    className={`mt-4 w-full rounded-full px-5 py-2 text-sm font-semibold shadow-md transition ${
                      selected.includes(c.userId)
                        ? "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
                        : "bg-[#D32F2F] text-white hover:bg-[#B71C1C]"
                    }`}
                    onClick={() => {
                      setSelected((prev) => {
                        if (prev.includes(c.userId)) return prev.filter((id) => id !== c.userId);
                        if (prev.length >= maxVotes) {
                          setMsg(`Bạn chỉ được chọn tối đa ${maxVotes} người.`);
                          return prev;
                        }
                        return [...prev, c.userId];
                      });
                    }}
                  >
                    {selected.includes(c.userId) ? "Đã chọn" : "Chọn"}
                  </button>
                </div>
              </div>
            ))}
          </section>

          <div className="flex flex-col gap-4 rounded-3xl border border-yellow-100 bg-white/80 p-5 text-sm text-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">Bạn đã chọn {selected.length}/{maxVotes}</p>
                {selectedNames.length ? (
                  <p className="text-xs text-slate-600">Đã chọn: {selectedNames.join(", ")}</p>
                ) : null}
              </div>
              <button
                onClick={vote}
                disabled={selected.length !== maxVotes || submitting}
                className="rounded-full bg-[#FBC02D] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-[#F9A825] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xác nhận
              </button>
            </div>
            <p>{msg}</p>
          </div>

          {justVoted.length ? (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-6">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                <p className="text-sm font-semibold text-slate-700">Bạn đã bình chọn thành công</p>
                <p className="mt-2 text-lg font-bold text-red-700">{justVoted.join(", ")}</p>
                <p className="mt-2 text-xs text-slate-500">Đang chuyển sang trang kết quả...</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function VotePage() {
  // --- STATE & LOGIC GIỮ NGUYÊN ---
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang tải danh sách...");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [justVoted, setJustVoted] = useState<string[]>([]);
  const [nowTick, setNowTick] = useState(Date.now());
  const r = useRouter();
  const accessTokenKey = "accessToken";

  async function load() {
    try {
      const res = await fetch("/api/results");
      const d = await res.json();
      setData(d);
      setMsg("");
    } catch (e) {
      setMsg("Lỗi kết nối.");
    }
  }

  useEffect(() => {
    let active = true;
    async function ensureAuth() {
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
      const d = await res.json();
      if (!d.user) {
        r.push("/?mode=login");
        return;
      }
      if (active) load();
    }
    ensureAuth();
    return () => { active = false; };
  }, [r]);

  useEffect(() => {
    if (!data?.poll?.votingEndsAt) return;
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.poll?.votingEndsAt]);

  async function vote() {
    setMsg("Đang gửi...");
    setSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds: selected }),
      });
      const d = await res.json();
      if (!res.ok) {
        setSubmitting(false);
        return setMsg(d.error || "Lỗi");
      }
      const votedNames = selected
        .map((id) => data.candidates.find((c: any) => c.candidateId === id)?.fullName)
        .filter(Boolean);
      setJustVoted(votedNames);
      setMsg("Thành công!");
      // Delay chuyển trang
      setTimeout(() => r.push("/results"), 2000);
    } catch (e) {
      setSubmitting(false);
      setMsg("Lỗi hệ thống");
    }
  }

  // Helper xử lý chọn
  const maxVotes = data?.poll?.maxVotes ?? 3;
  const votingEndsAt = data?.poll?.votingEndsAt ? new Date(data.poll.votingEndsAt).getTime() : null;
  const isVotingClosed = Boolean(votingEndsAt && votingEndsAt <= nowTick);
  
  function toggleSelect(candidateId: string) {
    if (submitting || isVotingClosed) return; // Chặn khi đang submit hoặc hết giờ
    
    setSelected((prev) => {
      const isSelected = prev.includes(candidateId);
      
      // Nếu đang chọn -> bỏ chọn
      if (isSelected) {
        return prev.filter((id) => id !== candidateId);
      }
      
      // Nếu chưa chọn -> kiểm tra max
      if (prev.length >= maxVotes) {
        // Có thể thay bằng toast notification đẹp hơn
        alert(`Bạn chỉ được chọn tối đa ${maxVotes} người.`);
        return prev;
      }
      
      return [...prev, candidateId];
    });
  }

  // --- RENDER ---
  if (!data) return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFAF0] text-slate-500">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
        <p className="text-sm font-medium">{msg}</p>
      </div>
    </div>
  );

  if (!data.poll || !data.poll.isActive) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFAF0] p-6 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-800">Chưa mở bình chọn</h2>
        <p className="mt-2 text-slate-500">Vui lòng quay lại sau khi Ban tổ chức thông báo.</p>
        <button onClick={() => r.push('/dashboard')} className="mt-6 font-semibold text-red-600 hover:underline">Về Dashboard</button>
      </main>
    );
  }

  const isFull = selected.length === maxVotes;

  return (
    <main className="min-h-screen bg-[#FFFAF0] pb-32 text-slate-900 selection:bg-red-100">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-50 to-transparent" />
         <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(251,192,45,0.15),_transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* HEADER */}
        <header className="mb-8 text-center md:mb-12">
          <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
            Cổng Bình Chọn
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            {data.poll.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Hãy chọn ra <strong className="text-red-600">{maxVotes}</strong> gương mặt xuất sắc nhất mà bạn yêu thích.
          </p>
        </header>

        {isVotingClosed && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
            Hết thời gian bình chọn. Vui lòng chờ công bố kết quả.
          </div>
        )}

        {/* CANDIDATES GRID */}
        <section className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {data.candidates.map((c: any) => {
            const isSelected = selected.includes(c.candidateId);
            return (
              <div
                key={c.candidateId}
                onClick={() => toggleSelect(c.candidateId)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:shadow-lg active:scale-95 ${
                  isSelected 
                    ? "border-yellow-400 ring-2 ring-yellow-400 ring-offset-2" 
                    : "border-transparent hover:border-red-100"
                }`}
              >
                {/* Candidate Card */}
                <div className={`relative flex aspect-[3/4] w-full items-center justify-center p-6 ${isSelected ? "bg-yellow-50" : "bg-slate-50"}`}>
                  <h3 className={`text-center text-sm font-bold ${isSelected ? 'text-yellow-700' : 'text-slate-800'}`}>
                    {c.fullName}
                  </h3>

                  {/* Selection Checkmark Badge */}
                  <div className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all ${
                    isSelected ? "bg-yellow-400 scale-100 opacity-100" : "bg-white/30 scale-75 opacity-0 backdrop-blur-sm"
                  }`}>
                    {isSelected && (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-900">
                         <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                       </svg>
                    )}
                  </div>

                  {/* Dim overlay when NOT selected but max votes reached (Optional visual cue) */}
                  {!isSelected && isFull && (
                    <div className="absolute inset-0 bg-white/40 backdrop-grayscale-[50%] transition-all" />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* FLOATING ACTION BAR (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md safe-pb">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-slate-400">Đã chọn</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isFull ? 'text-green-600' : 'text-slate-900'}`}>
                {selected.length}
              </span>
              <span className="text-sm font-medium text-slate-500">/ {maxVotes}</span>
            </div>
          </div>

          <div className="flex-1 text-right">
             <span className="mr-3 hidden text-xs text-red-600 font-medium md:inline-block">
               {msg}
             </span>
              <button
                onClick={vote}
                disabled={selected.length === 0 || submitting || isVotingClosed}
                className={`rounded-full px-8 py-3 text-sm font-bold shadow-lg transition-all ${
                  selected.length === 0 || isVotingClosed
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : submitting 
                      ? "bg-yellow-100 text-yellow-600 cursor-wait"
                      : "bg-[#D32F2F] text-white hover:bg-[#B71C1C] hover:shadow-red-900/20 active:scale-95"
                }`}
              >
                {submitting ? "Đang gửi..." : `Gửi bình chọn (${selected.length})`}
              </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {justVoted.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#D32F2F] p-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Bình chọn thành công!</h3>
              <p className="mt-1 text-red-100 text-sm">Cảm ơn bạn đã tham gia.</p>
            </div>
            <div className="bg-white p-6">
              <p className="mb-2 text-xs font-bold uppercase text-slate-400">Danh sách đã chọn</p>
              <ul className="space-y-2">
                {justVoted.map((name, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    {name}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-center">
                 <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-full animate-progress bg-slate-300 origin-left" />
                 </div>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">Đang chuyển trang...</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Results() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Đang tải...");
  const lastReveal = useRef<boolean | null>(null);
  const [winnerReady, setWinnerReady] = useState(false);
  const [winnerPhoto, setWinnerPhoto] = useState("");
  const r = useRouter();
  const accessTokenKey = "accessToken";

  async function tick() {
    const res = await fetch("/api/results", { cache: "no-store" });
    const d = await res.json();
    setData(d);
    if (!d.poll) setMsg("Chưa có poll.");
    else setMsg(d.poll.revealWinner ? "Đã công bố người dẫn đầu." : "Admin đang ẩn người dẫn đầu.");
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let active = true;

    async function start() {
      const token = localStorage.getItem(accessTokenKey);
      if (token) {
        const sessionRes = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token }),
        });
        if (!sessionRes.ok) {
          localStorage.removeItem(accessTokenKey);
        }
      }
      const res = await fetch("/api/me");
      const d = await res.json();
      if (!d.user) {
        r.push("/?mode=login");
        return;
      }
      if (active) {
        tick();
        interval = setInterval(tick, 2000);
      }
    }

    start();
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [r]);

  useEffect(() => {
    if (!data?.poll) return;
    if (lastReveal.current === false && data.poll.revealWinner === true) {
      // hiệu ứng khi vừa bật reveal
      const el = document.getElementById("winnerBox");
      el?.animate(
        [{ transform: "translateY(18px) scale(0.95)", opacity: 0 }, { transform: "translateY(0) scale(1)", opacity: 1 }],
        { duration: 750, easing: "cubic-bezier(.2,.9,.2,1)" }
      );
    }
    lastReveal.current = !!data.poll.revealWinner;
  }, [data]);

  useEffect(() => {
    if (!data?.poll?.revealWinner || !data.top?.photo) {
      setWinnerReady(false);
      setWinnerPhoto("");
      return;
    }
    const img = new Image();
    img.src = data.top.photo;
    img.onload = () => {
      setWinnerPhoto(data.top.photo);
      setWinnerReady(true);
    };
  }, [data?.poll?.revealWinner, data?.top?.photo]);

  if (!data) return <main className="min-h-screen bg-[#FFFAF0] px-6 py-10 text-slate-700">{msg}</main>;

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,64,0.25),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.28),_transparent_60%)]" />
        </div>

        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 14 }).map((_, idx) => (
            <span
              key={idx}
              className={`firework firework-${idx}`}
            />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="text-center">
            <p className="sr-only">{msg}</p>
            {data.poll?.revealWinner && data.top && winnerReady && (
              <div id="winnerBox" className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-4 rounded-[32px] border border-yellow-200/50 bg-white/10 px-6 py-8 shadow-2xl backdrop-blur">
                <div className="firework-burst" />
                <img src={winnerPhoto} className="h-40 w-40 rounded-3xl object-cover shadow-2xl ring-4 ring-yellow-200/70" />
                <div className="text-sm font-semibold text-yellow-200">Chúc mừng người chiến thắng</div>
                <div className="text-2xl font-bold text-white">
                  {data.top.fullName}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .firework {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 215, 64, 0.9) 0%, rgba(255, 87, 34, 0.6) 60%, rgba(255, 87, 34, 0) 70%);
          animation: firework 3.5s ease-in-out infinite;
          opacity: 0.6;
        }
        .firework-burst {
          position: absolute;
          inset: -40px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 215, 64, 0.55) 0%, rgba(255, 87, 34, 0.2) 55%, transparent 70%);
          animation: burst 1.8s ease-out infinite;
          z-index: -1;
        }
        ${Array.from({ length: 14 })
          .map((_, idx) => {
            const top = 8 + (idx * 6) % 70;
            const left = 4 + (idx * 9) % 90;
            const delay = (idx % 6) * 0.4;
            const duration = 3 + (idx % 5) * 0.5;
            return `.firework-${idx}{top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;}`;
          })
          .join("")}
        @keyframes firework {
          0% { transform: scale(0.2); opacity: 0; }
          40% { opacity: 0.8; }
          60% { transform: scale(1.8); opacity: 0.4; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes burst {
          0% { transform: scale(0.6); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

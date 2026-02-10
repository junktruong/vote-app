"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

// Hook nhỏ để lấy kích thước màn hình cho Confetti
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize(); // Set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

export default function Results() {
  const [data, setData] = useState<any>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [localRevealState, setLocalRevealState] = useState<string | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const lastReveal = useRef<string | null>(null);
  const r = useRouter();
  const accessTokenKey = "accessToken";
  const { width, height } = useWindowSize(); // Cho Confetti

  // --- LOGIC FETCH DATA (GIỮ NGUYÊN) ---
  async function tick() {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const d = await res.json();
      setData(d);
      setLocalRevealState(null);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    let active = true;
    let interval: NodeJS.Timeout | null = null;

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
        interval = setInterval(tick, 2500);
      }
    }

    start();
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [r]);

  const effectiveRevealState = localRevealState ?? data?.poll?.revealState ?? null;
  const viewMode = data?.poll?.viewMode ?? "RESULTS";

  useEffect(() => {
    if (viewMode === "RECEIPT_SPIN") {
      r.push("/receipt-spin");
      return;
    }
    if (viewMode === "SPIN") {
      r.push("/spin");
    }
  }, [viewMode, r]);

  useEffect(() => {
    if (effectiveRevealState !== "REVEALED") {
      setRevealCountdown(null);
      setShowCongrats(false);
      lastReveal.current = effectiveRevealState;
      return;
    }

    if (lastReveal.current !== "REVEALED") {
      setShowCongrats(false);
      setRevealCountdown(3);
      lastReveal.current = "REVEALED";
      let current = 3;
      const timer = setInterval(() => {
        current -= 1;
        if (current <= 0) {
          clearInterval(timer);
          setRevealCountdown(null);
          setShowCongrats(true);
        } else {
          setRevealCountdown(current);
        }
      }, 1000);
      return () => clearInterval(timer);
    }

    setShowCongrats(true);
    lastReveal.current = effectiveRevealState;
  }, [effectiveRevealState]);

  useEffect(() => {
    if (!data?.poll?.countdownStartedAt || effectiveRevealState !== "COUNTING") {
      setRemainingSec(null);
      return;
    }
    let interval: NodeJS.Timeout | null = null;
    let synced = false;
    const tickRemaining = () => {
      const start = new Date(data.poll.countdownStartedAt).getTime();
      const duration = Number.isFinite(Number(data.poll.countdownDurationSec))
        ? Number(data.poll.countdownDurationSec)
        : 180;
      const elapsedSec = Math.floor((Date.now() - start) / 1000);
      const remain = Math.max(0, duration - elapsedSec);
      setRemainingSec(remain);
      if (remain <= 0) {
        if (interval) clearInterval(interval);
        if (!synced) {
          synced = true;
          setLocalRevealState("WAITING_REVEAL");
          tick();
        }
      }
    };
    tickRemaining();
    interval = setInterval(tickRemaining, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data?.poll?.countdownStartedAt, data?.poll?.countdownDurationSec, effectiveRevealState]);

  useEffect(() => {
    if (effectiveRevealState !== "WAITING_REVEAL") return;
    const interval = setInterval(tick, 2500);
    return () => clearInterval(interval);
  }, [effectiveRevealState]);

  // --- LOGIC HIỂN THỊ ---
  const countdownDurationSec = Number.isFinite(Number(data?.poll?.countdownDurationSec))
    ? Number(data?.poll?.countdownDurationSec)
    : 180;
  const formatCountdown = (totalSec: number) => {
    const safe = Math.max(0, Math.floor(totalSec));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  const remainingSeconds = remainingSec ?? 0;
  const remainingDisplay = remainingSec === null
    ? (effectiveRevealState === "NOT_STARTED" ? formatCountdown(countdownDurationSec) : "00:00")
    : formatCountdown(remainingSeconds);

  // Loading Screen
  if (!data) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-12 w-12 rounded-full border-4 border-yellow-500 border-t-transparent shadow-[0_0_20px_rgba(234,179,8,0.5)]" 
      />
    </div>
  );

  const totalVotes = Array.isArray(data?.candidates)
    ? data.candidates.reduce((sum: number, c: any) => sum + (Number(c?.voteCount) || 0), 0)
    : 0;
  const winnerName = data?.top?.fullName || "Chưa xác định";
  const winnerPercent = totalVotes > 0 && Number.isFinite(Number(data?.top?.voteCount))
    ? Math.round((Number(data.top.voteCount) / totalVotes) * 100)
    : 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-4xl px-4">
        {/* Header */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm md:text-6xl"
        >
          Kết Quả Bình Chọn
        </motion.h1>
        <button
          onClick={() => r.push("/spin")}
          className="mb-8 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:bg-white/10"
        >
          Mở trang quay số
        </button>

        {/* Timer Box */}
        <motion.div 
          layout
          className="relative group rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-xl transition-all duration-500 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(250,204,21,0.15)]"
        >
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-yellow-500 to-purple-600 opacity-20 blur group-hover:opacity-40 transition duration-500" />
          
          <p className="relative mb-2 text-sm font-bold uppercase tracking-[0.5em] text-yellow-500/80">
             {effectiveRevealState === "WAITING_REVEAL" ? "Đang chờ kết quả..." : "Thời gian còn lại"}
          </p>
          
          <div className="relative font-mono text-7xl font-bold tracking-tight text-white md:text-9xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <AnimatePresence mode="popLayout">
                <motion.span
                  key={remainingDisplay}
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {remainingDisplay}
                </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* --- OVERLAY: COUNTDOWN & REVEAL --- */}
      <AnimatePresence>
        {(revealCountdown !== null || showCongrats) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            {/* Countdown 3-2-1 */}
            {revealCountdown !== null ? (
              <motion.div
                key={revealCountdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1.2, 1], opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_35px_rgba(250,204,21,0.8)]"
              >
                {revealCountdown}
              </motion.div>
            ) : (
              /* Winner Reveal */
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl border border-yellow-500/50 bg-gradient-to-b from-slate-900 to-black p-10 text-center shadow-[0_0_60px_rgba(234,179,8,0.3)]"
              >
                {/* Pháo hoa chỉ hiện khi chúc mừng */}
                <Confetti width={width} height={height} numberOfPieces={350} recycle gravity={0.2} />
                
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>

                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10"
                >
                  <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-yellow-500">Người Chiến Thắng</h2>
                  
                  <div className="my-8 flex justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                         <span className="text-5xl">👑</span>
                    </div>
                  </div>

                  <h3 className="bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-100 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                    {winnerName}
                  </h3>
                  
                  <div className="mt-6 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-6 py-2 backdrop-blur-sm">
                    <p className="text-lg font-bold text-yellow-300">
                      {winnerPercent}% <span className="text-yellow-100/60 text-sm font-normal">Tổng phiếu bầu</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

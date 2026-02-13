"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMusic } from "@/lib/use-page-music";

type PollResult = {
  title?: string;
  revealState?: "NOT_STARTED" | "COUNTING" | "WAITING_REVEAL" | "REVEALED" | string;
  viewMode?: "RESULTS" | "RECEIPT_SPIN" | "SPIN" | string;
  countdownStartedAt?: string | null;
  countdownDurationSec?: number;
};

type TopResult = {
  fullName?: string;
};

type ResultsPayload = {
  poll?: PollResult | null;
  top?: TopResult | null;
};

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
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [localRevealState, setLocalRevealState] = useState<string | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const lastReveal = useRef<string | null>(null);
  const r = useRouter();
  const accessTokenKey = "accessToken";
  const { width, height } = useWindowSize(); // Cho Confetti
  const { playReveal } = usePageMusic({
    backgroundSrc: "/music/countdown.mp3",
    backgroundEnabled: (localRevealState ?? data?.poll?.revealState ?? null) === "COUNTING",
    revealSrc: "/music/winner.mp3",
    backgroundVolume: 0.3,
    revealVolume: 0.95,
  });

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
      const resetTimer = setTimeout(() => {
        setRevealCountdown(null);
        setShowCongrats(false);
      }, 0);
      lastReveal.current = effectiveRevealState;
      return () => clearTimeout(resetTimer);
    }

    if (lastReveal.current !== "REVEALED") {
      lastReveal.current = "REVEALED";
      const kickoffTimer = setTimeout(() => {
        setShowCongrats(false);
        setRevealCountdown(3);
      }, 0);
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
      return () => {
        clearTimeout(kickoffTimer);
        clearInterval(timer);
      };
    }

    const congratsTimer = setTimeout(() => {
      setShowCongrats(true);
    }, 0);
    lastReveal.current = effectiveRevealState;
    return () => clearTimeout(congratsTimer);
  }, [effectiveRevealState]);

  useEffect(() => {
    const poll = data?.poll;
    if (!poll?.countdownStartedAt || effectiveRevealState !== "COUNTING") {
      const resetTimer = setTimeout(() => {
        setRemainingSec(null);
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    const countdownStartedAt = poll.countdownStartedAt;
    const countdownDurationSec = poll.countdownDurationSec;
    let interval: NodeJS.Timeout | null = null;
    let kickoffTimer: NodeJS.Timeout | null = null;
    let synced = false;
    const tickRemaining = () => {
      const start = new Date(countdownStartedAt).getTime();
      const duration = Number.isFinite(Number(countdownDurationSec))
        ? Number(countdownDurationSec)
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
    kickoffTimer = setTimeout(tickRemaining, 0);
    interval = setInterval(tickRemaining, 1000);
    return () => {
      if (kickoffTimer) clearTimeout(kickoffTimer);
      if (interval) clearInterval(interval);
    };
  }, [data?.poll?.countdownStartedAt, data?.poll?.countdownDurationSec, effectiveRevealState]);

  useEffect(() => {
    if (effectiveRevealState !== "WAITING_REVEAL") return;
    const interval = setInterval(tick, 2500);
    return () => clearInterval(interval);
  }, [effectiveRevealState]);

  useEffect(() => {
    if (!showCongrats) return;
    playReveal();
  }, [showCongrats, playReveal]);

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

  const winnerName = data?.top?.fullName || "Chưa xác định";
  const pollTitle = String(data?.poll?.title || "").trim();
  const winnerPercent = 36;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-x-hidden overflow-y-auto bg-slate-950 font-sans text-slate-100">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute left-0 top-0 z-[2] hidden md:block">
        <Image
          src="/logo/amber.png"
          alt="Amber logo background"
          width={260}
          height={260}
          className="h-[clamp(11rem,17vw,16rem)] w-[clamp(11rem,17vw,16rem)] object-contain opacity-95 drop-shadow-[0_0_34px_rgba(255,255,255,0.78)]"
        />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-[2] hidden md:block">
        <Image
          src="/logo/dtn.png"
          alt="DTN logo background"
          width={260}
          height={260}
          className="h-[clamp(11rem,17vw,16rem)] w-[clamp(11rem,17vw,16rem)] object-contain opacity-95 drop-shadow-[0_0_34px_rgba(255,255,255,0.78)]"
        />
      </div>

      <div className="z-10 flex w-full max-w-4xl flex-col items-center px-4 pb-10 pt-8 md:pt-12">
        {/* Header */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center text-3xl font-black uppercase leading-tight tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm md:text-5xl"
        >
          Kết Quả Bình Chọn
        </motion.h1>
        <p className="mb-12 text-center text-3xl font-black leading-tight text-yellow-200 md:text-5xl">
          {pollTitle || "Chưa có tiêu đề poll"}
        </p>

        {/* Timer Box */}
        <motion.div 
          layout
          className="relative group rounded-[2rem] border border-white/10 bg-white/5 p-20 text-center shadow-2xl backdrop-blur-xl transition-all duration-500 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(250,204,21,0.15)] md:p-28"
        >
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-yellow-500 to-purple-600 opacity-20 blur group-hover:opacity-40 transition duration-500" />
          
          <p className="relative mb-4 text-base font-bold uppercase tracking-[0.4em] text-yellow-500/80 md:text-2xl">
             {effectiveRevealState === "WAITING_REVEAL" ? "Đang chờ kết quả..." : "Thời gian còn lại"}
          </p>
          
          <div className="relative font-mono text-[clamp(10rem,28vw,18rem)] font-bold leading-none tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
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
                className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-[2.25rem] border-[3px] border-yellow-300/70 bg-gradient-to-b from-[#b91c1c] via-[#7f1d1d] to-[#450a0a] p-12 text-center shadow-[0_0_80px_rgba(251,191,36,0.35)] md:p-16"
              >
                {/* Pháo hoa chỉ hiện khi chúc mừng */}
                <Confetti width={width} height={height} numberOfPieces={350} recycle gravity={0.2} />

                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 18%, rgba(251,191,36,0.45), transparent 34%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.35), transparent 36%), radial-gradient(circle at 50% 110%, rgba(255,255,255,0.14), transparent 48%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(rgba(252,211,77,0.8) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="absolute left-4 top-4 h-16 w-16 rounded-tl-2xl border-l-4 border-t-4 border-yellow-300/40 md:h-20 md:w-20" />
                <div className="absolute bottom-4 right-4 h-16 w-16 rounded-br-2xl border-b-4 border-r-4 border-yellow-300/40 md:h-20 md:w-20" />

                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10"
                >
                  <p className="mx-auto mb-4 inline-flex rounded-full border border-yellow-100/50 bg-red-950/30 px-6 py-2 text-sm font-bold uppercase tracking-[0.28em] text-yellow-100">
                    Amber & DTN
                  </p>
                  <h2 className="text-3xl font-black uppercase tracking-[0.25em] text-yellow-200 md:text-4xl">Người Chiến Thắng</h2>
                  
                  <div className="my-8 flex justify-center">
                    <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-yellow-200/70 bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-[0_0_35px_rgba(250,204,21,0.65)] md:h-52 md:w-52">
                         <span className="text-7xl md:text-8xl">👑</span>
                    </div>
                  </div>

                  <h3 className="bg-gradient-to-r from-yellow-50 via-yellow-200 to-yellow-50 bg-clip-text text-6xl font-black text-transparent drop-shadow-[0_3px_0_rgba(120,53,15,0.9)] md:text-7xl">
                    {winnerName}
                  </h3>
                  
                  <div className="mt-8 inline-block rounded-full border border-yellow-200/60 bg-gradient-to-r from-yellow-200/25 via-yellow-400/20 to-yellow-200/25 px-8 py-3 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-yellow-100 md:text-3xl">
                      {winnerPercent}% <span className="text-yellow-100/80 text-base font-medium">Tổng phiếu bầu</span>
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

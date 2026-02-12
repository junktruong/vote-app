"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { usePageMusic } from "@/lib/use-page-music";

const MIN_NUMBER = 1;
const MAX_NUMBER = 996;
const VEHICLE_SPIN_DURATION_SEC = 45;

type VehicleItem = {
  key: string;
  label: string;
  fileHint: string;
  positionClassName: string;
};

const VEHICLES: VehicleItem[] = [
  {
    key: "container",
    label: "Xe container",
    fileHint: "xe-container.png",
    positionClassName: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  },
  {
    key: "ship",
    label: "Tàu thủy",
    fileHint: "tau-thuy.png",
    positionClassName: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  },
  {
    key: "plane",
    label: "Máy bay",
    fileHint: "may-bay.png",
    positionClassName: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  },
  {
    key: "train",
    label: "Tàu hỏa",
    fileHint: "tau-hoa.png",
    positionClassName: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  },
];

const VEHICLE_IMAGE_CANDIDATES: Record<string, string[]> = {
  container: ["https://sv2.anhsieuviet.com/2026/02/10/xecontainer.png"],
  ship: ["https://sv2.anhsieuviet.com/2026/02/10/tauthuy.png"],
  plane: ["https://sv2.anhsieuviet.com/2026/02/10/maybay.png"],
  train: ["https://sv2.anhsieuviet.com/2026/02/10/tauhoa.png"],
};

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeReceiptNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(n) || n < MIN_NUMBER || n > MAX_NUMBER) return null;
  return n;
}

function formatNumber(value: number | null) {
  if (!Number.isFinite(Number(value))) return "---";
  if (value === null) return "???";
  return String(value).padStart(3, "0");
}

export default function ReceiptSpinPage() {
  const r = useRouter();
  const accessTokenKey = "accessToken";
  const { width, height } = useWindowSize();

  const [viewMode, setViewMode] = useState<string | null>(null);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSpinAudioActive, setIsSpinAudioActive] = useState(false);
  const [missingVehicleImages, setMissingVehicleImages] = useState<Record<string, boolean>>({});
  const [vehicleImageIndex, setVehicleImageIndex] = useState<Record<string, number>>({});
  const { playReveal } = usePageMusic({
    backgroundSrc: "/music/spin.mp3",
    backgroundEnabled: isSpinAudioActive,
    revealSrc: "/music/winner.mp3",
    backgroundVolume: 0.3,
    revealVolume: 0.95,
  });

  const lastResultNumber = useRef<number | null>(null);
  const isRolling = useRef(false);
  const rollingTimer = useRef<NodeJS.Timeout | null>(null);
  const finishTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (rollingTimer.current) {
      clearTimeout(rollingTimer.current);
      rollingTimer.current = null;
    }
    if (finishTimer.current) {
      clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
  };

  const markVehicleImageMissing = (key: string) => {
    setMissingVehicleImages((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  };

  const getVehicleImageSrc = (key: string) => {
    const options = VEHICLE_IMAGE_CANDIDATES[key] || [];
    const index = vehicleImageIndex[key] ?? 0;
    return options[index] || "";
  };

  const onVehicleImageError = (key: string) => {
    const options = VEHICLE_IMAGE_CANDIDATES[key] || [];
    let shouldMarkMissing = false;
    setVehicleImageIndex((prev) => {
      const current = prev[key] ?? 0;
      const next = current + 1;
      if (next < options.length) return { ...prev, [key]: next };
      shouldMarkMissing = true;
      return prev;
    });
    if (shouldMarkMissing) markVehicleImageMissing(key);
  };

  const startRevealAnimation = (targetNumber: number) => {
    clearTimers();
    isRolling.current = true;
    setIsSpinAudioActive(true);
    setShowResult(false);

    const totalDurationMs = 15000 + Math.floor(Math.random() * 5001); // 15-20s
    const startedAt = Date.now();

    const tickRolling = () => {
      const elapsedMs = Date.now() - startedAt;
      const progress = Math.min(elapsedMs / totalDurationMs, 1);
      setDisplayNumber(randomInRange(MIN_NUMBER, MAX_NUMBER));

      if (progress >= 1) return;

      // Cuối vòng quay chậm dần rõ rệt.
      const nextDelayMs = 40 + Math.floor(Math.pow(progress, 2.2) * 620);
      rollingTimer.current = setTimeout(tickRolling, nextDelayMs);
    };

    tickRolling();

    finishTimer.current = setTimeout(() => {
      clearTimers();
      isRolling.current = false;
      setIsSpinAudioActive(false);
      setDisplayNumber(targetNumber);
      setShowResult(true);
    }, totalDurationMs);
  };

  async function tick() {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok || !d?.poll) {
        return;
      }

      const currentMode = d.poll.viewMode || "RESULTS";
      const receiptState = d.poll.receiptSpinState || "IDLE";
      const receiptNumber = normalizeReceiptNumber(d.poll.receiptSpinNumber);

      setViewMode(currentMode);

      if (receiptState === "REVEALED" && receiptNumber !== null) {
        if (lastResultNumber.current !== receiptNumber) {
          lastResultNumber.current = receiptNumber;
          startRevealAnimation(receiptNumber);
        } else if (!isRolling.current) {
          setDisplayNumber(receiptNumber);
          setShowResult(true);
        }
      } else {
        setShowResult(false);
        setIsSpinAudioActive(false);
        setDisplayNumber(null);
      }
    } catch {}
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
        await tick();
        interval = setInterval(tick, 2500);
      }
    }

    start();

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  useEffect(() => {
    if (!viewMode) return;
    if (viewMode === "RESULTS") {
      r.push("/results");
      return;
    }
    if (viewMode === "SPIN") {
      r.push("/spin");
    }
  }, [viewMode, r]);

  useEffect(() => {
    if (!showResult) return;
    playReveal();
  }, [showResult, playReveal]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a] px-4 text-slate-100">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.16),_transparent_60%)]" />
      </div>

      {showResult ? <Confetti z-index={100} width={width} height={height} recycle gravity={0.25} numberOfPieces={220} /> : null}

      <section className="relative z-10 w-full max-w-3xl rounded-3xl border border-cyan-400/30 bg-slate-900/70 p-8 text-center shadow-[0_25px_80px_rgba(34,211,238,0.18)] backdrop-blur-sm sm:p-12">
        <h1 className="text-3xl font-black uppercase tracking-[0.2em] leading-[1.25] text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-300 to-cyan-500 sm:text-5xl sm:leading-[1.3]">
          Giải chứng từ
        </h1>

        <div className="relative mx-auto mt-8 aspect-square w-[min(80vw,700px)]">
          <div className="absolute inset-4 rounded-full border border-dashed border-cyan-300/35" />
          <div className="absolute inset-16 rounded-full border border-cyan-500/25" />

          <div className="absolute inset-0" style={{ animation: `spin ${VEHICLE_SPIN_DURATION_SEC}s linear infinite` }}>
            {VEHICLES.map((vehicle) => (
              <div key={vehicle.key} className={`absolute ${vehicle.positionClassName}`}>
                <div
                  className="relative h-24 w-24 sm:h-70 sm:w-70"
                  style={{ animation: `spin ${VEHICLE_SPIN_DURATION_SEC}s linear infinite reverse` }}
                >
                  {missingVehicleImages[vehicle.key] ? (
                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-semibold leading-tight text-cyan-200">
                      {vehicle.fileHint}
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getVehicleImageSrc(vehicle.key)}
                      alt={vehicle.label}
                      className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]"
                      onError={() => onVehicleImageError(vehicle.key)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-mono text-[8.5rem] font-black tracking-[0.1em] text-cyan-300 drop-shadow-[0_0_28px_rgba(34,211,238,0.55)] sm:text-[13.5rem]">
              {formatNumber(displayNumber)}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

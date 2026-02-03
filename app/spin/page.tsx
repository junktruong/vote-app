"use client";
import { useEffect, useRef, useState } from "react";

const TOTAL_NUMBERS = 80;
const CANVAS_SIZE = 1200; 

export default function SpinPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [spinState, setSpinState] = useState<string | null>(null);
  const [msg, setMsg] = useState("Đang tải dữ liệu...");
  const [showResult, setShowResult] = useState(false);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [lastPrize, setLastPrize] = useState<string | null>(null);

  const lastWinner = useRef<string | null>(null);
  const currentRotation = useRef(0);
  const isSpinning = useRef(false);

  function normalizeNumber(value: any) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1 || n > TOTAL_NUMBERS) return null;
    return n;
  }

  function setupCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(CANVAS_SIZE * dpr);
    canvas.height = Math.floor(CANVAS_SIZE * dpr);
  }

  // --- STYLE TẾT: ĐỎ & VÀNG RỰC RỠ ---
  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const size = CANVAS_SIZE;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    const step = (2 * Math.PI) / TOTAL_NUMBERS;

    ctx.clearRect(0, 0, size, size);

    // Không dùng bóng đổ để giữ nét phẳng hiện đại nhưng màu đậm
    ctx.shadowBlur = 0;

    // 1. Viền ngoài: Màu Vàng Đồng (Gold)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#F59E0B"; // Amber-500
    ctx.fill();
    
    // Viền lót đỏ đậm
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#7F1D1D"; // Red-900
    ctx.fill();

    const wheelRadius = radius - 20;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentRotation.current);

    // 2. Các múi: XEN KẼ ĐỎ & VÀNG
    for (let i = 0; i < TOTAL_NUMBERS; i += 1) {
      const num = i + 1;
      const angle = i * step - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, angle, angle + step);
      
      if (i % 2 === 0) {
        ctx.fillStyle = "#DC2626"; // Đỏ Tươi (Red-600)
      } else {
        ctx.fillStyle = "#FCD34D"; // Vàng Tươi (Amber-300)
      }
      ctx.fill();
      
      // Viền phân cách
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#991B1B"; // Viền đỏ đậm
      ctx.stroke();

      // 3. Số
      ctx.save();
      ctx.rotate(angle + step / 2);
      ctx.translate(wheelRadius - 35, 0); 
      ctx.rotate(Math.PI / 2);
      
      // Màu chữ tương phản
      if (i % 2 === 0) {
         ctx.fillStyle = "#FEF3C7"; // Chữ vàng nhạt trên nền đỏ
      } else {
         ctx.fillStyle = "#991B1B"; // Chữ đỏ đậm trên nền vàng
      }
      
      ctx.font = "bold 28px Arial"; 
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const label = num < 10 ? `0${num}` : String(num);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  function startSpinAnimation(targetNumber: number) {
    if (isSpinning.current) return;
    isSpinning.current = true;
    setShowResult(false);

    // Reset Zoom
    if (containerRef.current) {
        containerRef.current.style.transform = "scale(1) translateY(0px)";
    }

    const TAU = 2 * Math.PI;
    currentRotation.current = ((currentRotation.current % TAU) + TAU) % TAU;

    const step = TAU / TOTAL_NUMBERS;
    const targetIndex = targetNumber - 1;
    const baseTarget = -(targetIndex * step + step / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 4);
    let finalAngle = baseTarget + fullSpins * TAU;

    while (finalAngle < currentRotation.current + TAU) {
      finalAngle += TAU;
    }

    const duration = 8000;
    const startTime = performance.now();
    const startAngle = currentRotation.current;
    const change = finalAngle - startAngle;

    function animate(time: number) {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      currentRotation.current = startAngle + change * ease;
      drawWheel();

      // --- LOGIC ZOOM & MOVE DOWN ---
     // --- LOGIC ZOOM & MOVE DOWN ---
      if (containerRef.current) {
        // SỬA: Bắt đầu zoom sớm hơn (khi t > 0.2) để hiệu ứng kéo dài lâu hơn
        if (t > 0.2) {
            // Chia cho 0.8 vì khoảng thời gian còn lại là 1.0 - 0.2 = 0.8
            const animProgress = (t - 0.2) / 0.8; 
            const animEase = 1 - Math.pow(1 - animProgress, 3);
            
            // Zoom to hơn (1.6x)
            const scale = 1 + (animEase * 0.6); 
            // Hạ thấp xuống
            const translateY = animEase * 200; 

            containerRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        } else {
            containerRef.current.style.transform = `scale(1) translateY(0px)`;
        }
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        currentRotation.current = ((currentRotation.current % TAU) + TAU) % TAU;
        drawWheel();
        isSpinning.current = false;
        setTimeout(() => setShowResult(true), 800);
      }
    }
    requestAnimationFrame(animate);
  }

  async function load() {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const d = await res.json();

      if (!res.ok || !d?.poll) {
        setMsg("Chưa có dữ liệu.");
        return;
      }

      const state = d.poll.spinState || "IDLE";
      const name = d.poll.spinWinnerName || null;
      const latestNumber = normalizeNumber(d.poll.spinLatestNumber);
      const latestPrize = d.poll.spinLatestPrize || null;

      setSpinState(state);
      setWinnerName(name);
      setLastNumber(latestNumber);
      setLastPrize(latestPrize);
      setMsg(state === "REVEALED" ? "" : "Đang chờ admin quay số...");

      if (state === "REVEALED" && latestNumber && lastWinner.current !== String(latestNumber)) {
        lastWinner.current = String(latestNumber);
        startSpinAnimation(latestNumber);
      } else if (state === "REVEALED" && latestNumber && !isSpinning.current) {
        setShowResult(true);
      }
    } catch {
      setMsg("Không thể tải dữ liệu.");
    }
  }

  useEffect(() => {
    setupCanvas();
    drawWheel();
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // NỀN: Đỏ đậm (Red 900) -> Phong cách sang trọng, ấm cúng ngày Tết
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#450a0a] font-sans text-yellow-100">
      
      {/* Họa tiết nền: Các đốm vàng lấp lánh như pháo hoa/hoa mai */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: "radial-gradient(#FCD34D 2px, transparent 2px)", backgroundSize: "40px 40px" }}>
      </div>
      
      {/* Ánh sáng tâm điểm */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 blur-[150px] opacity-40"></div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6 px-4 transition-opacity duration-500"
           style={{ opacity: isSpinning.current ? 0.2 : 1 }}>
         <div className="inline-block rounded-full border border-yellow-500/50 bg-black/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-yellow-400 backdrop-blur-sm mb-3">
            Xuân Bính Ngọ 2026
         </div>
         <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 sm:text-5xl drop-shadow-sm">
            Vòng Quay May Mắn
         </h1>
         <p className="mt-2 text-sm text-yellow-200/60 italic">{msg}</p>
      </div>

      {/* CONTAINER VÒNG QUAY */}
      <div 
        ref={containerRef}
        className="relative z-10 flex justify-center w-[130vw] max-w-[800px] will-change-transform"
        style={{ transformOrigin: "center 15%" }} 
      >
        <div className="relative aspect-square w-full">
          
          {/* Kim quay: Hình mũi giáo vàng */}
          <div className="absolute left-1/2 top-[-25px] z-20 h-20 w-16 -translate-x-1/2 drop-shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22L4 6H20L12 22Z" fill="#FBBF24" stroke="#FFF" strokeWidth="2"/>
                {/* Thêm chút họa tiết đỏ vào kim */}
                <circle cx="12" cy="10" r="3" fill="#DC2626"/>
            </svg>
          </div>

          {/* Trục giữa: Đỏ viền vàng */}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#991B1B] border-[4px] border-yellow-500 shadow-md">
             <div className="h-2 w-2 rounded-full bg-yellow-300"></div>
          </div>

          <canvas ref={canvasRef} className="h-full w-full rounded-full" />
        </div>
      </div>

      {/* POPUP KẾT QUẢ: PHONG CÁCH BAO LÌ XÌ */}
     {showResult && spinState === "REVEALED" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="relative w-full max-w-sm scale-110 overflow-hidden rounded-2xl border-2 border-yellow-500 bg-red-900 shadow-[0_0_60px_rgba(234,179,8,0.5)]">
            
            {/* Hiệu ứng ánh sáng nền sau số */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-yellow-500 blur-[80px] opacity-20"></div>

            <div className="relative flex flex-col items-center p-8 text-center">
                
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-yellow-200 opacity-80">
                    Con số may mắn
                </p>

                {/* SỐ TRÚNG THƯỞNG: Gradient Vàng + Bóng Đổ Dày */}
                <p className="my-2 text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-300 to-yellow-600 drop-shadow-[0_4px_0_rgba(180,83,9,1)] filter">
                  {lastNumber ? String(lastNumber).padStart(2, "0") : "--"}
                </p>

                <div className="my-6 h-px w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

                {/* TÊN GIẢI: Nền Vàng Khối + Chữ Đỏ Đậm */}
                {lastPrize && (
                    <div className="mb-4 w-full rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 px-4 py-3 shadow-[0_5px_15px_rgba(234,179,8,0.4)] border border-yellow-200">
                        <p className="text-2xl font-black uppercase text-[#7f1d1d] tracking-wide">
                            {lastPrize}
                        </p>
                    </div>
                )}
                
                {/* Tên người thắng: Sáng và Rõ */}
                <p className="text-xl font-bold text-white drop-shadow-md">
                   Người nhận: <span className="text-yellow-300">{winnerName || "Chưa xác định"}</span>
                </p>
            </div>
            
            {/* Trang trí góc bao lì xì */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500/30 rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500/30 rounded-br-xl"></div>
          </div>
        </div>
      )}
    </main>
  );
}
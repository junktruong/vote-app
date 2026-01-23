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

  if (!data) return <main style={{ padding: 24 }}>{msg}</main>;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Kết quả</h1>
      <p style={{ opacity: 0.8 }}>
        {data.poll ? `${data.poll.title} • ${data.poll.isActive ? "Đang diễn ra" : "Đã dừng"} • Reveal: ${data.poll.revealWinner ? "HIỆN" : "ẨN"}` : "—"}
      </p>

      {data.top && data.poll?.revealWinner && (
        <div id="winnerBox" style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, border: "1px solid #ddd", borderRadius: 14, margin: "14px 0" }}>
          <img src={data.top.photoUrl} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 14 }} />
          <div>
            <div style={{ opacity: 0.7 }}>Người dẫn đầu</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{data.top.fullName} (@{data.top.username})</div>
            <div style={{ marginTop: 6 }}>{data.top.votes} phiếu</div>
          </div>
        </div>
      )}

      <h3>Bảng phiếu</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {data.candidates.map((c: any) => (
          <div key={c.userId} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
            <img src={c.photoUrl} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{c.fullName}</div>
              <div style={{ opacity: 0.7 }}>@{c.username}</div>
            </div>
            <div style={{ fontWeight: 800 }}>{c.votes} phiếu</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 12 }}>{msg}</p>
    </main>
  );
}

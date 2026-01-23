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

  if (!data) return <main style={{ padding: 24 }}>{msg}</main>;
  if (!data.poll || !data.poll.isActive) return <main style={{ padding: 24 }}>Chưa có cuộc bình chọn đang diễn ra.</main>;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>{data.poll.title}</h1>
      <p style={{ opacity: 0.8 }}>Chọn 1 người để bình chọn (mỗi poll 1 lần).</p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {data.candidates.map((c: any) => (
          <div key={c.userId} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <img src={c.photoUrl} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10 }} />
            <h3 style={{ margin: "10px 0 2px" }}>{c.fullName}</h3>
            <div style={{ opacity: 0.7 }}>@{c.username}</div>
            <button style={{ marginTop: 10 }} onClick={() => vote(c.userId)}>Bình chọn</button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 12 }}>{msg}</p>
    </main>
  );
}

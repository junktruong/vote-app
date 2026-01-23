"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const r = useRouter();
  const [reg, setReg] = useState({ fullName: "", username: "", photoUrl: "" });
  const [loginUsername, setLoginUsername] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/me").then(r=>r.json()).then(d=>{ if(d.user) r.push("/dashboard"); });
  }, [r]);

  async function register() {
    setMsg("Đang tạo...");
    const fd = new FormData();
    fd.append("fullName", reg.fullName);
    fd.append("username", reg.username);
    fd.append("photoUrl", reg.photoUrl);

    const res = await fetch("/api/register", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "Lỗi");
    r.push("/dashboard");
  }

  async function login() {
    setMsg("Đang đăng nhập...");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUsername }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "Lỗi");
    r.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Trang bình chọn</h1>
      <p style={{ opacity: 0.8 }}>1 máy chỉ tạo 1 tài khoản • auto-login theo máy</p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
          <h2>Tạo tài khoản</h2>
          <input placeholder="Họ tên" value={reg.fullName} onChange={e=>setReg(s=>({...s, fullName:e.target.value}))} />
          <br/><br/>
          <input placeholder="Username" value={reg.username} onChange={e=>setReg(s=>({...s, username:e.target.value}))} />
          <br/><br/>
          <input placeholder="Photo URL (dán link ảnh)" value={reg.photoUrl} onChange={e=>setReg(s=>({...s, photoUrl:e.target.value}))} />
          <br/><br/>
          <button onClick={register}>Tạo</button>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
          <h2>Đăng nhập</h2>
          <input placeholder="Username" value={loginUsername} onChange={e=>setLoginUsername(e.target.value)} />
          <br/><br/>
          <button onClick={login}>Đăng nhập</button>
          <p style={{ opacity: 0.8, marginTop: 12 }}>
            * Chỉ đăng nhập được trên đúng máy đã tạo tài khoản.
          </p>
        </section>
      </div>

      <p style={{ marginTop: 16 }}>{msg}</p>
      <p><a href="/admin">Admin</a></p>
    </main>
  );
}

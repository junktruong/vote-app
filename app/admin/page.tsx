"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");

  async function adminLogin() {
    setMsg("Đang đăng nhập...");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setIsAuthed(true);
    setMsg("OK");
    await loadUsers();
  }

  async function loadUsers() {
    // tận dụng /api/results (nếu có poll) là không đủ; nên tạm gọi endpoint tự làm nhanh:
    // để nhanh, lấy danh sách users qua results? Không được.
    // => Bạn muốn chuẩn thì mình sẽ thêm /api/admin/users. Tạm cho nhanh: bạn tạo poll từ ID bạn biết.
    // Mình sẽ làm luôn endpoint users (phần dưới).
    const res = await fetch("/api/admin/users");
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setUsers(d.users);
  }

  async function createPoll() {
    setMsg("Đang tạo poll...");
    const res = await fetch("/api/admin/create-poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, candidateUserIds: Array.from(selected) }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã tạo & bắt đầu!");
  }

  async function stopPoll() {
    const res = await fetch("/api/admin/stop-poll", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đã dừng." : (d.error || "Lỗi"));
  }

  async function reveal() {
    const res = await fetch("/api/admin/reveal", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đã công bố (HIỆN)!" : (d.error || "Lỗi"));
  }

  useEffect(() => {
    // thử load users, nếu 401 thì chưa authed
    fetch("/api/admin/users").then(async r => {
      if (r.ok) { setIsAuthed(true); setUsers((await r.json()).users); }
    }).catch(()=>{});
  }, []);

  if (!isAuthed) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>Admin</h1>
        <input type="password" placeholder="Mật khẩu admin" value={pw} onChange={e=>setPw(e.target.value)} />
        <button onClick={adminLogin} style={{ marginLeft: 8 }}>Đăng nhập</button>
        <p>{msg}</p>
      </main>
    );
    }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Admin</h1>

      <h3>Tạo cuộc bình chọn</h3>
      <input placeholder="Tiêu đề" value={title} onChange={e=>setTitle(e.target.value)} style={{ width: "100%" }} />
      <p style={{ opacity: 0.8 }}>Chọn ứng viên:</p>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, 1fr)" }}>
        {users.map(u => (
          <label key={u.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <img src={u.photoUrl} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{u.fullName}</div>
              <div style={{ opacity: 0.7 }}>@{u.username}</div>
            </div>
            <input
              type="checkbox"
              checked={selected.has(u.id)}
              onChange={() => {
                setSelected(prev => {
                  const n = new Set(prev);
                  n.has(u.id) ? n.delete(u.id) : n.add(u.id);
                  return n;
                });
              }}
            />
          </label>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button onClick={createPoll}>Tạo & Bắt đầu</button>
        <button onClick={stopPoll}>Dừng</button>
        <button onClick={reveal}>Công bố (HIỆN)</button>
      </div>

      <p style={{ marginTop: 12 }}>{msg}</p>
      <p style={{ opacity: 0.8 }}>Trang results sẽ polling 2s/lần và tự show top khi công bố.</p>
    </main>
  );
}

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
      <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
          </div>

          <div className="relative mx-auto flex max-w-xl flex-col gap-6 px-6 pb-16 pt-14">
            <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
              <h1 className="text-2xl font-bold text-red-700">Admin</h1>
              <p className="mt-2 text-sm text-slate-600">Đăng nhập để quản trị cuộc bình chọn.</p>
              <div className="mt-6 flex flex-col gap-4">
                <input
                  type="password"
                  placeholder="Mật khẩu admin"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <button
                  onClick={adminLogin}
                  className="rounded-full bg-[#D32F2F] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#B71C1C]"
                >
                  Đăng nhập
                </button>
                <p className="text-sm text-slate-700">{msg}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
    }

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-14">
          <header className="rounded-3xl border border-red-100 bg-white/90 p-6 shadow-md">
            <p className="text-sm font-semibold text-red-700">Bảng điều khiển</p>
            <h1 className="mt-3 text-3xl font-bold text-red-700">Admin</h1>
            <p className="mt-2 text-sm text-slate-600">Quản trị cuộc bình chọn và cập nhật kết quả ngay lập tức.</p>
          </header>

          <section className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">Tạo cuộc bình chọn</h3>
            <input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-4 w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <p className="mt-4 text-sm text-slate-600">Chọn ứng viên:</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm transition hover:border-red-200"
                >
                  <img src={u.photoUrl} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-sm text-slate-500">@{u.username}</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#D32F2F]"
                    checked={selected.has(u.id)}
                    onChange={() => {
                      setSelected((prev) => {
                        const n = new Set(prev);
                        n.has(u.id) ? n.delete(u.id) : n.add(u.id);
                        return n;
                      });
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <button
              onClick={createPoll}
              className="rounded-full bg-[#D32F2F] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#B71C1C]"
            >
              Tạo &amp; Bắt đầu
            </button>
            <button
              onClick={stopPoll}
              className="rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              Dừng
            </button>
            <button
              onClick={reveal}
              className="rounded-full bg-[#FBC02D] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-[#F9A825]"
            >
              Công bố (HIỆN)
            </button>
          </section>

          <div className="rounded-3xl border border-yellow-100 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
            <p>{msg}</p>
            <p className="mt-2 text-slate-500">Trang results sẽ polling 2s/lần và tự show top khi công bố.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

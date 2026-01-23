"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState(3);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");
  const [polls, setPolls] = useState<any[]>([]);

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
    await loadPolls();
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

  async function loadPolls() {
    const res = await fetch("/api/admin/polls");
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setPolls(d.polls);
  }

  async function createPoll() {
    setMsg("Đang tạo poll...");
    const res = await fetch("/api/admin/create-poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, candidateUserIds: Array.from(selected), maxVotes }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã tạo & bắt đầu!");
    await loadPolls();
  }

  async function stopPoll() {
    const res = await fetch("/api/admin/stop-poll", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đã dừng." : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  async function reveal() {
    const res = await fetch("/api/admin/reveal", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đã công bố (HIỆN)!" : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  async function updatePoll(pollId: string, payload: any) {
    const res = await fetch(`/api/admin/polls/${pollId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã cập nhật poll.");
    await loadPolls();
  }

  async function deletePoll(pollId: string) {
    const ok = confirm("Bạn chắc chắn muốn xoá poll này?");
    if (!ok) return;
    const res = await fetch(`/api/admin/polls/${pollId}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã xoá poll.");
    await loadPolls();
  }

  async function resetVotes(pollId: string) {
    const ok = confirm("Reset toàn bộ phiếu cho poll này?");
    if (!ok) return;
    const res = await fetch(`/api/admin/polls/${pollId}/reset-votes`, { method: "POST" });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã reset phiếu.");
  }

  useEffect(() => {
    // thử load users, nếu 401 thì chưa authed
    fetch("/api/admin/users").then(async r => {
      if (r.ok) {
        setIsAuthed(true);
        setUsers((await r.json()).users);
        await loadPolls();
      }
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-600">
                Số lượt vote mỗi người
                <input
                  type="number"
                  min={1}
                  value={maxVotes}
                  onChange={(e) => setMaxVotes(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-slate-600">Chọn ứng viên:</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm transition hover:border-red-200"
                >
                  <img src={u.thumb} className="h-12 w-12 rounded-xl object-cover" />
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

          <section className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">Danh sách poll</h3>
            <div className="mt-4 flex flex-col gap-4">
              {polls.map((poll) => (
                <div key={poll.id} className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex-1">
                      <input
                        value={poll.title}
                        onChange={(e) => {
                          setPolls((prev) =>
                            prev.map((p) => (p.id === poll.id ? { ...p, title: e.target.value } : p))
                          );
                        }}
                        className="w-full rounded-xl border border-red-100 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Ứng viên: {poll.candidateCount} • Tạo: {new Date(poll.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <label className="text-xs text-slate-600">
                      Max vote
                      <input
                        type="number"
                        min={1}
                        value={poll.maxVotes}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setPolls((prev) =>
                            prev.map((p) => (p.id === poll.id ? { ...p, maxVotes: value } : p))
                          );
                        }}
                        className="mt-2 w-24 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${poll.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.isActive ? "Đang chạy" : "Đã dừng"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${poll.showOnResults ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.showOnResults ? "Đang hiển thị kết quả" : "Chưa hiển thị"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${poll.revealWinner ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.revealWinner ? "Đã công bố" : "Đang ẩn"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => updatePoll(poll.id, { title: poll.title, maxVotes: poll.maxVotes })}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Lưu chỉnh sửa
                    </button>
                    <button
                      onClick={() => updatePoll(poll.id, { isActive: true })}
                      className="rounded-full border border-green-200 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                    >
                      Kích hoạt
                    </button>
                    <button
                      onClick={() => updatePoll(poll.id, { showOnResults: true })}
                      className="rounded-full border border-yellow-200 px-4 py-2 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-50"
                    >
                      Hiện ở trang kết quả
                    </button>
                    <button
                      onClick={() => resetVotes(poll.id)}
                      className="rounded-full border border-orange-200 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      Reset phiếu
                    </button>
                    <button
                      onClick={() => deletePoll(poll.id)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Xoá poll
                    </button>
                  </div>
                </div>
              ))}
              {!polls.length ? (
                <p className="text-sm text-slate-500">Chưa có poll nào.</p>
              ) : null}
            </div>
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

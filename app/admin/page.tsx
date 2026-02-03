"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const r = useRouter();
  const [pw, setPw] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState(3);
  const [candidateInput, setCandidateInput] = useState("");
  const [msg, setMsg] = useState("");
  const [polls, setPolls] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [votesPollTitle, setVotesPollTitle] = useState("");
  const [spinSpecial, setSpinSpecial] = useState("");
  const [spinFirst, setSpinFirst] = useState("");
  const [spinSecond, setSpinSecond] = useState("");
  const [spinThird, setSpinThird] = useState("");

  function parseCandidates(input: string) {
    const raw = input
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);
    return Array.from(new Set(raw));
  }

  const candidateNames = parseCandidates(candidateInput);

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
    await loadPolls();
    await loadVotes();
  }

  async function loadPolls() {
    const res = await fetch("/api/admin/polls");
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setPolls(d.polls);
    const latest = d.polls?.[0];
    if (latest) {
      setSpinSpecial(latest.spinConfigSpecial ? String(latest.spinConfigSpecial) : "");
      setSpinFirst(latest.spinConfigFirst ? String(latest.spinConfigFirst) : "");
      setSpinSecond(Array.isArray(latest.spinConfigSecond) ? latest.spinConfigSecond.join(", ") : "");
      setSpinThird(Array.isArray(latest.spinConfigThird) ? latest.spinConfigThird.join(", ") : "");
    }
  }

  async function loadVotes() {
    const res = await fetch("/api/admin/votes");
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setVoters(d.voters || []);
    setVotesPollTitle(d.poll?.title || "");
  }

  async function createPoll() {
    setMsg("Đang tạo poll...");
    const res = await fetch("/api/admin/create-poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, candidateNames, maxVotes }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã tạo & bắt đầu!");
    await loadPolls();
    await loadVotes();
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
    await loadVotes();
  }

  async function resetVotesForUser(userId: string) {
    const ok = confirm("Bạn chắc chắn muốn xoá tất cả phiếu của người này?");
    if (!ok) return;
    const res = await fetch("/api/admin/votes/reset-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã xoá phiếu của người này.");
    await loadVotes();
  }

  async function startRevealCountdown(pollId: string) {
    const res = await fetch(`/api/polls/${pollId}/start`, { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đã bắt đầu đếm giờ công bố." : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  async function spinNow(pollId: string) {
    const res = await fetch("/api/admin/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, prize: "encourage" }),
    });
    const d = await res.json();
    setMsg(res.ok ? `Đã quay số: ${d.spinWinnerName || ""}` : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  async function spinPrize(pollId: string, prize: string) {
    const res = await fetch("/api/admin/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, prize }),
    });
    const d = await res.json();
    setMsg(res.ok ? `Đã quay ${d.spinLatestPrize || ""}: ${d.spinLatestNumber || ""}` : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  async function saveSpinConfig(pollId: string) {
    const res = await fetch("/api/admin/spin-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pollId,
        special: spinSpecial,
        first: spinFirst,
        second: spinSecond,
        third: spinThird,
      }),
    });
    const d = await res.json();
    setMsg(res.ok ? "Đã lưu cấu hình quay số." : (d.error || "Lỗi"));
    if (res.ok) await loadPolls();
  }

  useEffect(() => {
    fetch("/api/admin/polls")
      .then(async (r) => {
        if (r.ok) {
          setIsAuthed(true);
          await loadPolls();
          await loadVotes();
        }
      })
      .catch(() => {});
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
            <div className="mt-5">
              <button
                onClick={() => r.push("/spin")}
                className="rounded-full border border-red-200 bg-white px-6 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Mở trang quay số
              </button>
            </div>
          </header>

          <section className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">Tạo cuộc bình chọn</h3>
            <p className="mt-2 text-sm text-slate-600">Sau khi tạo, vào trang kết quả bấm Bắt đầu để đếm 3 phút.</p>
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
            <p className="mt-4 text-sm text-slate-600">Danh sách ứng viên (mỗi dòng 1 tên hoặc phân tách bằng dấu phẩy):</p>
            <textarea
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              rows={5}
              placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B..."
              className="mt-3 w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {candidateNames.map((name) => (
                <span key={name} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                  {name}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <button
              onClick={createPoll}
              disabled={!title.trim() || candidateNames.length < 2}
              className="rounded-full bg-[#D32F2F] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
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
                      <div className="w-full rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                        {poll.title}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Ứng viên: {poll.candidateCount} • Tạo: {new Date(poll.createdAt).toLocaleString("vi-VN")}
                        {poll.votingEndsAt ? ` • Kết thúc: ${new Date(poll.votingEndsAt).toLocaleString("vi-VN")}` : ""}
                      </p>
                    </div>
                    <div className="text-xs text-slate-600">
                      Max vote
                      <div className="mt-2 w-24 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
                        {poll.maxVotes}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${poll.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.isActive ? "Đang chạy" : "Đã dừng"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${poll.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {poll.status === "OPEN" ? "Vote mở" : "Vote đóng"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${poll.showOnResults ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.showOnResults ? "Đang hiển thị kết quả" : "Chưa hiển thị"}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${poll.revealWinner ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                      {poll.revealWinner ? "Đã công bố" : "Đang ẩn"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      Trạng thái: {poll.revealState || "NOT_STARTED"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      Quay số: {poll.spinLatestPrize ? `${poll.spinLatestPrize} - ${poll.spinLatestNumber}` : "Chưa quay"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => startRevealCountdown(poll.id)}
                      disabled={poll.revealState !== "NOT_STARTED"}
                      className="rounded-full border border-yellow-200 px-4 py-2 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Bắt đầu đếm giờ
                    </button>
                    <button
                      onClick={() => spinPrize(poll.id, "encourage")}
                      className="rounded-full border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                    >
                      Quay khuyến khích
                    </button>
                    <button
                      onClick={() => spinPrize(poll.id, "third")}
                      className="rounded-full border border-orange-200 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      Quay giải ba
                    </button>
                    <button
                      onClick={() => spinPrize(poll.id, "second")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Quay giải nhì
                    </button>
                    <button
                      onClick={() => spinPrize(poll.id, "first")}
                      className="rounded-full border border-yellow-200 px-4 py-2 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-50"
                    >
                      Quay giải nhất
                    </button>
                    <button
                      onClick={() => spinPrize(poll.id, "special")}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Quay đặc biệt
                    </button>
                    <button
                      onClick={() => updatePoll(poll.id, { status: "OPEN" })}
                      className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Mở vote
                    </button>
                    <button
                      onClick={() => updatePoll(poll.id, { status: "CLOSED" })}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Đóng vote
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
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Cấu hình quay số (đặc biệt/nhất/nhì/ba)</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs text-slate-600">
                        Đặc biệt (1 số)
                        <input
                          value={spinSpecial}
                          onChange={(e) => setSpinSpecial(e.target.value)}
                          placeholder="VD: 88"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-600">
                        Giải nhất (1 số)
                        <input
                          value={spinFirst}
                          onChange={(e) => setSpinFirst(e.target.value)}
                          placeholder="VD: 12"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-600">
                        Giải nhì (2 số)
                        <input
                          value={spinSecond}
                          onChange={(e) => setSpinSecond(e.target.value)}
                          placeholder="VD: 03, 15"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-600">
                        Giải ba (3 số)
                        <input
                          value={spinThird}
                          onChange={(e) => setSpinThird(e.target.value)}
                          placeholder="VD: 05, 22, 30"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none"
                        />
                      </label>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => saveSpinConfig(poll.id)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                      >
                        Lưu cấu hình quay số
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!polls.length ? (
                <p className="text-sm text-slate-500">Chưa có poll nào.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Phiếu đã ghi nhận</h3>
              <button
                onClick={loadVotes}
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Làm mới danh sách
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {votesPollTitle ? `Theo poll: ${votesPollTitle}` : "Chưa có poll để thống kê."}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {voters.map((voter) => (
                <div key={voter.userId} className="rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{voter.fullName}</p>
                      <p className="text-xs text-slate-500">Số phiếu: {voter.count}</p>
                      {voter.candidateNames?.length ? (
                        <p className="text-xs text-slate-500">
                          Đã vote: {voter.candidateNames.join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => resetVotesForUser(voter.userId)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Huỷ phiếu người này
                    </button>
                  </div>
                </div>
              ))}
              {!voters.length ? (
                <p className="text-sm text-slate-500">Chưa có lượt vote nào.</p>
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

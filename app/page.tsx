"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const r = useRouter();
  const photoInputId = useId();
  const [reg, setReg] = useState({ fullName: "", username: "", photoUrl: "" });
  const [loginUsername, setLoginUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) r.push("/dashboard");
      });
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

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReg((s) => ({ ...s, photoUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/flowers.png')] opacity-30" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-14">
          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full border border-red-200 bg-white/70 px-4 py-1 text-sm font-semibold text-red-700 shadow-sm">
                Tết 2025 • Chúc mừng năm mới
              </span>
              <h1 className="text-4xl font-bold leading-tight text-red-700 sm:text-5xl">
                Chào xuân mới, gửi lời chúc và bình chọn rực rỡ may mắn.
              </h1>
              <p className="max-w-2xl text-lg text-slate-700">
                Trang bình chọn được khoác áo Tết hiện đại, sạch thoáng, tập trung vào trải nghiệm nhanh chóng
                và thân thiện. Hãy tạo tài khoản để tham gia bình chọn và chia sẻ khoảnh khắc đáng nhớ.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-2xl border border-red-100 bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-red-700">Lời chúc đầu xuân</p>
                  <p className="text-sm text-slate-600">An khang thịnh vượng • Vạn sự như ý</p>
                </div>
                <div className="rounded-2xl border border-yellow-100 bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-yellow-700">Ưu điểm nổi bật</p>
                  <p className="text-sm text-slate-600">Giao diện gọn gàng, dễ sử dụng trên mọi thiết bị.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-white/90 p-6 shadow-lg backdrop-blur">
              <p className="text-sm font-semibold text-red-700">Tính năng nổi bật</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Feature Card: Khoảnh khắc Tết</h2>
              <p className="mt-3 text-sm text-slate-600">
                Ghi lại ảnh Tết bằng camera hoặc chọn từ máy. Hệ thống sẽ hiển thị ảnh đẹp nhất cùng bảng xếp hạng bình chọn.
              </p>
              <div className="mt-6 rounded-2xl border border-yellow-200 bg-[#FFF7D1] p-4">
                <p className="text-sm font-semibold text-yellow-700">Gợi ý</p>
                <p className="text-sm text-slate-700">
                  Ưu tiên ảnh sáng, rõ mặt và có không khí Tết như hoa mai, hoa đào hoặc đèn lồng.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
              <h2 className="text-xl font-semibold text-red-700">Tạo tài khoản</h2>
              <p className="mt-2 text-sm text-slate-600">1 máy chỉ tạo 1 tài khoản • auto-login theo máy</p>

              <div className="mt-6 space-y-4">
                <input
                  className="w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Họ tên"
                  value={reg.fullName}
                  onChange={(e) => setReg((s) => ({ ...s, fullName: e.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Username"
                  value={reg.username}
                  onChange={(e) => setReg((s) => ({ ...s, username: e.target.value }))}
                />

                <div className="rounded-2xl border border-dashed border-yellow-300 bg-[#FFF7D1] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-yellow-700">Ảnh đại diện</p>
                      <p className="text-xs text-slate-600">
                        Chụp ảnh hoặc chọn ảnh trong máy để tham gia bình chọn.
                      </p>
                      {photoName ? (
                        <p className="mt-2 text-xs font-medium text-slate-700">Đã chọn: {photoName}</p>
                      ) : null}
                    </div>
                    <label
                      htmlFor={photoInputId}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#D32F2F] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#B71C1C]"
                    >
                      Chọn ảnh
                    </label>
                    <input
                      id={photoInputId}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  {reg.photoUrl ? (
                    <img
                      src={reg.photoUrl}
                      alt="Ảnh đại diện"
                      className="mt-4 h-32 w-32 rounded-2xl object-cover shadow"
                    />
                  ) : null}
                </div>

                <button
                  onClick={register}
                  className="w-full rounded-full bg-[#D32F2F] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#B71C1C]"
                >
                  Tạo tài khoản
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-100 bg-white/95 p-6 shadow-md">
              <h2 className="text-xl font-semibold text-red-700">Đăng nhập</h2>
              <p className="mt-2 text-sm text-slate-600">
                * Chỉ đăng nhập được trên đúng máy đã tạo tài khoản.
              </p>

              <div className="mt-6 space-y-4">
                <input
                  className="w-full rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <button
                  onClick={login}
                  className="w-full rounded-full bg-[#FBC02D] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-[#F9A825]"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-red-100 bg-white/80 p-5 text-sm text-slate-700 shadow-sm">
            <span>{msg}</span>
            <a className="font-semibold text-red-700 hover:text-red-600" href="/admin">
              Quản trị hệ thống
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

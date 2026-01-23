"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const r = useRouter();
  const photoInputId = useId();
  const [reg, setReg] = useState({ fullName: "", username: "", photoUrl: "" });
  const [loginUsername, setLoginUsername] = useState("");
  const [mode, setMode] = useState<"register" | "login">("register");
  const [msg, setMsg] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) r.push("/dashboard");
      });
  }, [r]);

  async function register() {
    setMsg("Đang tạo...");
    if (!photoFile) {
      setMsg("Vui lòng chọn ảnh đại diện.");
      return;
    }
    const fd = new FormData();
    fd.append("fullName", reg.fullName);
    fd.append("username", reg.username);
    fd.append("photo", photoFile);

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
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setReg((s) => ({ ...s, photoUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  const isRegister = mode === "register";

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,192,45,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(211,47,47,0.16),_transparent_60%)]" />
        </div>

        <div className="relative flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-red-100 bg-white/95 p-6 shadow-lg backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 text-center">
            <span className="mx-auto w-fit rounded-full border border-red-200 bg-white px-4 py-1 text-xs font-semibold text-red-700">
              Tết 2025 • Chúc mừng năm mới
            </span>
            <h1 className="text-2xl font-bold text-red-700 sm:text-3xl">
              An khang thịnh vượng, vạn sự như ý.
            </h1>
            <p className="text-sm text-slate-600">
              Chỉ còn lại phần đăng ký và đăng nhập để bạn bắt đầu bình chọn nhanh chóng.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-red-700">
                  {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isRegister
                    ? "1 máy chỉ tạo 1 tài khoản • auto-login theo máy"
                    : "Chỉ đăng nhập được trên đúng máy đã tạo tài khoản."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode(isRegister ? "login" : "register")}
                className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:text-red-600"
              >
                {isRegister ? "Chuyển sang đăng nhập" : "Chuyển sang đăng ký"}
              </button>
            </div>

            {isRegister ? (
              <div className="space-y-4">
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
            ) : (
              <div className="space-y-4">
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
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-white/80 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
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

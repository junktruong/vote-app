"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Dùng thẻ img thường nếu không config next/image, ở đây mình dùng thẻ img native cho đơn giản với logic cũ

// --- LOGIC HELPER FUNCTIONS (GIỮ NGUYÊN) ---
function isInAppBrowser(userAgent: string) {
  const patterns = [
    /Zalo/i,
    /FBAN|FBAV|Messenger|Meta/i,
    /Instagram/i,
    /Line/i,
    /TikTok/i,
    /Snapchat/i,
    /LinkedInApp/i,
  ];
  return patterns.some((pattern) => pattern.test(userAgent));
}

function openInDefaultBrowser(url: string, userAgent: string) {
  const isAndroid = /Android/i.test(userAgent);
  if (isAndroid) {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "") || "https";
    const cleanUrl = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=${scheme};package=com.android.chrome;end`;
    window.location.href = intentUrl;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Home() {
  const r = useRouter();
  const photoInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE (GIỮ NGUYÊN) ---
  const [reg, setReg] = useState({ fullName: "", photoUrl: "" });
  const [mode, setMode] = useState<"register" | "login">("register");
  const [msg, setMsg] = useState("");
  const [photoName, setPhotoName] = useState(""); // Vẫn giữ biến này để logic không đổi, dù UI có thể không hiển thị tên file text
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // --- EFFECTS (GIỮ NGUYÊN) ---
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) r.push("/dashboard");
      });
  }, [r]);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const detectedInAppBrowser = isInAppBrowser(ua);
    setInAppBrowser(detectedInAppBrowser);
    if (detectedInAppBrowser) {
      openInDefaultBrowser(window.location.href, ua);
    }
  }, []);

  // --- HANDLERS (GIỮ NGUYÊN) ---
  async function register() {
    setMsg("Đang khởi tạo...");
    if (!photoFile) {
      setMsg("Vui lòng chọn ảnh đại diện.");
      return;
    }
    const fd = new FormData();
    fd.append("fullName", reg.fullName);
    fd.append("photo", photoFile);

    try {
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Lỗi đăng ký");
      r.push("/dashboard");
    } catch (e) {
      setMsg("Lỗi kết nối server");
    }
  }

  async function login() {
    setMsg("Đang đăng nhập...");
    try {
      const res = await fetch("/api/login", { method: "POST" });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Lỗi đăng nhập");
      r.push("/dashboard");
    } catch (e) {
      setMsg("Lỗi kết nối server");
    }
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

  function openFilePicker() {
    fileInputRef.current?.click();
    setShowPhotoOptions(false);
  }

  function openCameraPicker() {
    cameraInputRef.current?.click();
    setShowPhotoOptions(false);
  }

  const isRegister = mode === "register";

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900 selection:bg-red-100">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(251,192,45,0.15),_transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,_rgba(211,47,47,0.1),_transparent_70%)]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Header Card */}
          <div className="mb-6 text-center">
            <div className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
              Xuân Bính Ngọ 2026
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
              Cổng Bình Chọn
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Vui lòng định danh để tham gia hệ thống
            </p>
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-900/5">
            
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/50 p-2">
              <button
                onClick={() => setMode("register")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  isRegister
                    ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng ký mới
              </button>
              <button
                onClick={() => setMode("login")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  !isRegister
                    ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng nhập lại
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* Cảnh báo In-App Browser */}
              {inAppBrowser && (
                <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200">
                  <p className="font-bold">⚠️ Lưu ý trình duyệt</p>
                  <p className="mt-1">
                    Hệ thống hoạt động tốt nhất trên Chrome/Safari. 
                  </p>
                  <button
                    onClick={() => openInDefaultBrowser(window.location.href, navigator.userAgent || "")}
                    className="mt-2 font-semibold underline decoration-amber-800/50 underline-offset-2"
                  >
                    Mở trình duyệt mặc định &rarr;
                  </button>
                </div>
              )}

              {/* Form Content */}
              {isRegister ? (
                <div className="space-y-6">
                  {/* Avatar Upload - Thiết kế dạng tròn trung tâm */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => setShowPhotoOptions((s) => !s)}
                        className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-md transition-transform active:scale-95 group-hover:border-red-100"
                        aria-haspopup="dialog"
                        aria-expanded={showPhotoOptions}
                      >
                        {reg.photoUrl ? (
                          <img
                            src={reg.photoUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                            <span className="text-[10px] font-semibold uppercase">Chọn ảnh</span>
                          </div>
                        )}
                        {/* Overlay khi hover */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                      {showPhotoOptions && (
                        <div className="absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-xl">
                          <button
                            type="button"
                            onClick={openFilePicker}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                          >
                            <span>Chọn ảnh từ thư viện</span>
                            <span className="text-slate-400">📁</span>
                          </button>
                          <button
                            type="button"
                            onClick={openCameraPicker}
                            className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                          >
                            <span>Chụp ảnh mới</span>
                            <span className="text-slate-400">📷</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPhotoOptions(false)}
                            className="mt-1 flex w-full items-center justify-center rounded-xl px-3 py-2 text-slate-500 transition hover:bg-slate-100"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      <input
                        id={photoInputId}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                      />
                      <input
                        id={`${photoInputId}-camera`}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={cameraInputRef}
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Chạm để chọn hoặc chụp ảnh đại diện</p>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Họ và Tên
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
                      placeholder="Nhập tên của bạn..."
                      value={reg.fullName}
                      onChange={(e) => setReg((s) => ({ ...s, fullName: e.target.value }))}
                    />
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={register}
                    className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 active:translate-y-0.5"
                  >
                    Tạo tài khoản ngay
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-6">
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-xl">
                      📱
                    </div>
                    <h3 className="text-sm font-bold text-yellow-800">Cơ chế đăng nhập</h3>
                    <p className="mt-1 text-xs text-yellow-700/80">
                      Hệ thống tự động nhận diện thiết bị của bạn. Không cần mật khẩu.
                    </p>
                  </div>

                  <button
                    onClick={login}
                    className="w-full rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-bold text-yellow-900 shadow-lg shadow-yellow-400/20 transition-all hover:bg-yellow-500 hover:shadow-yellow-400/30 active:translate-y-0.5"
                  >
                    Đăng nhập vào hệ thống
                  </button>
                </div>
              )}

              {/* Status Message */}
              {msg && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 animate-pulse">
                   {/* Icon nhỏ minh họa loading hoặc info */}
                   <span>🔔</span>
                   <span>{msg}</span>
                </div>
              )}
            </div>
            
            {/* Footer Card */}
            <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
              <a href="/admin" className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors">
                Trang quản trị (Admin only)
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

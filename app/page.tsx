"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function HomeContent() {
  const r = useRouter();
  const searchParams = useSearchParams();
  const accessTokenKey = "accessToken";

  // --- STATE (GIỮ NGUYÊN) ---
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    let active = true;
    const loggedOut = searchParams.get("logged_out") === "1";
    if (loggedOut) {
      localStorage.removeItem(accessTokenKey);
    }

    async function bootstrap() {
      const token = localStorage.getItem(accessTokenKey);
      if (token) {
        const sessionRes = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token }),
        });
        if (!sessionRes.ok) {
          localStorage.removeItem(accessTokenKey);
        }
      }

      const res = await fetch("/api/me");
      const d = await res.json();
      if (active && d.user) r.push("/dashboard");
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [r, searchParams]);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const detectedInAppBrowser = isInAppBrowser(ua);
    setInAppBrowser(detectedInAppBrowser);
    if (detectedInAppBrowser) {
      openInDefaultBrowser(window.location.href, ua);
    }
  }, []);

  async function login() {
    if (!fullName.trim()) {
      setMsg("Vui lòng nhập tên của bạn.");
      return;
    }
    setMsg("Đang đăng nhập...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Lỗi đăng nhập");
      if (data.accessToken) {
        localStorage.setItem(accessTokenKey, data.accessToken);
      }
      r.push("/dashboard");
    } catch (e) {
      setMsg("Lỗi kết nối server");
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFAF0] text-slate-900 selection:bg-red-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(251,192,45,0.15),_transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,_rgba(211,47,47,0.1),_transparent_70%)]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
              Xuân Bính Ngọ 2026
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Cổng Bình Chọn</h1>
            <p className="mt-2 text-sm text-slate-500">Chỉ cần nhập tên để tham gia bình chọn</p>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-900/5">
            <div className="p-6 sm:p-8">
              {inAppBrowser && (
                <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200">
                  <p className="font-bold">⚠️ Lưu ý trình duyệt</p>
                  <p className="mt-1">Hệ thống hoạt động tốt nhất trên Chrome/Safari.</p>
                  <button
                    onClick={() => openInDefaultBrowser(window.location.href, navigator.userAgent || "")}
                    className="mt-2 font-semibold underline decoration-amber-800/50 underline-offset-2"
                  >
                    Mở trình duyệt mặc định &rarr;
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Họ và Tên</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    placeholder="Nhập tên của bạn..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <button
                  onClick={login}
                  disabled={!fullName.trim()}
                  className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  Vào hệ thống
                </button>
              </div>

              {msg && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 animate-pulse">
                  <span>🔔</span>
                  <span>{msg}</span>
                </div>
              )}
            </div>

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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

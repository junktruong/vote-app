"use client";

import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  deviceId: string;
};

type ApiResponse =
  | { ok: true; user: User }
  | { ok: false; message: string };

export default function Home() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [quickUsername, setQuickUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  const canRegister = useMemo(() => {
    return displayName.trim() && username.trim() && avatarUrl.trim();
  }, [displayName, username, avatarUrl]);

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    const nextDeviceId =
      storedDeviceId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    if (!storedDeviceId) {
      localStorage.setItem("deviceId", nextDeviceId);
    }
    setDeviceId(nextDeviceId);

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setQuickUsername(storedUsername);
      void handleLogin(storedUsername, nextDeviceId, true);
    }
  }, []);

  const handleRegister = async () => {
    setStatus("Đang tạo tài khoản...");
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        displayName: displayName.trim(),
        username: username.trim(),
        avatarUrl: avatarUrl.trim(),
        deviceId,
      }),
    });
    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      setStatus(data.message);
      return;
    }
    localStorage.setItem("username", data.user.username);
    setStatus(`Xin chào ${data.user.displayName}!`);
    setCurrentUser(data.user);
  };

  const handleLogin = async (
    nextUsername: string,
    nextDeviceId = deviceId,
    isAuto = false,
  ) => {
    if (!nextUsername.trim()) {
      setStatus("Vui lòng nhập tên đăng nhập.");
      return;
    }
    setStatus(isAuto ? "Đang tự đăng nhập..." : "Đang đăng nhập...");
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        username: nextUsername.trim(),
        deviceId: nextDeviceId,
      }),
    });
    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      setStatus(data.message);
      return;
    }
    localStorage.setItem("username", data.user.username);
    setStatus(`Đăng nhập thành công: ${data.user.displayName}`);
    setCurrentUser(data.user);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold">Tạo tài khoản bỏ phiếu</h1>
          <p className="text-base text-slate-600">
            Mỗi thiết bị chỉ được tạo một tài khoản. Thiết bị sẽ được định danh
            bằng <span className="font-medium">deviceId</span> lưu trong trình
            duyệt.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <div className="text-slate-500">DeviceId hiện tại</div>
            <div className="mt-1 font-mono text-slate-900">{deviceId}</div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Đăng ký tài khoản mới</h2>
            <p className="mt-2 text-sm text-slate-500">
              Nhập đầy đủ thông tin để tạo tài khoản gắn với thiết bị này.
            </p>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Tên hiển thị
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Ví dụ: Mai Anh"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Tên đăng nhập
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="mai.anh"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Ảnh đại diện
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <button
                type="button"
                onClick={handleRegister}
                disabled={!canRegister}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Đăng nhập nhanh</h2>
              <p className="mt-2 text-sm text-slate-500">
                Nhập tên đăng nhập, hệ thống sẽ kiểm tra deviceId đang lưu.
              </p>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Tên đăng nhập
                  <input
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    value={quickUsername}
                    onChange={(event) => setQuickUsername(event.target.value)}
                    placeholder="mai.anh"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleLogin(quickUsername)}
                  className="rounded-xl border border-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Đăng nhập
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Thông tin đăng nhập</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  Trạng thái:{" "}
                  <span className="font-medium text-slate-900">
                    {status ?? "Chưa đăng nhập"}
                  </span>
                </p>
                {currentUser ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {currentUser.displayName}
                      </div>
                      <div>@{currentUser.username}</div>
                      <div className="mt-2 break-all text-xs text-slate-500">
                        DeviceId: {currentUser.deviceId}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Ảnh đại diện: {currentUser.avatarUrl}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Hãy đăng nhập hoặc đăng ký để xem thông tin tài khoản.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

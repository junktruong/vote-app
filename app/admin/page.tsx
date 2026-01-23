"use client";

import { useEffect, useMemo, useState } from "react";

type Poll = {
  title: string;
  description: string;
  candidates: string[];
  status: "open" | "closed";
  reveal: boolean;
  createdAt: string;
  closedAt?: string;
};

type ApiResponse = {
  poll: Poll | null;
  error?: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidatesText, setCandidatesText] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [revealOnClose, setRevealOnClose] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const candidatesPreview = useMemo(() => {
    return candidatesText
      .split("\n")
      .map((candidate) => candidate.trim())
      .filter(Boolean);
  }, [candidatesText]);

  const loadPoll = async () => {
    const response = await fetch("/api/polls", { cache: "no-store" });
    const data = (await response.json()) as ApiResponse;
    setPoll(data.poll);
  };

  useEffect(() => {
    void loadPoll();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          candidates: candidatesPreview,
          adminPassword,
        }),
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create poll.");
      }

      setTitle("");
      setDescription("");
      setCandidatesText("");
      setPoll(data.poll);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    setError(null);

    try {
      const response = await fetch("/api/polls", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reveal: revealOnClose,
          adminPassword,
        }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to close poll.");
      }
      setPoll(data.poll);
    } catch (closeError) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : "Unexpected error.",
      );
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tạo cuộc bình chọn mới
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Điền tiêu đề, mô tả, danh sách ứng viên và mật khẩu admin để bắt đầu
            một cuộc bình chọn.
          </p>
        </header>

        <form
          className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Mật khẩu admin</label>
            <input
              type="password"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder="Nhập ADMIN_PASSWORD"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Bình chọn đội bóng yêu thích"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mục tiêu cuộc bình chọn, thời gian, luật chơi..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Danh sách ứng viên</label>
            <textarea
              className="min-h-[160px] w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={candidatesText}
              onChange={(event) => setCandidatesText(event.target.value)}
              placeholder="Mỗi dòng là một ứng viên"
              required
            />
            <p className="text-xs text-zinc-500">
              Đã nhập {candidatesPreview.length} ứng viên.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo cuộc bình chọn"}
          </button>
        </form>

        <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Trạng thái hiện tại</h2>
              <p className="text-sm text-zinc-500">
                {poll
                  ? `Cuộc bình chọn hiện đang ${
                      poll.status === "open" ? "mở" : "đã dừng"
                    }.`
                  : "Chưa có cuộc bình chọn nào."}
              </p>
            </div>
            {poll ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                {poll.status}
              </span>
            ) : null}
          </div>

          {poll ? (
            <div className="grid gap-3 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">Tiêu đề:</span>{" "}
                {poll.title}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Mô tả:</span>{" "}
                {poll.description || "(không có)"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Ứng viên:</span>{" "}
                {poll.candidates.join(", ")}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Hiển thị kết quả:</span>{" "}
                {poll.reveal ? "Có" : "Chưa"}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 md:flex md:items-center md:justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                checked={revealOnClose}
                onChange={(event) => setRevealOnClose(event.target.checked)}
              />
              Reveal kết quả khi đóng
            </label>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={() => void handleClose()}
              disabled={!poll || poll.status === "closed" || closing}
            >
              {closing ? "Đang đóng..." : "Đóng cuộc bình chọn"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

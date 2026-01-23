"use client";

import { useEffect, useState } from "react";

type Results = {
  totalVotes: number;
  leader: {
    id: string;
    name: string;
    image: string;
    votes: number;
  } | null;
  revealStatus: "an" | "hien";
  votingOpen: boolean;
};

type ActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

const fetchResults = async () => {
  const response = await fetch("/api/results", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu.");
  }
  return (await response.json()) as Results;
};

const postAdminAction = async (action: "stop" | "reveal") => {
  const response = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { message?: string };
    throw new Error(payload.message ?? "Không thể cập nhật trạng thái.");
  }

  return (await response.json()) as Results;
};

export default function AdminPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    status: "idle",
  });

  useEffect(() => {
    let mounted = true;
    fetchResults()
      .then((data) => {
        if (mounted) {
          setResults(data);
        }
      })
      .catch((error) => {
        console.error(error);
        if (mounted) {
          setActionState({
            status: "error",
            message: "Không thể tải dữ liệu quản trị.",
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleAction = async (action: "stop" | "reveal") => {
    setActionState({ status: "loading" });
    try {
      const data = await postAdminAction(action);
      setResults(data);
      setActionState({
        status: "success",
        message:
          action === "stop"
            ? "Đã dừng bình chọn."
            : "Đã công bố kết quả.",
      });
    } catch (error) {
      console.error(error);
      setActionState({
        status: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Khu vực quản trị
          </p>
          <h1 className="text-4xl font-semibold">Bảng điều khiển</h1>
          <p className="text-base text-zinc-300">
            Quản lý trạng thái bình chọn và công bố kết quả.
          </p>
        </header>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">Tổng số phiếu</p>
              <p className="text-3xl font-semibold text-white">
                {results ? results.totalVotes : "--"}
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              {results?.votingOpen ? "Đang bình chọn" : "Đã dừng bình chọn"}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              {results?.revealStatus === "hien" ? "Đã công bố" : "Chưa công bố"}
            </span>
            <span>
              {results?.revealStatus === "hien"
                ? "Kết quả đã hiển thị trên trang công khai."
                : "Kết quả chưa hiển thị."}
            </span>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Thao tác nhanh</h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/30"
              onClick={() => handleAction("stop")}
              disabled={actionState.status === "loading" || !results?.votingOpen}
            >
              Dừng bình chọn
            </button>
            <button
              type="button"
              className="flex-1 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/50"
              onClick={() => handleAction("reveal")}
              disabled={actionState.status === "loading" || results?.revealStatus === "hien"}
            >
              Công bố kết quả
            </button>
          </div>
          {actionState.status !== "idle" && actionState.message && (
            <p
              className={`text-sm ${
                actionState.status === "error"
                  ? "text-rose-300"
                  : "text-emerald-300"
              }`}
            >
              {actionState.message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

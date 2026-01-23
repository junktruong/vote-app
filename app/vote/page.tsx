"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Candidate = {
  id: string;
  name: string;
  title: string;
  summary: string;
};

type VoteRecord = {
  userId: string;
  candidateId: string;
  pollId: string;
  votedAt: string;
};

type VoteStatus = {
  authenticated: boolean;
  hasVoted: boolean;
  vote?: VoteRecord | null;
};

const STORAGE_KEY = "vote-app-user";

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<VoteStatus>({
    authenticated: false,
    hasVoted: false,
  });
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUserId(storedUser);
    }
  }, []);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const response = await fetch("/api/candidates");
        const data = (await response.json()) as { candidates: Candidate[] };
        setCandidates(data.candidates ?? []);
      } catch (error) {
        setErrorMessage("Không thể tải danh sách ứng viên.");
      } finally {
        setLoadingCandidates(false);
      }
    };

    loadCandidates();
  }, []);

  const refreshStatus = useCallback(
    async (currentUserId: string) => {
      if (!currentUserId) {
        setStatus({ authenticated: false, hasVoted: false });
        return;
      }

      try {
        setLoadingStatus(true);
        const response = await fetch("/api/votes", {
          headers: {
            "x-user-id": currentUserId,
          },
        });
        const data = (await response.json()) as VoteStatus;
        setStatus({
          authenticated: data.authenticated,
          hasVoted: data.hasVoted,
          vote: data.vote ?? null,
        });
      } catch (error) {
        setErrorMessage("Không thể kiểm tra trạng thái bỏ phiếu.");
      } finally {
        setLoadingStatus(false);
      }
    },
    [],
  );

  useEffect(() => {
    refreshStatus(userId);
  }, [refreshStatus, userId]);

  const handleLogin = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!userId.trim()) {
      setErrorMessage("Vui lòng nhập mã người dùng để đăng nhập.");
      return;
    }

    const normalizedId = userId.trim();
    setUserId(normalizedId);
    window.localStorage.setItem(STORAGE_KEY, normalizedId);
    refreshStatus(normalizedId);
  };

  const handleLogout = () => {
    setUserId("");
    window.localStorage.removeItem(STORAGE_KEY);
    setStatus({ authenticated: false, hasVoted: false, vote: null });
  };

  const handleVote = async (candidateId: string) => {
    if (!userId) {
      setErrorMessage("Bạn cần đăng nhập trước khi bỏ phiếu.");
      return;
    }

    setSubmittingId(candidateId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ candidateId }),
      });

      const data = (await response.json()) as {
        message?: string;
        vote?: VoteRecord;
      };

      if (!response.ok) {
        setErrorMessage(data.message ?? "Không thể ghi nhận phiếu bầu.");
        await refreshStatus(userId);
        return;
      }

      setSuccessMessage("Đã ghi nhận phiếu bầu của bạn.");
      setStatus({
        authenticated: true,
        hasVoted: true,
        vote: data.vote ?? null,
      });
    } catch (error) {
      setErrorMessage("Không thể ghi nhận phiếu bầu.");
    } finally {
      setSubmittingId(null);
    }
  };

  const votedCandidate = useMemo(() => {
    if (!status.vote) return null;
    return candidates.find((candidate) => candidate.id === status.vote?.candidateId);
  }, [candidates, status.vote]);

  const isLocked = status.hasVoted;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Khu vực bỏ phiếu trực tuyến
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Bình chọn ứng viên
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            Vui lòng xác nhận mã người dùng trước khi bỏ phiếu. Mỗi người chỉ có thể
            bỏ phiếu một lần trong cuộc bình chọn hiện tại.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Trạng thái đăng nhập</p>
              <p className="text-lg font-semibold">
                {userId ? `Đã đăng nhập: ${userId}` : "Chưa đăng nhập"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Nhập mã người dùng"
                className="h-12 w-full rounded-full border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-indigo-400 sm:w-64"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="h-12 rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  Xác nhận
                </button>
                {userId && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="h-12 rounded-full border border-slate-700 px-5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                  >
                    Đăng xuất
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>
              {loadingStatus
                ? "Đang kiểm tra trạng thái bỏ phiếu..."
                : status.hasVoted
                  ? "Bạn đã bình chọn trong cuộc bình chọn này."
                  : "Bạn chưa bỏ phiếu."}
            </p>
            {status.hasVoted && votedCandidate && (
              <p className="text-sm text-emerald-300">
                Đã bình chọn: {votedCandidate.name} · {formatTime(status.vote?.votedAt)}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Danh sách ứng viên</h2>
            {isLocked && (
              <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-1 text-xs font-semibold text-emerald-200">
                Đã bình chọn
              </span>
            )}
          </div>

          {loadingCandidates ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
              Đang tải danh sách ứng viên...
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {candidates.map((candidate) => {
                const isSelected = status.vote?.candidateId === candidate.id;
                const isSubmitting = submittingId === candidate.id;

                return (
                  <article
                    key={candidate.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
                  >
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {candidate.title}
                      </p>
                      <h3 className="text-xl font-semibold text-white">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-slate-300">{candidate.summary}</p>
                    </div>
                    <div className="mt-6">
                      <button
                        type="button"
                        disabled={isLocked || !userId || isSubmitting}
                        onClick={() => handleVote(candidate.id)}
                        className={`flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-500 text-white hover:bg-indigo-400"
                        } ${
                          isLocked || !userId || isSubmitting
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        {isSelected
                          ? "Đã bình chọn"
                          : isSubmitting
                            ? "Đang ghi nhận..."
                            : "Bỏ phiếu"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

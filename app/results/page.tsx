"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Leader = {
  id: string;
  name: string;
  image: string;
  votes: number;
};

type Results = {
  totalVotes: number;
  leader: Leader | null;
  revealStatus: "an" | "hien";
  votingOpen: boolean;
};

const fetchResults = async () => {
  const response = await fetch("/api/results", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không thể tải kết quả.");
  }
  return (await response.json()) as Results;
};

export default function ResultsPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [animateReveal, setAnimateReveal] = useState(false);
  const hasShownReveal = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadResults = async () => {
      try {
        const data = await fetchResults();
        if (isMounted) {
          setResults(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadResults();
    const intervalId = setInterval(loadResults, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (results?.revealStatus === "hien") {
      setIsRevealed(true);
      if (!hasShownReveal.current) {
        setAnimateReveal(true);
        hasShownReveal.current = true;
        const timeoutId = setTimeout(() => setAnimateReveal(false), 1200);
        return () => clearTimeout(timeoutId);
      }
    } else {
      setIsRevealed(false);
      hasShownReveal.current = false;
    }
  }, [results?.revealStatus]);

  const leader = results?.leader;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Bảng kết quả
          </p>
          <h1 className="text-4xl font-semibold">Kết quả bình chọn</h1>
          <p className="text-base text-zinc-600">
            Hệ thống tự động cập nhật mỗi 2 giây để đảm bảo dữ liệu mới nhất.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">Tổng số phiếu</p>
              <p className="text-3xl font-semibold">
                {results ? results.totalVotes : "--"}
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
              {results?.votingOpen ? "Đang bình chọn" : "Đã dừng bình chọn"}
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <p className="text-sm font-semibold text-zinc-500">Trạng thái công bố</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
                {results?.revealStatus === "hien" ? "Đã công bố" : "Chưa công bố"}
              </span>
              {results?.revealStatus !== "hien" && (
                <span className="text-sm text-zinc-500">
                  Kết quả sẽ hiển thị khi admin công bố.
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Người dẫn đầu</h2>
          <div className="mt-6">
            {!isRevealed && (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                Đang chờ công bố kết quả từ admin.
              </div>
            )}

            {isRevealed && leader && (
              <div
                className={`flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center transition duration-700 ${
                  animateReveal ? "scale-105 opacity-100" : "scale-100 opacity-100"
                }`}
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-zinc-100">
                  <Image
                    src={leader.image}
                    alt={`Ảnh của ${leader.name}`}
                    width={80}
                    height={80}
                  />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                    Người dẫn đầu
                  </p>
                  <p className="text-2xl font-semibold text-zinc-900">
                    {leader.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {leader.votes} phiếu
                  </p>
                </div>
              </div>
            )}

            {isRevealed && !leader && (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                Chưa có dữ liệu người dẫn đầu.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

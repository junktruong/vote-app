import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vote App",
  description: "Ứng dụng quản lý và bỏ phiếu nhanh cho nhóm của bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div>
                <p className="text-lg font-semibold">Vote App</p>
                <p className="text-sm text-slate-500">
                  Tạo, chia sẻ và xem kết quả biểu quyết nhanh chóng.
                </p>
              </div>
              <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                <Link className="rounded-full px-3 py-1 hover:bg-slate-100" href="/">
                  Trang chủ
                </Link>
                <Link
                  className="rounded-full px-3 py-1 hover:bg-slate-100"
                  href="/admin"
                >
                  Quản trị
                </Link>
                <Link
                  className="rounded-full px-3 py-1 hover:bg-slate-100"
                  href="/vote"
                >
                  Bỏ phiếu
                </Link>
                <Link
                  className="rounded-full px-3 py-1 hover:bg-slate-100"
                  href="/results"
                >
                  Kết quả
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

"use client";

import { useEffect, useId, useState } from "react";

export default function AvatarPanel() {
  const inputId = useId();
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  async function loadMe() {
    const res = await fetch("/api/me");
    const d = await res.json();
    if (res.ok && d.user) {
      setUser(d.user);
      setPreview(d.user.thumb || d.user.photo || "");
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!photoFile) {
      setMsg("Vui lòng chọn ảnh mới.");
      return;
    }
    setMsg("Đang cập nhật...");
    const fd = new FormData();
    fd.append("photo", photoFile);
    const res = await fetch("/api/avatar", { method: "POST", body: fd });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Lỗi");
    setMsg("Đã cập nhật ảnh đại diện.");
    setPhotoFile(null);
    setUser((prev: any) => ({ ...prev, thumb: d.thumb, photo: d.photo }));
    setPreview(d.thumb);
  }

  return (
    <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-md">
      <h2 className="text-lg font-semibold text-red-700">Ảnh đại diện</h2>
      <p className="mt-2 text-sm text-slate-600">Cập nhật ảnh đại diện (thumb) và ảnh giải thưởng (photo).</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-red-100 bg-slate-50">
          {preview ? <img src={preview} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <label
            htmlFor={inputId}
            className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-[#D32F2F] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#B71C1C]"
          >
            Chọn ảnh mới
          </label>
          <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <button
            onClick={submit}
            className="w-fit rounded-full bg-[#FBC02D] px-6 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-[#F9A825]"
          >
            Lưu ảnh đại diện
          </button>
          <p className="text-xs text-slate-500">{msg}</p>
        </div>
      </div>
    </div>
  );
}

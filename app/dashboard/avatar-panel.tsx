"use client";

import { useEffect, useId, useState, useRef } from "react";

export default function AvatarPanel() {
  const photoInputId = useId();
  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"success" | "error" | "info">("info");
  
  // State đổi tên
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const inputNameRef = useRef<HTMLInputElement>(null);

  async function loadMe() {
    const res = await fetch("/api/me");
    const d = await res.json();
    if (res.ok && d.user) {
      setUser(d.user);
      setPreview(d.user.thumb || d.user.photo || "");
      setNewName(d.user.fullName || "");
    }
  }

  useEffect(() => { loadMe(); }, []);

  useEffect(() => {
    if (isEditingName && inputNameRef.current) inputNameRef.current.focus();
  }, [isEditingName]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
    setMsg("");
  }

  async function submitPhoto() {
    setMsgTone("success");
    setMsg("Đã lưu!");
    setTimeout(() => { setMsg(""); setPhotoFile(null); }, 1500);
  }

  async function submitName() {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setMsgTone("error");
      setMsg("Vui lòng nhập tên hợp lệ.");
      return;
    }
    if (trimmedName.length > 60) {
      setMsgTone("error");
      setMsg("Tên quá dài (tối đa 60 ký tự).");
      return;
    }
    if (trimmedName === user?.fullName) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    setMsgTone("info");
    setMsg("Đang lưu...");

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmedName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgTone("error");
        setMsg(data?.error || "Không thể đổi tên.");
        return;
      }
      setUser((prev: any) => ({ ...prev, fullName: data?.user?.fullName || trimmedName }));
      setNewName(data?.user?.fullName || trimmedName);
      setIsEditingName(false);
      setMsgTone("success");
      setMsg("Đã đổi tên");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      setMsgTone("error");
      setMsg("Không thể kết nối server.");
    } finally {
      setIsSavingName(false);
    }
  }

  function cancelEditName() {
    setNewName(user?.fullName || "");
    setIsEditingName(false);
  }

  // Skeleton khi đang load
  if (!user && !preview) return <div className="h-20 w-56 animate-pulse rounded-full bg-white/40" />;

  return (
    <div className="group/panel flex items-center gap-4 rounded-[2rem] bg-white/60 p-2 pr-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md transition-all hover:bg-white/90 md:pr-8">
      
      {/* 1. AVATAR KHUNG TO */}
      <div className="relative flex-shrink-0">
        <label htmlFor={photoInputId} className="cursor-pointer active:scale-95 transition-transform block">
          
          {/* Ảnh chính: To hơn (h-16 = 64px mobile, h-20 = 80px desktop) */}
          <div className="h-16 w-16 overflow-hidden rounded-full border-[3px] border-white shadow-md ring-2 ring-red-100 md:h-20 md:w-20">
            {preview ? (
              <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400 font-bold">User</div>
            )}
          </div>

          {/* Badge Camera: Nút tròn nổi ở góc dưới - Rất dễ bấm */}
          <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white shadow-md ring-2 ring-white transition-colors hover:bg-red-600 md:h-8 md:w-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 md:h-4 md:w-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </div>
        </label>
        <input id={photoInputId} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* 2. INFO AREA */}
      <div className="flex min-w-0 flex-col gap-1">
        
        {isEditingName ? (
          /* --- UI ĐANG SỬA TÊN (To rõ) --- */
          <div className="flex items-center gap-2">
            <input
              ref={inputNameRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-9 w-32 min-w-0 rounded-lg border border-red-200 bg-white px-2 text-base font-bold text-slate-900 shadow-sm focus:border-red-500 focus:outline-none md:w-40"
            />
            {/* Nút Save to */}
            <button
              onTouchEnd={submitName}
              onClick={submitName}
              disabled={isSavingName}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 active:scale-90 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Nút Cancel to */}
            <button
              onTouchEnd={cancelEditName}
              onClick={cancelEditName}
              disabled={isSavingName}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ) : (
          /* --- UI HIỂN THỊ TÊN --- */
          <div className="flex items-center gap-3">
            <span className="truncate text-lg font-bold text-slate-900 max-w-[140px] md:max-w-[200px]" title={user?.fullName}>
              {user?.fullName || "Thành viên"}
            </span>
            
            {/* Nút Sửa Tên: Là một nút tròn riêng biệt, không ẩn nữa */}
            <button 
              onClick={() => setIsEditingName(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 shadow-sm transition-all hover:bg-white hover:text-red-600 hover:shadow-md active:scale-95"
              aria-label="Đổi tên"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
            </button>
          </div>
        )}

        {/* 3. STATUS / SAVE PHOTO BUTTON */}
        <div className="h-6">
          {photoFile ? (
            <button
              onClick={submitPhoto}
              className="animate-in fade-in slide-in-from-left-2 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95"
            >
              <span>Lưu ảnh mới</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <span
              className={`text-xs font-medium ${
                msg ? (msgTone === "error" ? "text-red-600" : msgTone === "info" ? "text-slate-600" : "text-green-600") : "text-slate-500"
              }`}
            >
              {msg || (user?.role === 'admin' ? "Quản trị viên" : "Hội viên chính thức")}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

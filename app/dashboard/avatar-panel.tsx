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
    setMsg(""); // Xóa msg cũ nếu chọn lại
  }

  async function submit() {
    if (!photoFile) {
      setMsg("Chưa có ảnh mới");
      return;
    }
    setMsg("Đang lưu...");
    const fd = new FormData();
    fd.append("photo", photoFile);
    
    try {
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setMsg(d.error || "Lỗi");
        return;
      } 
      
      setMsg("Thành công!");
      setPhotoFile(null); // Ẩn nút lưu
      setUser((prev: any) => ({ ...prev, thumb: d.thumb, photo: d.photo }));
      setPreview(d.thumb);
      
      // Tự tắt thông báo sau 2s
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Lỗi kết nối");
    }
  }

  // Nếu chưa load xong user, hiện loading skeleton nhẹ hoặc null
  if (!user && !preview) return <div className="h-16 w-48 animate-pulse rounded-xl bg-slate-200/50" />;

  return (
    <div className="flex items-center gap-4 rounded-full bg-white/60 py-2 pl-2 pr-6 shadow-sm ring-1 ring-white backdrop-blur-md transition-all hover:bg-white/80">
      {/* Avatar Container - Click vào đây để chọn ảnh */}
      <div className="group relative h-14 w-14 flex-shrink-0 cursor-pointer">
        <label htmlFor={inputId} className="block h-full w-full">
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-red-100 transition-all group-hover:ring-red-300">
            {preview ? (
              <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                User
              </div>
            )}
            
            {/* Overlay Icon Camera khi hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
            </div>
          </div>
        </label>
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Text Info */}
      <div className="flex flex-col">
        {user && (
           <span className="text-sm font-bold text-slate-800">
             {user.fullName || "Thành viên"}
           </span>
        )}
        
        {/* Logic hiển thị nút: Nếu có file mới thì hiện nút Lưu, nếu không thì hiện trạng thái */}
        {photoFile ? (
          <button
            onClick={submit}
            className="mt-1 -ml-1 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-yellow-900 shadow-sm hover:bg-yellow-500 hover:shadow-md active:scale-95"
          >
            Lưu ảnh mới
          </button>
        ) : (
           <span className={`text-xs ${msg ? "text-red-600 font-medium" : "text-slate-500"}`}>
             {msg || "Chúc mừng năm mới!"}
           </span>
        )}
      </div>
    </div>
  );
}
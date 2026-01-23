export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Khu vực quản trị
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Tạo cuộc bỏ phiếu mới
        </h1>
        <p className="text-base text-slate-600">
          Điền thông tin cần thiết, hệ thống sẽ tự động kiểm tra dữ liệu và gửi
          thông báo rõ ràng khi lưu.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tên cuộc bỏ phiếu *
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Ví dụ: Chọn địa điểm retreat"
                required
              />
              <span className="text-xs text-rose-600">
                Vui lòng nhập tiêu đề trước khi lưu.
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Người phụ trách *
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Tên người chịu trách nhiệm"
                required
              />
              <span className="text-xs text-slate-500">
                Thông tin này sẽ hiển thị cho người tham gia.
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Mô tả ngắn *
            <textarea
              className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Tóm tắt mục đích của cuộc bỏ phiếu."
              required
            />
            <span className="text-xs text-slate-500">
              Tối đa 280 ký tự để người dùng dễ theo dõi.
            </span>
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            {["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3"].map((label) => (
              <label
                key={label}
                className="flex flex-col gap-2 text-sm font-medium text-slate-700"
              >
                {label} *
                <input
                  className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Nhập lựa chọn"
                  required
                />
              </label>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Thời hạn kết thúc *
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="date"
                required
              />
              <span className="text-xs text-slate-500">
                Hệ thống sẽ khóa biểu quyết sau thời gian này.
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Cho phép chỉnh sửa sau khi gửi
              <select className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                <option>Có, trong 30 phút</option>
                <option>Không, cố định luôn</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              type="submit"
            >
              Lưu và tạo link chia sẻ
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              type="button"
            >
              Lưu nháp
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              ✅ Tạo thành công
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Cuộc bỏ phiếu đã được tạo. Bạn có thể sao chép link và chia sẻ ngay
              cho nhóm.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">
              ⚠️ Thiếu thông tin
            </p>
            <p className="mt-1 text-sm text-rose-600">
              Vui lòng kiểm tra các trường bắt buộc trước khi lưu biểu quyết.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">
              Gợi ý nhanh
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Thêm tối thiểu 3 lựa chọn để tăng tính đa dạng.</li>
              <li>• Bật thông báo email nếu muốn nhắc người tham gia.</li>
              <li>• Có thể chỉnh sửa biểu quyết trong vòng 30 phút.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

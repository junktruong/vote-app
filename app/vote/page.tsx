export default function VotePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Trang bỏ phiếu
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Chọn phương án phù hợp nhất với bạn
        </h1>
        <p className="text-base text-slate-600">
          Đọc kỹ mô tả và chọn một lựa chọn. Hệ thống sẽ hiển thị thông báo rõ
          ràng sau khi gửi phiếu.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Biểu quyết: Địa điểm team building
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Hãy chọn địa điểm phù hợp nhất cho chuyến đi cuối quý. Bạn chỉ có
              thể chọn một phương án.
            </p>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-semibold text-slate-700">
              Lựa chọn của bạn *
            </legend>
            {[
              "Đà Nẵng - combo biển và hoạt động đội nhóm",
              "Đà Lạt - thời tiết mát mẻ, phù hợp nghỉ dưỡng",
              "Phan Thiết - gần TP.HCM, dễ di chuyển",
            ].map((label, index) => (
              <label
                key={label}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition hover:border-emerald-300"
              >
                <input
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  name="location"
                  type="radio"
                  required
                  defaultChecked={index === 0}
                />
                <span className="flex-1">{label}</span>
              </label>
            ))}
            <p className="text-xs text-slate-500">
              Nếu chưa chọn lựa chọn nào, nút gửi sẽ hiển thị cảnh báo.
            </p>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Ghi chú thêm (tuỳ chọn)
            <textarea
              className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Ví dụ: ưu tiên nơi có không gian ngoài trời."
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              type="submit"
            >
              Gửi phiếu của tôi
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              type="button"
            >
              Huỷ lựa chọn
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              ✅ Phiếu đã được ghi nhận
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Cảm ơn bạn! Bạn có thể chỉnh sửa trong vòng 30 phút.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              ⏳ Đang gửi phiếu...
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Vui lòng chờ trong khi hệ thống xác nhận lựa chọn của bạn.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Đang xử lý
            </div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">
              ❗Bạn chưa chọn đáp án
            </p>
            <p className="mt-1 text-sm text-rose-600">
              Hãy chọn một lựa chọn trước khi nhấn gửi để tránh mất dữ liệu.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

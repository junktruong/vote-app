const results = [
  { label: "Đà Nẵng", percent: 46, voters: 23 },
  { label: "Đà Lạt", percent: 34, voters: 17 },
  { label: "Phan Thiết", percent: 20, voters: 10 },
];

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Kết quả biểu quyết
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Tổng hợp kết quả bỏ phiếu
        </h1>
        <p className="text-base text-slate-600">
          Theo dõi kết quả theo thời gian thực và xem các lựa chọn nổi bật nhất.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Biểu quyết: Địa điểm team building
                </h2>
                <p className="text-sm text-slate-600">
                  50 phiếu đã được ghi nhận • Cập nhật 2 phút trước
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                type="button"
              >
                Xuất báo cáo
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {results.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span>
                      {item.percent}% • {item.voters} phiếu
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Nhận xét nhanh từ người tham gia
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                “Đà Nẵng có nhiều lựa chọn hoạt động nên mình vote nhé.”
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                “Đà Lạt mát mẻ, phù hợp nghỉ ngơi cuối năm.”
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                “Phan Thiết gần nên di chuyển tiện.”
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              ✅ Trạng thái ổn định
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Hệ thống đang cập nhật kết quả theo thời gian thực.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">
              Empty-state khi chưa có phiếu
            </p>
            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-600">
                Chưa có phiếu nào
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Hãy chia sẻ đường link để mời mọi người bỏ phiếu.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              ⏳ Đang đồng bộ dữ liệu
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Dữ liệu mới sẽ hiển thị sau vài giây, vui lòng đợi.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

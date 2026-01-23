import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Nhanh chóng & minh bạch
          </span>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            Trung tâm bỏ phiếu cho nhóm, dự án, hoặc cộng đồng của bạn.
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Thiết lập biểu quyết chỉ trong vài phút, chia sẻ đường link cho mọi
            người và theo dõi kết quả theo thời gian thực. Giao diện thân thiện
            trên cả desktop lẫn mobile.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/admin"
            >
              Tạo cuộc bỏ phiếu
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              href="/vote"
            >
              Thử bỏ phiếu ngay
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trạng thái hệ thống
          </h2>
          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <p className="text-sm font-semibold text-emerald-700">
              ✅ Mẫu biểu quyết đã sẵn sàng
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Bạn có thể tạo mới hoặc sử dụng mẫu để tiết kiệm thời gian.
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-4">
            <p className="text-sm font-semibold text-amber-700">
              ⏳ 2 biểu quyết đang chờ kết thúc
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Kết thúc biểu quyết sẽ tự động gửi thông báo kết quả.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Thiết lập rõ ràng",
            description:
              "Form có nhãn, mô tả và kiểm tra dữ liệu giúp bạn thu thập thông tin chính xác.",
          },
          {
            title: "Trạng thái dễ hiểu",
            description:
              "Thông báo thành công, lỗi và loading đều thân thiện với người dùng.",
          },
          {
            title: "Responsive mượt mà",
            description:
              "Tối ưu giao diện cho điện thoại với bố cục xếp chồng hợp lý.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Bắt đầu với luồng làm việc đầy đủ
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tạo biểu quyết, mời người tham gia, theo dõi kết quả và xuất báo
              cáo tổng hợp.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            href="/results"
          >
            Xem bảng kết quả mẫu
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import BrandMark from "@/components/layout/BrandMark";
import { BackhaulRoute, JourneySteps, Reveal } from "./landingMotion";

// Public landing page (DESIGN.md). Every statement describes behaviour the services
// implement today; there are no customer counts, savings figures or testimonials.

const AUDIENCES = [
  {
    title: "Chủ hàng",
    points: [
      "Tạo phiên với giá trần, bước giá và khung giờ lấy, giao hàng.",
      "Chọn phiên công khai (giá thấp nhất thắng) hoặc phiên kín (bạn chọn người thắng).",
      "Theo dõi chuyến, xem ảnh bằng chứng và xác nhận đã nhận hàng.",
    ],
  },
  {
    title: "Chủ xe",
    points: [
      "Tìm hàng cho xe chiều về, đăng ký phiên bằng xe đã được duyệt.",
      "Đặt giá thấp dần trong phòng đấu giá, mỗi phiên có số lượt giới hạn.",
      "Phân công tài xế; tài xế nhận chuyến bằng mã PIN trên điện thoại.",
    ],
  },
];

const STEPS = [
  { title: "Đăng phiên", text: "Chủ hàng nhập lô hàng, tuyến, giá trần và thời gian đăng ký, đấu giá." },
  { title: "Đăng ký và đặt giá", text: "Nhà xe trả phí tham gia, nộp cọc nếu phiên yêu cầu, rồi đặt giá khi phòng mở." },
  { title: "Trao thầu và ký hợp đồng", text: "Hợp đồng được tạo tự động. Nhà xe ký trước, chủ hàng ký sau; quá hạn thì mời nhà xe dự phòng kế tiếp." },
  { title: "Vận chuyển và xác nhận", text: "Tài xế ghi mốc hành trình và gửi ảnh giao hàng; chủ hàng xác nhận để hoàn tất chuyến." },
];

const FAQ = [
  {
    q: "Ai thắng phiên đấu giá?",
    a: "Phiên công khai: giá hợp lệ thấp nhất khi hết giờ thắng, bằng giá thì người đặt sớm hơn thắng. Phiên kín: mỗi nhà xe chỉ thấy giá của mình, chủ hàng chọn người thắng sau khi phiên kết thúc.",
  },
  {
    q: "Có những khoản phí nào?",
    a: "Chủ hàng trả phí tạo phiên theo mức giá trần. Nhà xe trả phí tham gia khi đăng ký và nộp tiền cọc nếu phiên yêu cầu; cọc của nhà xe không thắng được hoàn lại. Các khoản được trừ từ ví trên nền tảng.",
  },
  {
    q: "Nếu giao hàng trễ thì sao?",
    a: "Với chuyến có tiền cọc, bồi thường giao trễ được trừ từ cọc của nhà xe theo bậc trễ và điểm uy tín bị trừ. Chủ hàng được hủy chuyến khi xe trễ hơn 1 giờ.",
  },
  {
    q: "Xe và tài xế có được kiểm tra không?",
    a: "Có. Hồ sơ xe, tài xế và doanh nghiệp được quản trị viên duyệt. Chỉ xe và tài xế đã duyệt mới dùng được để đăng ký phiên và nhận chuyến.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2">
        Bỏ qua đến nội dung
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link href="/" aria-label="BackHaulBid, trang chủ">
            <BrandMark />
          </Link>
          <nav aria-label="Trang giới thiệu" className="hidden items-center gap-6 md:flex">
            <a href="#cach-hoat-dong" className="font-medium text-ink-muted hover:text-brand">Cách hoạt động</a>
            <a href="#tung-ben" className="font-medium text-ink-muted hover:text-brand">Cho từng bên</a>
            <a href="#hoi-dap" className="font-medium text-ink-muted hover:text-brand">Hỏi đáp</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-pill px-4 py-2 font-medium text-ink hover:bg-surface-sunken sm:inline-block">
              Đăng nhập
            </Link>
            <Link href="/register" className="rounded-pill bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover">
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:px-8 md:py-24">
          <div>
            <Reveal as="h1" className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.01em] md:text-[3.5rem]">
              Xe chiều về có hàng, chủ hàng có giá tốt.
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-5 max-w-[34rem] text-lg text-ink-muted">
              Chủ hàng đăng lô cần chở, nhà xe đặt giá thấp dần để nhận chuyến. Hợp đồng, phân công tài xế và theo dõi giao hàng nằm trên cùng một chuyến.
            </Reveal>
            <Reveal delay={0.16} className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-pill bg-brand px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-brand-hover">
                Tạo tài khoản
              </Link>
              <Link href="/login" className="rounded-pill border border-line px-6 py-3 text-lg font-medium text-ink transition-colors hover:bg-surface-sunken">
                Đăng nhập
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <BackhaulRoute />
          </Reveal>
        </section>

        <section id="cach-hoat-dong" className="border-t border-line">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16 md:px-8 md:py-24">
            <div className="md:sticky md:top-28 md:self-start">
              <Reveal as="h2" className="text-[2rem] font-bold leading-tight md:text-[2.5rem]">Một chuyến đi qua bốn bước</Reveal>
              <Reveal as="p" delay={0.08} className="mt-3 max-w-[30rem] text-ink-muted">
                Từ lúc chủ hàng đăng phiên tới khi hàng được xác nhận đã nhận. Mỗi bước có người làm rõ ràng và được ghi lại trên chuyến.
              </Reveal>
            </div>
            <JourneySteps steps={STEPS} />
          </div>
        </section>

        <section id="tung-ben" className="bg-canvas py-14 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal as="h2" className="text-[2rem] font-bold leading-tight md:text-[2.25rem]">Dành cho từng bên</Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {AUDIENCES.map((audience, index) => (
                <Reveal as="article" delay={index * 0.1} key={audience.title} className="rounded-xl border border-line bg-surface p-6">
                  <h3 className="text-xl font-bold">{audience.title}</h3>
                  <ul className="mt-4 grid gap-3">
                    {audience.points.map((point) => (
                      <li key={point} className="flex gap-3 text-ink-muted">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
            <Reveal as="article" className="mt-4 rounded-xl bg-band p-6 text-white md:p-8">
              <h3 className="text-xl font-bold">Tài xế dùng ứng dụng trên điện thoại</h3>
              <p className="mt-2 max-w-[640px] text-on-band-soft">
                Nhận chuyến bằng mã PIN do chủ xe gửi, ghi các mốc lấy hàng, chạy, đến nơi, check-in cột mốc và chụp ảnh giao hàng. Tài xế không tự hoàn thành chuyến; chủ hàng xác nhận.
              </p>
            </Reveal>
          </div>
        </section>

        <section id="hoi-dap" className="mx-auto max-w-[1200px] px-4 py-14 md:px-8 md:py-20">
          <Reveal as="h2" className="text-[2rem] font-bold leading-tight md:text-[2.25rem]">Hỏi đáp</Reveal>
          <dl className="mt-8 grid gap-0 border-t border-line">
            {FAQ.map((item, index) => (
              <Reveal delay={index * 0.06} key={item.q} className="grid gap-2 border-b border-line py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
                <dt className="font-semibold">{item.q}</dt>
                <dd className="m-0 max-w-[70ch] text-ink-muted">{item.a}</dd>
              </Reveal>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <BrandMark />
          <p>© {new Date().getFullYear()} BackHaulBid</p>
        </div>
      </footer>
    </div>
  );
}

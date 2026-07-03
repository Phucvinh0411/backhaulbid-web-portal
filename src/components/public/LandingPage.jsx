"use client";

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const easeOutQuint = [0.22, 1, 0.36, 1];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutQuint } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden" ref={containerRef}>
      {/* Premium Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_4px_30px_rgba(27,73,101,0.05)] rounded-2xl px-6 py-3 flex justify-between items-center">
            <span className="text-[1.35rem] font-black tracking-tight text-[#1B4965] flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              BackHaulBid
            </span>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[0.9rem] text-[#64748B] hover:text-[#1B4965] font-semibold transition-colors">Giải pháp</a>
              <a href="#process" className="text-[0.9rem] text-[#64748B] hover:text-[#1B4965] font-semibold transition-colors">Vận hành</a>
            </nav>
            <button 
              onClick={() => router.push('/login')}
              className="text-[0.9rem] font-bold py-2.5 px-6 rounded-xl transition-all bg-[#1B4965] hover:bg-[#0d2b3e] text-white shadow-[0_4px_12px_rgba(27,73,101,0.2)] hover:shadow-[0_6px_16px_rgba(27,73,101,0.3)] hover:-translate-y-0.5"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </header>

      {/* Drenched / Cinematic Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-20 px-6">
        {/* Deep Navy Cinematic Gradient Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: yOffset }}
        >
          <div className="w-full h-full" style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(98, 182, 203, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(190, 233, 232, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(13, 43, 62, 0.4) 0%, transparent 60%),
              linear-gradient(135deg, #1B4965 0%, #0d2b3e 40%, #1B4965 70%, #2a6f97 100%)
            `
          }} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold tracking-wide uppercase backdrop-blur-md">
                B2B Logistics Platform
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-4xl"
              style={{ textShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
            >
              Trung tâm điều hành <br className="hidden md:block" /> 
              <span className="text-[#bee9e8]">
                chiều về tối ưu
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="mt-8 text-lg md:text-xl text-[#bee9e8]/80 leading-relaxed max-w-2xl font-medium"
            >
              Cơ chế đấu giá ngược độc quyền. Kết nối trực tiếp đội xe thương mại với chủ hàng, giải quyết dứt điểm bài toán xe chạy rỗng chiều về.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="font-bold py-4 px-10 rounded-xl transition-all text-[#1B4965] bg-white hover:bg-slate-50 text-[1.05rem] shadow-[0_8px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_24px_rgba(255,255,255,0.3)] hover:-translate-y-1"
              >
                Tham gia hệ thống
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Typographic Stats */}
      <section className="bg-white py-24 relative z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8"
          >
            {[
              { value: '5,000+', label: 'Đối tác doanh nghiệp đã xác thực' },
              { value: '10,000', label: 'Tuyến hàng khớp lệnh mỗi tháng' },
              { value: '15.4%', label: 'Giảm biên phí vận chuyển trung bình' },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col">
                <div className="text-5xl md:text-6xl font-black text-[#1B4965] tracking-tighter mb-4">
                  {stat.value}
                </div>
                <div className="text-[1rem] text-[#64748B] font-semibold leading-relaxed max-w-[250px]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Narrative Features - Asymmetric Layout */}
      <section id="features" className="py-32 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-24 max-w-3xl"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#0d2b3e] tracking-tight leading-tight">
              Bảo mật tài chính. <br/> Minh bạch tuyệt đối.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Main Feature - Spans 8 cols */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="md:col-span-8 bg-white rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgba(27,73,101,0.03)] border border-slate-100 flex flex-col justify-end min-h-[400px] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <svg className="w-48 h-48 text-[#1B4965]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              </div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-black text-[#1B4965] mb-4">Đấu giá ngược cốt lõi</h3>
                <p className="text-lg text-[#64748B] leading-relaxed font-medium">
                  Chủ hàng làm chủ cuộc chơi. Khởi tạo một phiên vận chuyển và để mạng lưới hàng ngàn xe rỗng chiều về tự động đấu giá. Hệ thống thuật toán độc quyền tự động xếp hạng mức giá tốt nhất theo thời gian thực.
                </p>
              </div>
            </motion.div>

            {/* Side Feature - Spans 4 cols */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="md:col-span-4 bg-[#1B4965] rounded-3xl p-10 md:p-12 shadow-[0_20px_40px_rgba(27,73,101,0.2)] relative overflow-hidden text-white flex flex-col"
            >
              <div className="mb-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#62B6CB]/20 flex items-center justify-center mb-8 border border-[#62B6CB]/30">
                  <svg className="w-8 h-8 text-[#bee9e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">eKYC Mức độ cao</h3>
                <p className="text-[#bee9e8]/80 leading-relaxed font-medium">
                  Xác minh doanh nghiệp, giấy tờ xe và hồ sơ tài xế khắt khe trước khi cấp phép tham gia nền tảng.
                </p>
              </div>
            </motion.div>

            {/* Bottom Feature - Spans 12 cols */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="md:col-span-12 bg-white rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgba(27,73,101,0.03)] border border-slate-100 flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1">
                <h3 className="text-3xl font-black text-[#1B4965] mb-4">Tài chính tích hợp</h3>
                <p className="text-lg text-[#64748B] leading-relaxed font-medium max-w-xl">
                  Quản lý dòng tiền thông minh thông qua Ví điện tử B2B. Ký quỹ an toàn, thanh toán tự động ngay khi hoàn tất chuyến đi, xuất hóa đơn điện tử trong 1 giây.
                </p>
              </div>
              <div className="w-full md:w-[400px] h-[200px] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
                <div className="w-16 h-16 rounded-full bg-[#1B4965] shadow-xl flex items-center justify-center z-10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Narrative Process - Removing the 01/02/03 trope */}
      <section id="process" className="py-32 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-20 text-center"
          >
            <h2 className="text-4xl font-black text-[#0d2b3e] tracking-tight mb-6">
              Từ xe rỗng đến doanh thu
            </h2>
            <p className="text-xl text-[#64748B] font-medium leading-relaxed">
              Một luồng công việc được thiết kế để không làm gián đoạn nghiệp vụ thực tế của đội xe.
            </p>
          </motion.div>

          <div className="space-y-16">
            {[
              { title: 'Tạo tài khoản và vượt qua rào cản eKYC.', desc: 'Hệ thống đánh giá độ tin cậy của doanh nghiệp trong 24 giờ. Chỉ những pháp nhân có năng lực vận tải thực tế mới được phép hoạt động.' },
              { title: 'Chủ hàng đẩy yêu cầu tuyến đường.', desc: 'Mọi thông tin về khối lượng, thời gian bốc dỡ, và các yêu cầu đặc thù được minh bạch ngay từ đầu.' },
              { title: 'Phiên đấu giá ngược diễn ra tự động.', desc: 'Nhà xe đang kẹt xe rỗng chiều về có thể bỏ giá thầu cạnh tranh nhất. Thuật toán thời gian thực sẽ quyết định bên thắng cuộc dựa trên giá và điểm uy tín.' },
              { title: 'Tiến hành bốc dỡ, thanh toán tức thì.', desc: 'Hợp đồng điện tử được sinh ra. Khi hàng hóa đến nơi, Ví nền tảng tự động giải ngân cho nhà xe, giảm thiểu tối đa rủi ro công nợ.' },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="flex flex-col md:flex-row gap-6 md:gap-12 items-start"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#1B4965]/5 border border-[#1B4965]/10 flex items-center justify-center mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#1B4965]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1B4965] mb-3">{step.title}</h3>
                  <p className="text-lg text-[#64748B] leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Drenched Navy */}
      <section className="py-24 bg-[#1B4965] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0d2b3e] to-[#1B4965]" />
        <div className="absolute -top-[50%] -right-[20%] w-[100%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(98,182,203,0.15)_0%,transparent_50%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Sẵn sàng làm chủ luồng hàng?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-[#bee9e8]/80 mb-12 text-xl font-medium max-w-2xl mx-auto">
              Nền tảng BackHaulBid hiện đang mở đăng ký cho các doanh nghiệp vận tải và chủ hàng đạt tiêu chuẩn.
            </motion.p>
            <motion.button 
              variants={fadeInUp}
              onClick={() => router.push('/register')}
              className="bg-[#62B6CB] text-[#0d2b3e] hover:bg-white font-black py-4 px-10 rounded-xl transition-all text-lg shadow-[0_10px_30px_rgba(98,182,203,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)]"
            >
              Thiết lập hồ sơ ngay
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[#1B4965]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[1.15rem] font-black tracking-tight">BackHaulBid</span>
          </div>
          
          <div className="flex gap-8 text-[0.85rem] font-semibold text-[#64748B]">
            <a href="#" className="hover:text-[#1B4965] transition-colors">Tài liệu API</a>
            <a href="#" className="hover:text-[#1B4965] transition-colors">Bảo mật & eKYC</a>
            <a href="#" className="hover:text-[#1B4965] transition-colors">Quy chế đấu giá</a>
          </div>

          <div className="text-[#94A3B8] text-[0.8rem] font-medium">
            &copy; {new Date().getFullYear()} Cổng Thông Tin Logistics B2B
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import LocalShippingTwoToneIcon from '@mui/icons-material/LocalShippingTwoTone';

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
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 sm:px-6 sm:py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_4px_30px_rgba(27,73,101,0.05)] rounded-2xl px-4 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #1B4965 0%, #62B6CB 100%)",
                  boxShadow: "0 4px 12px rgba(27, 73, 101, 0.25)",
                }}
              >
                <LocalShippingTwoToneIcon sx={{ color: "#fff", fontSize: { xs: 18, sm: 22 } }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.95rem] sm:text-[1.1rem] font-black leading-tight tracking-tight text-slate-800 transition-colors group-hover:text-[#1B4965]">
                  BackHaulBid
                </span>
                <span className="text-[0.55rem] sm:text-[0.65rem] text-[#62B6CB] font-bold tracking-widest uppercase leading-none mt-0.5">
                  B2B Logistics
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[0.9rem] text-[#64748B] hover:text-[#1B4965] font-semibold transition-colors">Giải pháp</a>
              <a href="#process" className="text-[0.9rem] text-[#64748B] hover:text-[#1B4965] font-semibold transition-colors">Vận hành</a>
            </nav>
            <button 
              onClick={() => router.push('/login')}
              className="text-[0.8rem] sm:text-[0.9rem] font-bold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg sm:rounded-xl transition-all bg-[#1B4965] hover:bg-[#0d2b3e] text-white shadow-[0_4px_12px_rgba(27,73,101,0.2)] hover:shadow-[0_6px_16px_rgba(27,73,101,0.3)] hover:-translate-y-0.5 cursor-pointer"
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
          className="absolute inset-0 z-0 overflow-hidden bg-[#0D2B3E]"
          style={{ y: yOffset }}
        >
          {/* Base linear gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B4965] via-[#0D2B3E] to-[#2A6F97]" />
          
          {/* Ambient radial glows */}
          <div className="absolute top-0 left-0 w-1/2 h-[120%] rounded-full bg-[#62B6CB] opacity-15 blur-[120px]" />
          <div className="absolute top-[-20%] right-[-10%] w-1/2 h-full rounded-full bg-[#bee9e8] opacity-[0.08] blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[20%] w-[60%] h-[80%] rounded-full bg-[#0A1929] opacity-40 blur-[100px]" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: text and CTA */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="lg:col-span-6 flex flex-col items-start text-left"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold tracking-wide uppercase backdrop-blur-md">
                  B2B Logistics Platform
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight"
                style={{ textShadow: "0 10px 30px var(--color-overlay-shadow)" }}
              >
                Trung tâm điều hành <br /> 
                <span className="text-[#bee9e8]">
                  chiều về tối ưu
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-base md:text-lg text-[#bee9e8]/90 leading-relaxed font-medium max-w-xl"
              >
                Cơ chế đấu giá ngược độc quyền. Kết nối trực tiếp đội xe với chủ hàng, giải quyết dứt điểm bài toán chạy rỗng.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => router.push('/login')}
                  className="font-black py-4 px-10 rounded-xl transition-all text-[#0d2b3e] bg-white hover:bg-[#f0f9ff] text-[1.1rem] shadow-[0_8px_30px_rgba(98,182,203,0.3)] hover:shadow-[0_12px_40px_rgba(98,182,203,0.5)] hover:-translate-y-1 text-center cursor-pointer border-2 border-transparent hover:border-[#bee9e8]"
                >
                  Tham gia hệ thống
                </button>
              </motion.div>
            </motion.div>

            {/* Right Column: Image and Overlay stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOutQuint }}
              className="lg:col-span-6 relative w-full flex justify-center"
            >
              <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 group ring-4 ring-[#62B6CB]/20">
                <img 
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop" 
                  alt="BackHaulBid logistics commercial truck in motion"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-110 contrast-110"
                />

                {/* Overlaid glass cards */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex-1 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="text-[0.7rem] text-[#bee9e8]/80 font-bold uppercase tracking-wider">Tiết kiệm trung bình</div>
                    <div className="text-2xl font-black text-white mt-1">15.4%</div>
                    <div className="text-[0.65rem] text-[#bee9e8]/60 mt-0.5">Chi phí vận chuyển</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex-1 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="text-[0.7rem] text-[#bee9e8]/80 font-bold uppercase tracking-wider">Khớp lệnh hàng tháng</div>
                    <div className="text-2xl font-black text-[#62B6CB] mt-1">10,000+</div>
                    <div className="text-[0.65rem] text-[#bee9e8]/60 mt-0.5">Tuyến hàng hoạt động</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
          </div>
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

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Giải đáp nhanh các thắc mắc phổ biến về quy chế hoạt động của BackHaulBid.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "Quy chế đấu giá ngược của BackHaulBid hoạt động như thế nào?",
                a: "Chủ hàng đăng tải yêu cầu vận chuyển cùng mức giá trần mong muốn. Các nhà xe sẽ tham gia bỏ giá thầu cạnh tranh giảm dần. Hệ thống tự động xếp hạng mức giá tốt nhất theo thời gian thực để tìm ra nhà xe phù hợp nhất."
              },
              {
                q: "Làm thế nào để nhà xe chứng minh năng lực vận tải?",
                a: "BackHaulBid áp dụng cơ chế eKYC nghiêm ngặt. Nhà xe phải cung cấp đầy đủ giấy phép kinh doanh vận tải, giấy đăng ký xe, đăng kiểm và xác thực thông tin tài xế trước khi được kích hoạt tài khoản hoạt động."
              },
              {
                q: "Dòng tiền giao dịch được bảo vệ như thế nào?",
                a: "Chúng tôi tích hợp hệ thống Ví điện tử B2B. Chủ hàng sẽ tiến hành ký quỹ bảo đảm khi khớp lệnh chuyến đi. Dòng tiền sẽ tự động giải ngân cho nhà xe ngay khi chuyến đi hoàn tất và được xác nhận giao hàng thành công."
              },
              {
                q: "BackHaulBid có tính phí thành viên không?",
                a: "Không. Việc đăng ký tài khoản và tìm kiếm tuyến hàng trên BackHaulBid là hoàn toàn miễn phí. Chúng tôi chỉ thu một khoản phí dịch vụ nhỏ dựa trên tỷ lệ phần trăm giao dịch thành công."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_12px_rgba(27,73,101,0.02)]"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-start gap-2">
                  <span className="text-[#1B4965] font-black">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-[0.95rem] text-[#64748B] font-medium leading-relaxed pl-6">
                  {faq.a}
                </p>
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
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg shadow-sm transition-all duration-300 group-hover:rotate-6 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1B4965 0%, #62B6CB 100%)",
              }}
            >
              <LocalShippingTwoToneIcon sx={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[1rem] font-black leading-tight tracking-tight text-slate-800 transition-colors group-hover:text-[#1B4965]">
                BackHaulBid
              </span>
              <span className="text-[0.6rem] text-cyan-600 font-bold tracking-widest uppercase leading-none mt-0.5">
                B2B Logistics
              </span>
            </div>
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

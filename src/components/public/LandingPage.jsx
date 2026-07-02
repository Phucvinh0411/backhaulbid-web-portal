"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const features = [
    {
      title: 'eKYC & Xác thực',
      desc: 'Quy trình xác minh đối tác vận tải nhanh chóng, an toàn. Đảm bảo mọi giao dịch đều được thực hiện với các đối tác đáng tin cậy.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
      ),
    },
    {
      title: 'Ví điện tử & Thanh toán',
      desc: 'Giao dịch minh bạch, thanh toán nhanh chóng qua ví tích hợp. Giảm thiểu rủi ro và quản lý dòng tiền hiệu quả.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
      ),
    },
    {
      title: 'Đấu giá ngược',
      desc: 'Shipper đăng đơn, Carriers đấu giá để tối ưu chi phí. Mô hình cạnh tranh mang lại lợi ích cao nhất cho cả hai bên.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
      ),
    },
  ];

  const steps = [
    { step: '01', title: 'Đăng ký & Xác thực', desc: 'Tạo tài khoản doanh nghiệp và hoàn tất eKYC trong vòng 24 giờ.' },
    { step: '02', title: 'Đăng lô hàng', desc: 'Chủ hàng đăng đơn với thông tin chi tiết tuyến đường, khối lượng và thời gian.' },
    { step: '03', title: 'Đấu giá ngược', desc: 'Nhà xe cạnh tranh đưa ra mức giá tốt nhất. Hệ thống tự động xếp hạng.' },
    { step: '04', title: 'Vận chuyển & Thanh toán', desc: 'Theo dõi thời gian thực, thanh toán tự động qua ví điện tử tích hợp.' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              <span className="text-[#1e40af]">BackHaul</span><span className="text-slate-900">Bid</span>
            </span>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Giải pháp</a>
              <a href="#process" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Quy trình</a>
              <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Bảng giá</a>
            </nav>
            <button 
              onClick={() => router.push(' /login')}
              className="text-sm font-semibold py-2.5 px-5 rounded-lg transition-all bg-blue-700 hover:bg-blue-800 text-white"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-lg"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]"
                style={{ letterSpacing: '-0.035em' }}
              >
                Tối ưu chuyến xe chiều về bằng đấu giá ngược
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="mt-5 text-base text-slate-500 leading-relaxed max-w-md"
              >
                Giải pháp vận tải B2B thông minh giúp tối đa hóa hiệu suất đội xe, giảm thiểu chi phí và tăng doanh thu thông qua nền tảng kết nối trực tiếp.
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <button 
                  onClick={() => router.push(' /register')}
                  className="font-semibold py-3 px-7 rounded-lg transition-all text-white text-sm bg-blue-700 hover:bg-blue-800"
                >
                  Khám phá ngay
                </button>
                <button 
                  className="border border-slate-200 text-slate-700 font-semibold py-3 px-7 rounded-lg transition-all hover:border-slate-300 hover:bg-slate-50 text-sm"
                >
                  Liên hệ tư vấn
                </button>
              </motion.div>
            </motion.div>

            {/* Right Content - Real visual instead of fake mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/60" style={{ aspectRatio: '4/3' }}>
                <img 
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop" 
                  alt="Logistics fleet management dashboard"
                  className="w-full h-full object-cover"
                />
                {/* Overlay info cards */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 border border-white/20 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Tiết kiệm trung bình</div>
                    <div className="text-lg font-bold text-[#1e40af]">15%</div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 border border-white/20 shadow-sm">
                    <div className="text-xs text-slate-500 font-medium">Lô hàng / tháng</div>
                    <div className="text-lg font-bold text-slate-900">10,000+</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats - Simple horizontal bar */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            {[
              { value: '5,000+', label: 'Thành viên tin dùng' },
              { value: '10,000+', label: 'Lô hàng mỗi tháng' },
              { value: '15%', label: 'Tiết kiệm chi phí trung bình' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp} 
                className="py-10 px-6 text-center"
              >
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Features - Card grid */}
      <section id="features" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="max-w-2xl mb-14"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Tính năng cốt lõi
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-3 text-slate-500 text-base">
              Nền tảng được thiết kế chuyên biệt cho ngành logistics, mang lại sự minh bạch và hiệu quả.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp} 
                className="group relative bg-white border border-slate-100 p-7 rounded-2xl transition-all hover:border-slate-200 hover:shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-[#1e40af] bg-blue-50 group-hover:bg-[#1e40af] group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="max-w-2xl mb-14"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Quy trình hoạt động
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-3 text-slate-500 text-base">
              Bốn bước đơn giản để bắt đầu tối ưu hóa chuỗi cung ứng.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 border border-slate-100"
              >
                <div className="text-xs font-bold text-[#1e40af] mb-3 tracking-wider">{step.step}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
              Sẵn sàng tối ưu hóa chuỗi cung ứng?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-blue-200 mb-8 text-base max-w-lg mx-auto">
              Tham gia ngay để trải nghiệm giải pháp quản lý vận tải B2B hàng đầu.
            </motion.p>
            <motion.button 
              variants={fadeInUp}
              onClick={() => router.push('/register')}
              className="bg-white text-[#1e40af] hover:bg-slate-50 font-bold py-3 px-8 rounded-lg transition-colors text-sm"
            >
              Đăng ký tài khoản
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight" style={{ letterSpacing: '-0.03em' }}>BackHaulBid</span>
            <p className="text-slate-400 text-xs mt-1">&copy; {new Date().getFullYear()} BackHaulBid. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-700 transition-colors">Về chúng tôi</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

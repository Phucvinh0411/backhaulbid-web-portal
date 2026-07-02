"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EkycModal from "@/components/eKYC/EkycModal";

export default function RegisterPage() {
  const router = useRouter();
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [formData, setFormData] = useState({
    role: "shipper", // 'shipper' or 'carrier'
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowEkycModal(true);
  };

  const handleSkipEkyc = () => {
    setShowEkycModal(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("userRole", formData.role);
    }
    router.push(`/${formData.role}`);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-700/80 to-blue-900/90 z-10"></div>
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519003722824-194d4455aeb0?auto=format&fit=crop&q=80&w=1920")', backgroundSize: "cover", backgroundPosition: "center" }}
        ></div>

        <div className="relative z-20">
          <h1 className="text-2xl font-black tracking-tight mb-20">BackHaulBid.</h1>

          <div className="space-y-4 mb-24">
            <h2 className="text-4xl font-bold leading-tight">Secure B2B Logistics Login</h2>
            <p className="text-blue-100 text-lg">Access your account and manage shipments efficiently.</p>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <h2 className="text-3xl font-bold mb-4">Chào mừng bạn đến với BackHaulBid</h2>
          <p className="text-blue-100 mb-8 max-w-md">
            Nền tảng đấu giá vận tải B2B hàng đầu. Tối ưu hóa chuỗi cung ứng, giảm thiểu chi phí và kết nối trực tiếp chủ hàng với chủ xe.
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-blue-700" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
              <img className="w-10 h-10 rounded-full border-2 border-blue-700" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
              <img className="w-10 h-10 rounded-full border-2 border-blue-700" src="https://i.pravatar.cc/100?img=3" alt="Avatar" />
            </div>
            <span className="text-sm font-medium">Tham gia cùng 10,000+ doanh nghiệp.</span>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 lg:p-24 overflow-y-auto relative">
        <div className="max-w-md w-full mx-auto">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại Đăng nhập
          </Link>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Tạo tài khoản mới</h2>
            <p className="text-slate-500">Vui lòng điền thông tin để bắt đầu trải nghiệm.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">1. Bạn là ai?</p>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border rounded-xl p-4 flex flex-col cursor-pointer transition-all ${formData.role === "shipper" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="role" value="shipper" className="sr-only"
                    checked={formData.role === "shipper"} onChange={() => setFormData({...formData, role: "shipper"})} />
                  <div className="flex items-center mb-2">
                    <svg className={`w-5 h-5 mr-2 ${formData.role === "shipper" ? "text-blue-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    <span className={`font-semibold ${formData.role === "shipper" ? "text-blue-900" : "text-slate-700"}`}>Chủ Hàng</span>
                  </div>
                  <span className="text-xs text-slate-500">Cần tìm xe vận chuyển hàng hóa.</span>
                </label>
                <label className={`border rounded-xl p-4 flex flex-col cursor-pointer transition-all ${formData.role === "carrier" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="role" value="carrier" className="sr-only"
                    checked={formData.role === "carrier"} onChange={() => setFormData({...formData, role: "carrier"})} />
                  <div className="flex items-center mb-2">
                    <svg className={`w-5 h-5 mr-2 ${formData.role === "carrier" ? "text-blue-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    <span className={`font-semibold ${formData.role === "carrier" ? "text-blue-900" : "text-slate-700"}`}>Chủ Xe</span>
                  </div>
                  <span className="text-xs text-slate-500">Cần tìm nguồn hàng để vận chuyển.</span>
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-700 mb-2">2. Thông tin cá nhân</p>

              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-slate-600 mb-1">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input type="text" id="fullName" required
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
                    placeholder="Nguyễn Văn A" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1">Email công việc</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <input type="email" id="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
                    placeholder="name@company.com" />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <input type="tel" id="phone" required
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
                    placeholder="090 123 4567" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <input type="password" id="password" required minLength="8"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
                    placeholder="••••••••" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ít nhất 8 ký tự, bao gồm chữ và số.</p>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center">
              Tạo tài khoản
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>

            <div className="text-center text-xs text-slate-500">
              Bằng việc đăng ký, bạn đồng ý với <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản</a> và <a href="#" className="text-blue-600 hover:underline font-medium">Bảo mật</a> của chúng tôi.
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Đã có tài khoản? </span>
              <Link href="/login" className="text-blue-600 hover:underline font-bold">Đăng nhập</Link>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-auto pt-8 flex justify-between items-center text-xs text-slate-400 max-w-md w-full mx-auto">
          <span>© 2024 BackHaulBid. All rights reserved.</span>
          <div className="space-x-4">
            <a href="#" className="hover:text-slate-600">Về chúng tôi</a>
            <a href="#" className="hover:text-slate-600">Điều khoản</a>
            <a href="#" className="hover:text-slate-600">Bảo mật</a>
            <a href="#" className="hover:text-slate-600">Liên hệ</a>
          </div>
        </div>
      </div>

      {showEkycModal && <EkycModal onClose={handleSkipEkyc} role={formData.role} />}
    </div>
  );
}

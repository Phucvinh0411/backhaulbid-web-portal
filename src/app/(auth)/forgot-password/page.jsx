"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Khôi phục mật khẩu</h1>
        <p className="text-slate-600 mb-8">
          Vui lòng nhập email đăng ký để nhận liên kết khôi phục mật khẩu.
        </p>
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          &larr; Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}

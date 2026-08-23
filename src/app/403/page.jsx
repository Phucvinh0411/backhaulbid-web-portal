"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <LockOutlinedIcon className="!text-5xl !text-amber-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-black text-slate-900">Bạn không có quyền truy cập</h1>
        <p className="mt-3 text-slate-600">Tài khoản hiện tại không được phép xem trang này.</p>
        <Button component={Link} href="/" variant="contained" className="!mt-7 !rounded-xl !bg-[#1B4965] !px-6 !py-3 !font-bold">
          Về trang chủ
        </Button>
      </section>
    </main>
  );
}

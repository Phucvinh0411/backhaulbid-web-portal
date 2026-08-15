"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";

import {
  getAuctionAccess,
  retryRegistrationPayment,
} from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { formatCurrency } from "@/utils/auctionFormatters";
import AuctionRegistrationDialog from "./AuctionRegistrationDialog";

const formatRemaining = (date) => {
  const seconds = Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default function CarrierRegistrationGate({ auctionId, shipment, onAccessChange }) {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState("");
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  const updateAccess = useCallback(
    (nextAccess) => {
      setAccess(nextAccess);
      onAccessChange?.(nextAccess);
    },
    [onAccessChange],
  );

  const loadAccess = useCallback(async () => {
    try {
      const nextAccess = await getAuctionAccess(auctionId);
      updateAccess(nextAccess);
      setError("");
    } catch (requestError) {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Không thể kiểm tra quyền tham gia phiên đấu giá.");
    } finally {
      setLoading(false);
    }
  }, [auctionId, updateAccess]);

  useEffect(() => {
    void loadAccess();
    const interval = window.setInterval(loadAccess, 5000);
    return () => window.clearInterval(interval);
  }, [loadAccess]);

  useEffect(() => {
    let active = true;
    getMyVehicles()
      .then((response) => {
        if (active) setVehicles(Array.isArray(response) ? response : []);
      })
      .catch((requestError) => {
        if (!active) return;
        const message = requestError?.response?.data?.message;
        setVehiclesError(Array.isArray(message) ? message.join(", ") : message || "Không thể tải phương tiện đã xác minh.");
      })
      .finally(() => {
        if (active) setVehiclesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const startTime = access?.startTime || shipment?.startTime;
    if (!startTime) return undefined;

    const updateRemaining = () => setRemaining(formatRemaining(startTime));
    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [access?.startTime, shipment?.startTime]);

  const paymentSummary = useMemo(() => {
    const fee = Number(shipment?.participationFee || 0);
    const depositRequired = shipment?.isDepositRequired ?? Number(shipment?.depositAmount || 0) > 0;
    const deposit = depositRequired ? Number(shipment.depositAmount || 0) : 0;
    return { fee, deposit, depositRequired, total: fee + deposit };
  }, [shipment]);

  const handleRegister = () => {
    setError("");
    setRegistrationDialogOpen(true);
  };

  const handleRegistrationCompleted = async () => {
    await loadAccess();
  };

  const handleRetryPayment = async () => {
    if (!access?.registrationId) return;
    setSubmitting(true);
    setError("");
    try {
      await retryRegistrationPayment(auctionId, access.registrationId, {
        idempotencyKey: globalThis.crypto.randomUUID(),
      });
      await loadAccess();
    } catch (requestError) {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Không thể hoàn tất thanh toán.");
      await loadAccess();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
        <CircularProgress size={22} /> Đang kiểm tra trạng thái đăng ký...
      </div>
    );
  }

  const status = access?.accessStatus;
  const canEnter = access?.canEnter === true;

  if (canEnter) {
    return (
      <Alert severity="success" className="mb-6 !rounded-3xl">
        Bạn đã đủ điều kiện. Phòng đấu giá đang mở, có thể đặt giá.
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {error && <Alert severity="error" className="!mb-4 !rounded-2xl">{error}</Alert>}

      {status === "REGISTRATION_REQUIRED" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Điều kiện tham gia</p>
            <h2 className="mt-1 text-lg font-black text-slate-800">Đăng ký và hoàn tất thanh toán trước hạn đóng đăng ký</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <PaymentsIcon className="text-sky-700" />
              <p className="mt-2 text-xs font-bold text-slate-500">Phí tham gia bắt buộc</p>
              <p className="font-mono text-lg font-black text-sky-800">{formatCurrency(paymentSummary.fee)}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <SecurityIcon className="text-amber-700" />
              <p className="mt-2 text-xs font-bold text-slate-500">Tiền đặt cọc</p>
              <p className="font-mono text-lg font-black text-amber-800">
                {paymentSummary.depositRequired ? formatCurrency(paymentSummary.deposit) : "Không yêu cầu"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <span className="text-sm font-bold text-slate-600">Tổng cần thanh toán/khóa</span>
            <span className="font-mono text-lg font-black text-slate-900">{formatCurrency(paymentSummary.total)}</span>
          </div>
          <Button variant="contained" onClick={handleRegister} disabled={submitting} className="!rounded-2xl !px-6 !py-3 !font-bold">
            {submitting ? "Đang xử lý..." : "Đăng ký tham gia"}
          </Button>
        </div>
      )}

      {status === "PAYMENT_INCOMPLETE" && (
        <div className="space-y-3">
          <p className="text-lg font-black text-slate-800">Đăng ký đã tạo nhưng thanh toán chưa hoàn tất</p>
          <p className="text-sm text-slate-500">Bạn có thể thử lại trước khi phiên bắt đầu. Nếu quá thời điểm bắt đầu, hệ thống sẽ khóa thao tác này.</p>
          <Button variant="contained" onClick={handleRetryPayment} disabled={submitting} className="!rounded-2xl !px-6 !py-3 !font-bold">
            {submitting ? "Đang xử lý..." : "Thử lại thanh toán"}
          </Button>
        </div>
      )}

      {status === "WAITING_FOR_START" && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Đã đăng ký thành công</p>
            <p className="mt-1 text-lg font-black text-slate-800">Phòng sẽ mở khi đến giờ bắt đầu</p>
              <p className="mt-1 text-sm text-slate-500">Bạn chưa thể xem phòng hoặc đặt giá trước thời điểm này.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center text-emerald-800">
            <AccessTimeIcon />
            <p className="font-mono text-xl font-black">{remaining}</p>
          </div>
        </div>
      )}

      {status === "REGISTRATION_CLOSED" && <p className="font-black text-slate-700">Phiên đã đóng đăng ký, không thể tham gia thêm.</p>}
      {status === "AUCTION_COMPLETED" && <p className="font-black text-slate-700">Phiên đấu giá đã kết thúc.</p>}
        {status === "AUCTION_CANCELLED" && <p className="font-black text-slate-700">Phiên đấu giá đã bị hủy.</p>}
      </div>

      <AuctionRegistrationDialog
        open={registrationDialogOpen}
        auction={shipment}
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        vehiclesError={vehiclesError}
        onClose={() => setRegistrationDialogOpen(false)}
        onCompleted={handleRegistrationCompleted}
      />
    </>
  );
}

"use client";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

const STEPS = [
  { label: "Thông tin hàng hóa & Xe", desc: "Loại hàng, quy cách, kích thước xe" },
  { label: "Tuyến đường A → B", desc: "Địa chỉ nhận/giao & thời gian" },
  { label: "Cấu hình Đấu giá", desc: "Chế độ, giá trần & tiền cọc" },
];

export default function StepNavigationHeader({ activeStep, setActiveStep }) {
  return (
    <div className="bg-white rounded-xl border border-line/80 p-5 shadow-xs mb-6">
      {/* Progress bar line */}
      <div className="w-full bg-surface-sunken h-1.5 rounded-full mb-5 overflow-hidden">
        <div
          className="bg-[var(--color-brand)] h-full transition-all duration-500 ease-out"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Stepper activeStep={activeStep} connector={<div className="hidden" />} className="w-full flex justify-between gap-4 overflow-x-auto pb-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;

          return (
            <Step key={step.label} onClick={() => isCompleted && setActiveStep(idx)}>
              <StepLabel
                StepIconComponent={() => (
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs cursor-pointer transition-all shadow-xs ${
                      isCompleted
                        ? "bg-success text-white shadow-success-soft"
                        : isActive
                        ? "bg-[var(--color-brand)] text-white shadow-info-soft ring-4 ring-info-soft"
                        : "bg-surface-sunken text-ink-subtle border border-line"
                    }`}
                  >
                    {isCompleted ? <CheckCircleIcon className="!text-[1.1rem]" /> : idx + 1}
                  </div>
                )}
              >
                <div className="cursor-pointer select-none">
                  <p
                    className={`font-extrabold text-xs md:text-sm leading-tight whitespace-nowrap ${
                      isActive
                        ? "text-[var(--color-brand)]"
                        : isCompleted
                        ? "text-success font-bold"
                        : "text-ink-subtle"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[0.67rem] text-ink-subtle font-medium hidden md:block mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </div>
  );
}

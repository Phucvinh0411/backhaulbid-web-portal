import { Suspense } from "react";
import ComplaintListScreen from "@/components/complaints/ComplaintListScreen";
import { ListSkeleton } from "@/components/ui";

export const metadata = { title: "Khiếu nại | BackHaulBid" };

export default function CarrierComplaintsPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={4} label="Đang tải khiếu nại" />}>
      <ComplaintListScreen role="carrier" />
    </Suspense>
  );
}

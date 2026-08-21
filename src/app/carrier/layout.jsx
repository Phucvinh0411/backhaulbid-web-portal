import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Carrier | BackHaulBid",
};

const carrierUser = {
  name: "Trần Văn Xe (Carrier)",
  email: "carrier123@backhaulbid.local",
  avatar: "X",
  role: "Nhà xe",
  settingsPath: "/carrier/settings",
};

export default function CarrierLayout({ children }) {
  return (
    <DashboardLayout role="carrier" userInfo={carrierUser}>
      {children}
    </DashboardLayout>
  );
}

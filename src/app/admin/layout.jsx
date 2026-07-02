import { DashboardLayout } from "@/components/layout";
import adminNavigation from "@/configs/adminNavigation";

export const metadata = {
  title: "Admin | BackHaulBid",
};

const adminUser = {
  name: "Admin User",
  email: "admin@backhaulbid.vn",
  avatar: "A",
  role: "Quản trị viên",
  settingsPath: "/admin/settings",
};

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout role="admin" userInfo={adminUser}>
      {children}
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Admin | BackHaulBid",
};

const adminUser = {
  name: "Quản trị viên",
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

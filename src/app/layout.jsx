import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/theme";
import { GlobalNotificationProvider } from "@/components/common/NotificationPopup";

export const metadata = {
  title: "BackHaulBid - Nền tảng Giao dịch Vận tải B2B",
  description: "Nền tảng đấu giá và giao dịch vận tải B2B hàng đầu Việt Nam",
  icons: {
    icon: "/favicon.svg",
  },
};

// DESIGN.md typeface: designed for Vietnamese diacritics; self-hosted by next/font at build time.
const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider>
            <GlobalNotificationProvider>{children}</GlobalNotificationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

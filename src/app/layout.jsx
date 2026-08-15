import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "./globals.css";
import { ThemeProvider } from "@/theme";

export const metadata = {
  title: "BackHaulBid - Nền tảng Giao dịch Vận tải B2B",
  description: "Nền tảng đấu giá và giao dịch vận tải B2B hàng đầu Việt Nam",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

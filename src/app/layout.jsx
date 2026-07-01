import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/theme";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata = {
  title: "BackHaulBid - Nền tảng Giao dịch Vận tải B2B",
  description: "Nền tảng đấu giá và giao dịch vận tải B2B hàng đầu Việt Nam",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

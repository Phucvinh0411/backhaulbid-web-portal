# 💻 BackHaulBid Web Portal

> **Cổng Thông Tin Giao Dịch & Quản Trị B2B (Next.js 14 App Router + Tailwind CSS v4 + Material UI v5)**
>
> BackHaulBid Web Portal là phân hệ Frontend chính dành cho Quản trị viên (Admin) điều hành hệ thống và Khách hàng (Shipper - Chủ hàng, Carrier - Nhà xe) thực hiện các giao dịch vận tải. Dự án đã được hiện đại hóa toàn diện từ nền tảng cũ sang **Next.js 14 App Router** để hỗ trợ tối ưu kết xuất phía máy chủ (SSR), định vị cấu trúc module chuyên nghiệp, và áp dụng ngôn ngữ thiết kế tương lai (2026).

---

## ✨ Điểm Nổi Bật (Key Features & Aesthetics)

*   **Premium Glassmorphism**: Thiết kế giao diện lơ lửng (Floating Layout) tinh tế với hiệu ứng kính mờ pha lê (frosted glass) cho thanh Sidebar, Header, Footer và các thẻ nội dung (Card).
*   **Deep Navy Theme**: Sử dụng bảng màu chủ đạo **Xanh sẫm đặc trưng (`#1B4965`)**, phối hợp hài hòa cùng màu phụ **Xanh ngọc (`#62B6CB`)** và dải Mesh Gradient mềm mại tạo chiều sâu thị giác.
*   **Auto-expand Smart Menu**: Menu Sidebar thông minh tự động nhận diện và mở rộng nhóm menu cha tương ứng với tuyến đường (Route) hiện tại, đồng bộ trạng thái hiển thị của các mục con cùng các thanh chỉ thị (Active Indicators) độc đáo.
*   **Dynamic Routing Structure**: Tận dụng cơ chế Catch-all Router (`src/app/(dashboard)/[...slug]/page.jsx`) giúp định tuyến linh hoạt toàn bộ phân hệ quản lý qua dữ liệu cấu hình tập trung mà không phát sinh thêm các file thừa.
*   **SSR & MUI Integration**: Tương thích hoàn hảo giữa Material UI và Next.js SSR bằng cách tổ chức tốt các chỉ thị `"use client"` đúng cấp linh kiện.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

*   **Framework**: ![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
*   **Styling**: ![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white) ![MUI v5](https://img.shields.io/badge/MUI_v5-007FFF?style=flat-square&logo=mui&logoColor=white)
*   **Engine**: Emotion (React styling helper)

---

## 📌 Yêu Cầu Hệ Thống (Prerequisites)

*   [Node.js](https://nodejs.org/) phiên bản `18.x` hoặc `20.x` trở lên (Khuyến nghị sử dụng LTS).
*   Trình quản lý gói `npm` (đi kèm Node.js).
*   API Gateway (`api-gateway`) chạy trên cổng `8000`.

---

## 🚀 Kích Hoạt Dự Án (Getting Started)

1.  **Clone repository và di chuyển vào thư mục:**
    ```bash
    git clone https://github.com/backhaulbid/backhaulbid-web-portal.git
    cd backhaulbid-web-portal
    ```

2.  **Cài đặt các thư viện phụ thuộc:**
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env` ở thư mục gốc của dự án:
    ```env
    NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8000
    NEXT_PUBLIC_BIDDING_WS_URL=ws://localhost:8000/ws
    ```

4.  **Khởi chạy máy chủ phát triển (Development Server):**
    ```bash
    npm run dev
    ```
    *Mặc định, dự án Next.js sẽ chạy trên cổng **`3000`**. Truy cập trực tiếp tại: [http://localhost:3000](http://localhost:3000)*

5.  **Biên dịch tối ưu hóa production:**
    ```bash
    npm run build
    npm run start
    ```

---

## 📂 Cơ Cấu Thư Mục (Project Structure)

Dự án được cấu trúc lại tinh gọn và chuyên nghiệp theo chuẩn **Next.js App Router**:

```text
backhaulbid-web-portal/
├── public/              # Tài nguyên tĩnh (Favicon, Logo, Vector minh họa...)
├── src/
│   ├── app/             # Router & Trang (App Router Layouts & Pages)
│   │   ├── layout.jsx   # Cấu hình gốc (HTML/Body, Providers & Global Styles)
│   │   └── (dashboard)  # Route Group dành cho trang quản trị hệ thống
│   │       ├── dashboard/   # Trang tổng quan điều hành chính (Dashboard Home)
│   │       └── [...slug]/   # Catch-all Route xử lý động các phân hệ chức năng
│   ├── components/      # Linh kiện UI dùng chung
│   │   ├── common/      # PageHeader, StatCard, Breadcrumbs...
│   │   └── layout/      # Sidebar, Header, Footer, DashboardLayout...
│   ├── configs/         # Cấu hình dữ liệu tĩnh (Danh mục navigation, API Client...)
│   ├── theme/           # Cấu hình Material UI Theme (Colors, Typography...)
│   └── index.css        # Khai báo Tailwind directives và CSS variables toàn cục
├── next.config.mjs      # Cấu hình Next.js (chế độ biên dịch, rewrite url...)
├── jsconfig.json        # Định nghĩa path aliases (sử dụng tiền tố @/ làm đường dẫn tuyệt đối)
├── postcss.config.mjs   # Cấu hình biên dịch PostCSS
├── tailwind.config.js   # Cấu hình tích hợp Tailwind CSS
├── package.json         # Khai báo thư viện & các script lệnh CLI
└── README.md
```

---

## 🐳 Triển Khai Với Docker

Dự án đã sẵn sàng để build và phân phối qua Docker:

1.  **Biên dịch Docker Image:**
    ```bash
    docker build -t backhaulbid-web-portal:latest .
    ```

2.  **Khởi chạy Container (Ánh xạ cổng `3000`):**
    ```bash
    docker run -d -p 3000:3000 --name web-portal-container backhaulbid-web-portal:latest
    ```

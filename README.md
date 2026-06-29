# 💻 BackHaulBid Web Portal

> **Cổng Thông Tin Giao Dịch & Quản Trị B2B (Vite + React + Tailwind CSS + MUI + React Router)**
>
> BackHaulBid Web Portal là phân hệ Frontend chính dành cho Quản trị viên (Admin) điều hành hệ thống và Khách hàng (Shipper - Chủ hàng, Carrier - Nhà xe) thực hiện các giao dịch. Dự án được phát triển tối ưu tốc độ phản hồi và tải trang dựa trên bundler Vite, tổ chức mã nguồn theo mô hình Feature-Driven (phát triển xoay quanh tính năng).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

*   **Runtime & Builder**: ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
*   **Routing**: ![React Router](https://img.shields.io/badge/React_Router_6-CA4245?style=flat-square&logo=react-router&logoColor=white)
*   **Styling**: ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white) ![MUI](https://img.shields.io/badge/MUI_v5-007FFF?style=flat-square&logo=mui&logoColor=white)
*   **State Management & API Client**: Axios, Context API / Redux Toolkit.
*   **Real-time Connection**: Socket.io Client.

---

## 📌 Yêu Cầu Hệ Thống (Prerequisites)

*   [Node.js](https://nodejs.org/) version `18.x` hoặc `20.x` trở lên.
*   Trình quản lý gói `npm` (đi kèm Node.js) hoặc `yarn`.
*   API Gateway (`api-gateway`) chạy local ở cổng `8080`.

---

## 🚀 Kích Hoạt Dự Án (Getting Started)

1.  **Clone repository và di chuyển vào thư mục:**
    ```bash
    git clone https://github.com/backhaulbid/backhaulbid-web-portal.git
    cd backhaulbid-web-portal
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    # hoặc sử dụng yarn:
    yarn install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env` ở thư mục gốc của dự án:
    ```env
    VITE_API_GATEWAY_URL=http://localhost:8080
    VITE_BIDDING_WS_URL=http://localhost:3000
    ```

4.  **Khởi chạy máy chủ phát triển (Development Server):**
    ```bash
    npm run dev
    # hoặc sử dụng yarn:
    yarn dev
    ```
    *Mặc định, ứng dụng sẽ chạy trên cổng **`5173`**. Truy cập tại địa chỉ: [http://localhost:5173](http://localhost:5173)*

5.  **Biên dịch mã nguồn (Build Production):**
    ```bash
    npm run build
    ```

---

## 📂 Cơ Cấu Thư Mục (Project Structure)

Dự án áp dụng mô hình thiết kế **Feature-Driven Architecture** (Tổ chức theo các phân hệ tính năng độc lập tại thư mục `src/modules/`), giúp việc mở rộng dự án lớn không bị xung đột cấu trúc:

```text
backhaulbid-web-portal/
├── public/              # Tài nguyên tĩnh (images, logos, favicon...)
├── src/
│   ├── assets/          # Stylesheet toàn cục, fonts, icons hệ thống
│   ├── components/      # UI Components dùng chung (Button, Input, Table, Modal...)
│   ├── configs/         # Cấu hình hệ thống (axios client, socket connection...)
│   ├── hooks/           # Custom React Hooks dùng chung
│   ├── layouts/         # Layouts chính (AuthLayout, DashboardLayout, AdminLayout)
│   ├── routes/          # Cấu hình phân tuyến đường dẫn (React Router routes)
│   ├── utils/           # Hàm bổ trợ (helpers, formatters, validators)
│   ├── modules/         # Phân hệ tính năng cốt lõi (Feature-Driven)
│   │   ├── auth/        # Đăng ký, đăng nhập, phân quyền người dùng
│   │   ├── dashboard/   # Giao diện tổng quan, biểu đồ thống kê
│   │   ├── bidding/     # Tạo đơn hàng, theo dõi phòng đấu giá trực tuyến
│   │   ├── fleet/       # Đăng ký xe, gán tài xế, quản lý hồ sơ xe tải
│   │   ├── wallet/      # Giao dịch nạp/rút tiền, số dư ví, giữ cọc
│   │   └── contracts/   # Điều khoản hợp đồng vận chuyển, ký số điện tử
│   ├── App.jsx          # Component gốc cấu hình Context & Theme Providers
│   └── main.jsx         # Điểm khởi động ứng dụng React (Entrypoint)
├── index.html           # File HTML khung chính
├── tailwind.config.js   # Cấu hình Tailwind CSS
├── vite.config.js       # Cấu hình compiler Vite
├── package.json         # Khai báo thư viện & các lệnh CLI
└── README.md
```

---

## 🐳 Triển Khai Với Docker

Build Docker Image:
```bash
docker build -t backhaulbid-web-portal:latest .
```

Khởi chạy container ánh xạ cổng `5173`:
```bash
docker run -d -p 5173:5173 --name web-portal-container backhaulbid-web-portal:latest
```

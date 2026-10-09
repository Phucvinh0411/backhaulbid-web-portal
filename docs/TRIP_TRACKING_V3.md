# Theo dõi chuyến V3 trên web

Màn theo dõi Chủ hàng và Chủ xe dùng cùng khung hành trình: trạng thái hiện tại, tiến trình 5 bước, hạn giao, bản đồ và timeline có đường nối. Hành động và quyền giao nhận tiếp tục do server quyết định. Chủ hàng xác nhận nhận hàng ở DELIVERED; nhà xe phân công tài xế và cấp PIN.

## Dữ liệu bản đồ

- A là kho lấy, B là kho giao. Pin đến từ tọa độ người dùng xác nhận, không suy ra từ tâm tỉnh.
- Cột mốc dự kiến và đã check-in có nhãn riêng. Timeline dùng thời gian sự kiện và reachedAt thực.
- Nguồn CHECK_IN hiển thị “GPS khi check-in” và marker riêng; không nối thành vệt GPS liên tục hay ghi là vị trí nhập tay. Snapshot latestLocation:null không dựng lại marker tài xế cũ từ history.
- Vệt GPS chỉ nối mẫu GPS có sai số tối đa 100 m, khoảng cách thời gian tối đa 5 phút và tốc độ giữa mẫu không quá 200 km/h. Mẫu thủ công, khoảng gián đoạn và bước nhảy lớn ngắt đoạn.
- Tuyến dự kiến chỉ hiển thị khi tracking API trả GeoJSON LineString hợp lệ. Vệt GPS màu xanh; tuyến dự kiến màu hổ phách nét đứt để dễ phân biệt với đường nền bản đồ. Không có ETA dựng từ hạn giao.
- Vị trí FRESH/STALE/LOST/NONE/STOPPED hiển thị trạng thái và thời gian mẫu, không dùng thời gian tải trang để giả cập nhật GPS.

## Điểm kho

Tạo phiên bước 2 và Sổ địa chỉ cho phép chọn pin trên Leaflet hoặc nhập tọa độ. Địa chỉ cũ vẫn dùng được khi chưa có tọa độ. Đổi địa chỉ/tỉnh xóa pin để người dùng xác nhận lại. Chọn từ sổ kho sao chép cả pin.

Chuyến WAITING_PICKUP của Chủ hàng có nút xác nhận hai pin qua PATCH /api/v1/trips/{id}/route-points với version = routeVersion. Server giữ địa chỉ hợp đồng và kiểm quyền/version. Sau lấy hàng UI không cho thay vị trí kho.

## Cập nhật và lỗi

GET tracking + history (1000 điểm/lần, tối đa 3000 điểm trong UI) dùng cursor opaque. History được gộp theo ID và sắp theo capturedAt. Poll 15 giây khi màn hiện và cửa sổ có focus; dừng poll chuyến COMPLETED/CANCELLED. Làm mới thủ công vẫn dùng được. API lỗi hiện rõ và giữ dữ liệu lần thành công gần nhất; response chuyến cũ bị bỏ qua khi chuyển chuyến.

Chuyến dài có lịch sử đầu được server lấy mẫu đều và giữ điểm đầu/cuối. Khi số điểm đã gộp vượt giới hạn UI, client tiếp tục lấy mẫu có giữ điểm đầu/cuối để không mất đầu hành trình sau nhiều giờ mở màn. Khi server hoặc client lấy mẫu, chú thích “Đường đi được lấy mẫu từ … điểm” được giữ qua các trang cập nhật mới, dù trang incremental không lấy mẫu.

## Kiểm tra

Các test model kiểm null/invalid coordinates, GPS gap/manual/accuracy, retry dedupe, check-in timeline, GeoJSON lng/lat và mapper pin tạo phiên. Lệnh: npm test. Kiểm responsive cần 360/390/768/1280/1440 px cho các trạng thái chuyến. Browser fixture không thay thế kiểm API thật hoặc GPS Android thật.

Kết quả local cuối ngày 06/10/2026: npm test 123 pass, 1 skip, 0 fail; ESLint file thay đổi sạch. Browser fixture kiểm 60 tổ hợp (2 vai trò × 6 trạng thái × 5 chiều rộng), payload sửa pin và lỗi làm mới đều pass. Browser qua gateway thật đọc chuyến thử V3 của Chủ hàng/Chủ xe ở 5 chiều rộng; API tracking/history trả 200, tile OSM tải được, tuyến dự kiến hổ phách hiển thị, không tràn ngang và không lỗi runtime. Trang tải APK V3 trên LAN được kiểm ở 390 px. Bằng chứng trong thư mục workspace `.verification/tracking-v3-web-*-results.json` và ảnh cùng prefix; dữ liệu đăng nhập nằm riêng trong fixture private, không đưa vào log.

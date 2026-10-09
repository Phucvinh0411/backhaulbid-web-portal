# Hoàn thiện sau redesign

Lựa chọn người dùng ngày 2026-10-05: nhận từng chuyến bằng PIN, tiếp tục sửa code trực tiếp.

## Nhận chuyến

- `driver_id` vẫn là ID hồ sơ fleet. `driver_account_id` là tài khoản DRIVER đã nhận chuyến; không suy ra liên kết từ số điện thoại hoặc trùng UUID.
- Chủ xe/Admin phân công chuyến WAITING_PICKUP, tạo PIN 6 số dùng một lần, hạn 24 giờ. Phân công lại xóa tài khoản nhận cũ, reset số lần sai và tạo PIN mới.
- DRIVER nhập UUID chuyến và PIN qua `POST /api/v1/trips/{tripId}/claim`. Tối đa 5 lần sai cho mỗi lần phân công; khóa và yêu cầu Chủ xe cấp lại PIN. Không lưu PIN rõ trong DB/log.
- Khóa hàng DB khi nhận/phân công để không có hai tài khoản cùng nhận. PIN hợp lệ lưu tài khoản nhận và mốc DRIVER_ACCEPTED trong cùng transaction.
- Danh sách, chi tiết, journey event, bằng chứng, vị trí và check-in kiểm tra `driver_account_id`; DRIVER vẫn không được tự hoàn thành hoặc hủy.
- Dữ liệu cũ không tự gán tài khoản. Chuyến chưa nhận phải được Chủ xe cấp PIN mới.

## Đã hiện thực

1. Migration V20, API claim, quyền tài xế, test PIN/phân quyền/concurrency. Lỗi nghiệp vụ trip trả `status` và `message` để app phân biệt sai PIN, hết hạn, khóa và chuyến đã nhận.
2. Chủ xe xem/sao chép UUID + PIN và hạn nhận; app có form nhận chuyến, lỗi từng trường, khóa gửi lặp. Danh sách/chi tiết web phân biệt đã phân công, chờ nhận và đã nhận trong app.
3. Hợp đồng dùng UUID chuyến cho link theo dõi, chỉ hiện PDF khi có URL; thẻ mobile ưu tiên tuyến, giá và hành động thật. Ví có danh sách giao dịch mobile và loading/error/retry; đội xe/tài xế ép dạng thẻ trên mobile và không nuốt lỗi API.
4. Tạo phiên có CTA cố định trên mobile, tóm tắt rõ trước khi xác nhận, chặn gửi lặp trong cả khoảng chờ điều hướng. Bỏ lời hứa lưu nháp tự động; phí là dự kiến và nhãn xe là tiếng Việt. Sửa liên kết quay lại của PageHeader để về mục cha.

## Kiểm chứng

| Kiểm tra | Kết quả |
|---|---|
| contract-service | 55 pass, 0 fail/skip |
| Web lint/test | Sạch; 107 pass, 1 skip, 0 fail |
| Web build | Thành công, 48 trang static |
| Expo test/export | 3 pass; export 11 route |
| Gateway + PostgreSQL | Claim, vai trò, profile/account tách biệt, PIN dùng một lần, retry idempotent, 5 lần sai persist/khóa, cấp lại, thu hồi quyền cũ, hết hạn, cạnh tranh 200/409 |
| Browser web | 55 tổ hợp trang × viewport, 0 tràn ngang, 0 lỗi console; cấp PIN thật và link hợp đồng đúng UUID |
| Browser sau build Docker cuối | Thêm 15 tổ hợp cho ví/đội tài xế/tạo phiên, 0 tràn/0 lỗi console; giả lập 503 xác minh lỗi ví và tài xế không hiển thị danh sách trống giả, nút thử lại khôi phục dữ liệu |
| Browser Expo web | Lỗi trường, sai PIN, nhận thành công, mốc DRIVER_ACCEPTED tự tạo, xác nhận lấy hàng → PICKED_UP; 360/390/768 px không tràn, 0 lỗi console |

Evidence: [web-browser.json](evidence/continuation/web-browser.json), [web-final-browser.json](evidence/continuation/web-final-browser.json), [driver-browser.json](evidence/continuation/driver-browser.json), [ảnh app đã nhận/lấy hàng](evidence/continuation/driver-claimed-trip-390.png). Đây là dữ liệu kiểm thử riêng, không phải dữ liệu khách hàng.

## Giới hạn và vận hành

- Android/iOS native chưa chạy trên thiết bị. Expo web không chứng minh camera, quyền vị trí, secure storage và bàn phím native hoạt động.
- V20 không tự liên kết dữ liệu cũ. Chỉ chuyến WAITING_PICKUP được cấp PIN lại; không đổi quyền theo số điện thoại hoặc UUID hồ sơ.
- Các màn admin khác và trang public/auth vẫn theo phạm vi một phần của đợt trước; cài đặt chỉ cải tiến nội dung. Các lỗi quyền đấu giá/đăng ký ADMIN và ảnh S3 403 vẫn được ghi riêng trong progress.md.
- Sửa build context Compose web thành `../../fe/backhaulbid-web-portal` để build đúng repo hiện tại. Contract-service và web được build lại, không khởi động lại các service phụ thuộc.
- Đã dọn 5 chuyến, 1 hợp đồng, 1 hồ sơ tài xế, 1 phương tiện, 4 tài khoản và các ví trống do đợt kiểm thử này tạo; giữ nguyên các seed và dữ liệu kiểm thử từ đợt trước. Manifest [cleanup.json](evidence/continuation/cleanup.json). File tạm chứa tài khoản/token/PIN đã xóa; ảnh và JSON evidence không chứa token hoặc PIN.
- Container gateway, contract-service và web-portal chạy healthy; các server dev/Expo tạm đã dừng. Mọi thay đổi vẫn chưa commit.

Giữ các nhánh và thay đổi chưa commit hiện có. Lỗi quyền ngoài phạm vi sẽ được ghi riêng; không đổi luật đấu giá/tài chính trong milestone PIN.

## Bổ sung: kiểm tra đội xe khi phân công (2026-10-06)

- `TripService.assignDriver` gọi `FleetDriverClient` sau khi xác minh quyền xem chuyến và trạng thái WAITING_PICKUP, trước mọi thay đổi driver/PIN/account. Carrier lấy từ dữ liệu chuyến trên server; Admin cũng phải chọn hồ sơ thuộc carrier của chuyến.
- Dùng API fleet hiện có `GET /api/v1/drivers/carrier/{carrierId}` được truy vấn theo carrier trong DB. Chỉ đọc ID/status; không tin carrierId do client gửi, không sửa schema hay cấp quyền API mới.
- Không thuộc đội xe hoặc UUID không tồn tại: 403. Hồ sơ thuộc đội xe nhưng chưa VERIFIED: 409, thống nhất với bộ lọc của giao diện phân công. Fleet không phản hồi/phản hồi sai hoặc lỗi: 503 và giữ nguyên lần phân công cũ; timeout kết nối 3 giây, đọc 5 giây.
- Chi phí: thêm một lần đọc fleet khi phân công, trong transaction đang khóa chuyến. Đây là kiểm tra tại thời điểm phân công; không phải transaction chung cho hai DB. Nếu sau này có nghiệp vụ chuyển hồ sơ sang đội xe khác, phải thiết kế thu hồi/đồng bộ các chuyến được gán.

| Kiểm tra bổ sung | Kết quả |
|---|---|
| Regression trước sửa | Test chặn UUID hồ sơ không tồn tại thất bại vì API chấp nhận phân công |
| `mvnw.cmd -pl contract-service test` | 72 pass, 0 fail/error/skip |
| HTTP client | Carrier-scoped URL, VERIFIED, ngoài đội xe, PENDING/REJECTED/EXPIRED/unknown, thiếu driver, response sai/trống, HTTP/network lỗi |
| Trip service | Admin dùng carrier của chuyến, từ chối giữ driver/PIN/account, fleet lỗi giữ phân công cũ, carrier khác không gọi fleet |
| Gateway + fleet + PostgreSQL | 9 kiểm tra pass: outside/unknown 403, pending 409, foreign trip 403, đúng đội xe 200, PIN và tài khoản nhận không bị thu hồi khi yêu cầu sai |
| Vận hành | Build/recreate riêng contract-service bằng `--no-deps`; container healthy; không cần migration mới |

Evidence: [assignment-ownership.json](evidence/continuation/assignment-ownership.json), không có token/PIN. Đã dọn 4 tài khoản, 3 hồ sơ và 1 chuyến riêng của đợt thử; không sửa seed cũ. Mọi thay đổi vẫn chưa commit.

## Trạng thái tích hợp eKYC NFC

Luồng QR trên web, quét bằng app Android và xử lý phiên ở identity-service đã được tích hợp ở mức phát triển. Cấu hình hiện bật NFC; VNPT UI/API gửi kết quả và cấu hình token đã được gỡ. Hồ sơ đã lưu vẫn đọc được qua endpoint trạng thái.

Các giới hạn còn lại: chưa xác nhận chip/camera trên thiết bị thật; chưa có CSCA tin cậy mặc định/model release đủ gate production. Kết quả local NFC không được xem là bằng chứng issuer/PAD mức production. Xem các gate chi tiết trong [nfc-ekyc-plan.md](nfc-ekyc-plan.md).

# Tiến độ, ma trận bao phủ và kiểm chứng

Cập nhật: 2026-10-05.

## Ghi chú môi trường

- Nhánh làm việc dựa trên `origin/develop` mới nhất: web portal `feature/ux-redesign-role-mobile`, core-services `feature/complaint-category`, driver-app `feature/driver-trip-execution` (từ `main`). Chưa commit.
- `origin/develop` đã có luồng trao thầu tự động (tạo hợp đồng + chuyến, tối đa 3 nhà xe dự phòng, hạn ký) và xử lý giao trễ; UI mới hiển thị các trạng thái này.
- DB local lệch README infra: tài khoản demo là `0900000000` (ADMIN), `0900000001` (CARRIER), `0900000002` (SHIPPER) với mật khẩu khác README.
- Migration category là **V19** (repo và DB local đã ở V18). DB local chứa V7–V14 từ một nhánh không có trong repo.

## Milestone

| # | Trạng thái | Kiểm chứng thực tế |
|---|---|---|
| M1 Design system, shell, bottom nav | Xong | lint, test, Playwright 5 chiều rộng |
| M2 Complaint Category backend | Xong | 18 test `ComplaintServiceTest`; V19 áp lên PostgreSQL local, 5 khiếu nại cũ giữ `NULL`; API trả 400 cho mã sai, sai vai trò, thiếu category |
| M3 Complaint UI 3 vai trò | Xong | Tạo khiếu nại thật qua UI (lỗi theo trường → tạo → chi tiết → lọc server) |
| M4 Đấu giá | Xong | Phiên PUBLIC thật: tạo → đăng ký + thanh toán → chờ mở → 2 bid (chặn vượt trần, gợi ý bước giá, lượt 3→2→1) → server chốt thắng → chủ hàng thấy người thắng + trao thầu |
| M5 Chuyến web theo vai trò | Xong | Chủ xe ghi mốc + báo sự cố; chủ hàng xác nhận nhận hàng → COMPLETED |
| M6 App Tài xế | Xong luồng PIN; chưa kiểm tra native | V20; gateway/PostgreSQL kiểm tra PIN, quyền, concurrency. Expo web: lỗi trường → PIN sai → nhận thành công → mốc tự động → lấy hàng; export thành công |
| M7 Rà soát | Xong | 110 tổ hợp trang × chiều rộng không tràn/không lỗi console; `next build` thành công; kiểm tra bàn phím |

## Ma trận bao phủ (B)

| Màn hình | Trước | Thay đổi | Trạng thái |
|---|---|---|---|
| Khung ứng dụng | Kính mờ, tìm kiếm/trợ giúp/toàn màn hình giả, chỉ drawer trên mobile | Sidebar phẳng, header có thông báo thật điều hướng theo loại, bottom nav theo vai trò, skip link | Xong |
| Trang chủ Chủ hàng/Chủ xe | Thẻ thống kê gradient | Khối “Việc cần xử lý” từ dữ liệu thật ở đầu trang, thẻ phẳng | Xong |
| Tìm phiên (Chủ xe) | Lọc mã cứng, nhãn sai | Phạm vi, tìm kiếm, loại hàng từ dữ liệu, sắp xếp, trạng thái đăng ký tải dần | Xong |
| Phòng đấu giá | Submit lặp, lượt không giảm | Khóa gửi, idempotency key giữ khi lỗi mạng, gợi ý bước giá, kết quả thắng/thua, bố cục mobile | Xong |
| Phiên của tôi (Chủ xe) | Bảng/thẻ | Nhóm theo việc cần làm, kết quả thắng, hủy đăng ký có cảnh báo phí | Xong |
| Phiên của Chủ hàng | 20 phiên, tab chết, hủy lỗi | Tải đủ trang, tab trạng thái thật, banner việc gấp, hủy có lý do | Xong |
| Chi tiết phiên Chủ hàng | OTP giả | Xác nhận chọn người thắng trung thực, tiến trình trao thầu, bảng xếp hạng giá | Xong |
| Chuyến (Chủ xe/Chủ hàng) | Chỉ xem | Danh sách theo việc, hành động theo vai trò, bằng chứng, giao trễ | Xong |
| Khiếu nại (3 vai trò) | Thiếu Chủ hàng, không phân loại | Màn dùng chung + category + lọc server | Xong |
| App Tài xế | Mẫu Expo, header giả; Account khác DriverProfile | Màn API thật, nhận từng chuyến bằng PIN, quyền theo tài khoản đã nhận | Xong luồng PIN trên Expo web; chưa test native |
| Tạo phiên | CTA trước phần tóm tắt trên mobile, thông báo lưu nháp không đúng | CTA cố định, tóm tắt trước khi xác nhận, khóa gửi lặp, phí dự kiến và trạng thái chưa lưu rõ ràng | Đã cải tiến |
| Hợp đồng | Liên kết theo mã hợp đồng; nút PDF không hoạt động | Thẻ mobile, theo dõi bằng UUID chuyến, chỉ hiện PDF có URL, xác nhận ký trung thực | Đã cải tiến |
| Ví | Bảng rộng trên mobile, lỗi tải dễ bị hiểu là số dư 0 | Giao dịch dạng danh sách mobile, loading/error/retry rõ, nội dung thanh toán dễ hiểu | Đã cải tiến |
| Đội xe/Tài xế | Chọn bảng trên mobile; lỗi tải thành danh sách rỗng | Thẻ mobile, tab cuộn, lỗi/thử lại, trạng thái trống theo bộ lọc | Đã cải tiến |
| Cài đặt | Theme và nội dung mô tả kỹ thuật | Nội dung hướng dẫn theo bước xác minh, bo góc nhất quán | Cải tiến nội dung; chưa tái cấu trúc toàn bộ |
| Admin khác | Theme cũ | Nhận theme/token/PageHeader/card mới | Một phần |
| Trang giới thiệu, đăng nhập, đăng ký | Gradient marketing | Giữ nguyên ngoài theme; chặn tài khoản DRIVER ở web | Một phần |

## Lỗi/khoảng trống ngoài phạm vi (chỉ báo cáo)

- Đã chọn nhận từng chuyến bằng PIN; không triển khai liên kết Account ↔ DriverProfile lâu dài.
- `POST /auth/register` nhận vai trò từ client, kể cả ADMIN.
- `GET /auctions/:id/bids` không kiểm tra chủ hàng sở hữu phiên.
- `POST /auctions/:id/winner` không chặn chọn lại khi đã có người thắng.
- Hủy đăng ký phiên không giới hạn thời điểm ở backend.
- Ảnh S3 trả 403 khi đọc công khai ở local; ảnh seed dùng đường dẫn tương đối.
- Trạng thái khiếu nại REJECTED không có API chuyển tới.

## Đợt tiếp tục theo lựa chọn PIN

- Backend: 55 test pass, không skip/fail; có test transaction và cạnh tranh nhận chuyến.
- Web: lint sạch; 107 pass, 1 skip, 0 fail; build thành công. Đợt browser đầu: 55 tổ hợp ở 360/390/768/1280/1440 px, không tràn ngang, không lỗi console.
- Sau build Docker cuối: thêm 15 tổ hợp cho các màn đã chỉnh tiếp; lỗi/thử lại ví và tài xế qua giả lập 503 hoạt động, không hiển thị dữ liệu rỗng giả. Container web/contract/gateway healthy.
- App: 3 test validation pass; Expo export 11 route thành công; claim/lấy hàng qua gateway trên Expo web, không tràn ở 360/390/768 px, không lỗi console.
- Browser cấp PIN thật từ giao diện Chủ xe và kiểm tra liên kết hợp đồng mở UUID chuyến.
- V20 đã áp trên PostgreSQL local. Chỉ chuyến WAITING_PICKUP có thể được cấp lại PIN; không tự suy ra tài khoản cho dữ liệu cũ.
- Dữ liệu kiểm thử riêng của đợt này đã dọn, giữ nguyên các seed cũ. Báo cáo chi tiết và evidence ở [continuation.md](continuation.md).

## Quyền phân công và khảo sát NFC (2026-10-06)

- Đã bổ sung kiểm tra quyền sở hữu hồ sơ tài xế tại backend: phải nằm trong danh sách fleet của carrier lấy từ chuyến, kể cả khi Admin phân công. Hồ sơ chưa VERIFIED bị chặn; không xác minh được fleet thì trả 503 trước khi sửa chuyến/PIN/tài khoản nhận.
- contract-service: 72 test pass, không fail/error/skip. Kiểm tra gateway và dữ liệu thử riêng được cập nhật trong [continuation.md](continuation.md).
- Đã khảo sát project NFC và viết [kế hoạch QR web → mobile NFC/selfie → backend](nfc-ekyc-plan.md) cho SHIPPER/CARRIER. Native release build thành công; chạy lại thực tế 300 JVM test pass. Chưa tạo SDK, chưa test thẻ thật, chưa chuyển eKYC hiện tại.
- Gate trước thay eKYC: CSCA tin cậy, model release và chất lượng biometric, backend quyết định từ bằng chứng thay boolean client, bridge native và thử thiết bị/thẻ thật.
- Đính chính phạm vi app theo người dùng: một app chung SHIPPER/CARRIER/DRIVER trong repo mobile hiện có, có chuyển ngữ cảnh theo quyền server; tích hợp QR/NFC ở khu vực xác minh của SHIPPER/CARRIER. Kế hoạch đã bỏ đề xuất app xác thực riêng. Checkout hiện tại vẫn DRIVER-only; auth/role context và navigation dùng chung là phần cần hiện thực, chưa được báo cáo là hoàn tất.
- Redesign SDK NFC đã có [kế hoạch chi tiết](../../../../NFC/cccd-bac-android/docs/SDK_REDESIGN_PLAN.md) và [preview tương tác](../../../../NFC/cccd-bac-android/docs/redesign/preview.html): 21 màn/trạng thái, 252 tổ hợp viewport/role và 10 kiểm tra tương tác pass, 0 lỗi console. Chỉ là artifact thiết kế; native UI/library/bridge/backend chưa triển khai. Phát hiện và đưa vào plan: không propagate manifest loại INTERNET hoặc bắt buộc NFC từ sample sang app chung; host minSdk thực tế tăng lên 26 nếu dùng library hiện tại.


# Redesign UI/UX, mobile theo vai trò và phân loại khiếu nại

Tài liệu sống: audit, ma trận vai trò, kế hoạch và tiến độ. Cập nhật sau mỗi milestone.

Phạm vi repo:

| Repo | Nhánh | Nội dung |
|---|---|---|
| `fe/backhaulbid-web-portal` | `feature/ux-redesign-role-mobile` | Web + mobile web cho Chủ hàng, Chủ xe, Admin |
| `fe/backhaulbid-driver-app` | `feature/driver-trip-execution` | App Expo cho Tài xế (thay vì portal web) |
| `be/backhaulbid-core-services` | `feature/complaint-category` | Complaint Category (V19), nhận chuyến bằng PIN (V20) trong contract-service |

Ký hiệu: **[XM]** đã xác minh từ source, **[SL]** suy luận, **[CXM]** chưa xác minh.

## 1. Cơ chế nghiệp vụ đã xác minh

### Đấu giá (bidding-service, NestJS + MongoDB)

- **[XM] Đấu giá ngược.** PUBLIC: bid hợp lệ khi `0 < giá ≤ maxPrice`, thấp hơn bid thấp nhất hiện tại và giảm ít nhất `priceStep` (`bid.service.ts#place`). SEALED: chỉ kiểm tra trần và số lượt.
- **[XM] "Giá hiện tại"** của PUBLIC là bid thấp nhất; khi chưa có bid, giao diện hiển thị giá trần. SEALED không có giá hiện tại công khai.
- **[XM] Giới hạn lượt** `maxBids` theo từng Chủ xe; API list trả `remainingBids`. Không có sửa/rút bid.
- **[XM] Đồng giá:** người thắng PUBLIC là bid thấp nhất, đồng giá thì bid sớm hơn (`sort({bidAmount:1, bidTime:1})`).
- **[XM] Quyền xem bid:** SEALED + CARRIER chỉ thấy bid của mình. Socket SEALED chỉ phát `{sealed:true}`.
- **[XM] Đóng phiên:** trạng thái được đồng bộ khi đọc (`getAndSynchronizeStatus`): PENDING→OPEN khi tới `startTime`, →COMPLETED khi qua `endTime`. PUBLIC tự gán `winningBidId`; SEALED cần chủ hàng/admin gọi `POST /auctions/:id/winner` sau COMPLETED.
- **[XM] Ba trạng thái kết quả:** COMPLETED + `winningBidId` null + SEALED = chờ chọn người thắng; có `winningBidId` = đã xác định; PUBLIC không bid = kết thúc không có người thắng.
- **[XM] Tham gia:** Chủ xe đăng ký với phương tiện, trả phí tham gia và khóa cọc nếu có (`auction-registration.service.ts`). `accessStatus`: REGISTRATION_REQUIRED, REGISTRATION_CLOSED, PAYMENT_INCOMPLETE, REGISTRATION_CANCELLED, WAITING_FOR_START, AUCTION_OPEN, AUCTION_COMPLETED, AUCTION_CANCELLED. Có thử lại thanh toán.
- **[XM] Trao thầu (origin/develop):** khi có người thắng, `auction-award.service.ts` gọi contract-service (`AwardedContractService`) tạo hợp đồng + chuyến; nhà xe ký trước, rồi chủ hàng (`ContractService#sign`); quá hạn ký thì mời tối đa 3 nhà xe dự phòng theo thứ tự giá. `auction.awardStatus`/`awardProgress` phản ánh tiến trình. (Khảo sát ban đầu trên develop cũ không có luồng này.)

### Chuyến (contract-service)

- **[XM] Trạng thái:** WAITING_PICKUP → PICKED_UP → IN_TRANSIT → DELIVERED → COMPLETED; hủy được trước DELIVERED (`TripService#isAllowedTransition`).
- **[XM] Journey event:** CARRIER/ADMIN/DRIVER/SHIPPER. DRIVER không được chuyển sang COMPLETED/CANCELLED. SHIPPER chỉ được `DELIVERY_ACCEPTED` → COMPLETED. `INCIDENT_REPORTED` bắt buộc ghi chú.
- **[XM] Bằng chứng giao hàng:** `POST /trips/:id/delivery-proofs` cho CARRIER/DRIVER/ADMIN, tách biệt với journey event.
- **[XM] Check-in cột mốc:** chỉ DRIVER/ADMIN, geo-fence ≤ 2 km.

### Nhận chuyến Tài xế — đã xử lý bằng PIN

- **[XM]** Người dùng chọn nhận từng chuyến bằng PIN ngày 2026-10-05. Không thêm liên kết lâu dài Account ↔ DriverProfile.
- **[XM]** `trip.driverId` giữ ID hồ sơ fleet; `trip.driverAccountId` lưu Account DRIVER nhận đúng PIN. Quyền xem danh sách/chi tiết, journey, bằng chứng, vị trí và check-in dùng ID tài khoản.
- **[XM]** Chủ xe phân công WAITING_PICKUP và gửi UUID chuyến đầy đủ + PIN 6 số. PIN dùng một lần, hạn 24 giờ, khóa sau 5 lần sai. Phân công lại thu hồi quyền tài khoản nhận cũ và cấp PIN mới.
- **[XM]** `POST /api/v1/trips/{tripId}/claim` chỉ nhận DRIVER. Khóa hàng khi claim/assign, lưu tài khoản và mốc DRIVER_ACCEPTED cùng transaction. Nhập sai vẫn commit bộ đếm; API trả nội dung lỗi cho app hướng dẫn.
- **[XM]** Migration **V20**, không sửa V19. Chuyến cũ chưa có account và expiry cần Chủ xe cấp PIN mới.
- Chi tiết và bằng chứng đợt tiếp tục: [continuation.md](continuation.md).

### Khiếu nại (contract-service, JPA + Flyway)

- **[XM]** Bên tạo: SHIPPER hoặc CARRIER thuộc chuyến; bên bị khiếu nại tự xác định là bên còn lại. Gắn với `tripId`.
- **[XM]** Xem: hai bên và ADMIN. Trao đổi: hai bên và ADMIN khi chưa đóng. Quyết định: chỉ ADMIN (`SHIPPER_WIN`, `CARRIER_WIN`, `BOTH`) → RESOLVED.
- **[XM]** Trạng thái REJECTED tồn tại nhưng không có API chuyển sang.
- **[XM]** Có bằng chứng (`evidenceUrl`), hội thoại, SSE `complaint.updated`. List trả toàn bộ, không phân trang.
- **[XM]** Frontend: có màn Chủ xe và Admin, chưa có màn Chủ hàng.

## 2. Taxonomy Complaint Category

Lưu bằng enum Java + cột `VARCHAR(40)` có CHECK; mã ổn định, nhãn chỉ ở frontend. Không dùng sub-category vì mỗi nhóm đã đủ hẹp để Admin xử lý và chưa có quy trình phân tuyến nào cần mức thứ hai. Category độc lập với trạng thái xử lý và quyết định.

| Mã | Nhãn | Ai được chọn | Ý nghĩa / ví dụ |
|---|---|---|---|
| `CARGO_DAMAGE_LOSS` | Hàng hư hỏng, thất lạc, thiếu | Chủ hàng | Hàng vỡ, ướt, thiếu kiện khi nhận |
| `CARGO_INFO_MISMATCH` | Hàng thực tế khác thông tin đăng | Chủ xe | Sai khối lượng, loại hàng, kích thước so với phiên |
| `SCHEDULE_DELAY` | Trễ lịch lấy/giao hàng | Cả hai | Xe đến trễ; kho chậm bốc/nhận hàng |
| `VEHICLE_DRIVER_ISSUE` | Phương tiện hoặc tài xế không đúng yêu cầu | Chủ hàng | Sai loại xe, nhiệt độ, tài xế khác người được phân công |
| `DELIVERY_CONFIRMATION` | Tranh chấp xác nhận giao/nhận | Cả hai | Bằng chứng giao hàng sai, từ chối xác nhận |
| `PAYMENT_DEPOSIT` | Thanh toán, đặt cọc, bồi thường | Cả hai | Khấu trừ cọc, phí, bồi thường chưa đúng |
| `CANCELLATION` | Hủy chuyến hoặc không thực hiện | Cả hai | Bên kia hủy hoặc bỏ chuyến |
| `CONDUCT` | Thái độ, ứng xử | Cả hai | Ứng xử không phù hợp khi giao nhận |
| `OTHER` | Khác | Cả hai | Không thuộc nhóm trên |

Quy tắc: bắt buộc khi tạo mới; server từ chối mã không hợp lệ hoặc không áp dụng cho vai trò người gửi (400). Bản ghi cũ giữ `NULL` và hiển thị "Chưa phân loại"; không tự gán. Filter `GET /complaints?category=<mã>|UNCATEGORIZED` chạy phía server trên toàn bộ tập được phép.

## 3. Ma trận Role–Flow–Screen (A)

| Vai trò | Nghiệp vụ | Route/màn hình | Hành động | Điều kiện/quyền | Source |
|---|---|---|---|---|---|
| Chủ hàng | Tạo phiên | `/shipper/bidding/create` | Tạo phiên, giữ phí tạo | SHIPPER, ví đủ phí | `auction.controller.ts#create` |
| Chủ hàng | Quản lý phiên | `/shipper/bidding/sessions` | Xem, lọc, hủy | Chủ phiên; hủy khi PENDING/OPEN | `#list`, `#cancel` |
| Chủ hàng | Theo dõi bid, chọn thắng | `/shipper/bidding/sessions/[id]` | Xem bid, chọn người thắng SEALED | Sau COMPLETED, chỉ SEALED | `#selectWinner` |
| Chủ hàng | Hợp đồng | `/shipper/contracts` | Xem, ký | Bên hợp đồng | `ContractService#sign` |
| Chủ hàng | Chuyến | `/shipper/tracking` | Theo dõi, xác nhận nhận hàng | DELIVERED → COMPLETED qua DELIVERY_ACCEPTED | `TripService#addJourneyEvent` |
| Chủ hàng | Khiếu nại | `/shipper/complaints` (mới) | Tạo, trao đổi | Bên của chuyến | `ComplaintService` |
| Chủ xe | Tìm phiên, đăng ký | `/carrier/auctions` | Đăng ký, chọn xe, thanh toán | CARRIER, trước hạn đăng ký | `auction-registration` |
| Chủ xe | Phòng đấu giá | `/carrier/auctions/[id]` | Đặt giá | `canEnter` | `bid.service.ts` |
| Chủ xe | Phiên của tôi | `/carrier/my-auctions` | Theo dõi đăng ký, kết quả | CARRIER | `my-registrations` |
| Chủ xe | Chuyến | `/carrier/transports` | Phân công tài xế, cập nhật hành trình, bằng chứng | Chủ xe của chuyến | `TripService` |
| Chủ xe | Đội xe | `/carrier/vehicles`, `/carrier/drivers` | CRUD | CARRIER | fleet-service |
| Chủ xe | Khiếu nại | `/carrier/complaints` | Tạo, trao đổi | Bên của chuyến | `ComplaintService` |
| Admin | Khiếu nại | `/admin/complaints` | Lọc, trao đổi, chốt | ADMIN | `ComplaintService#resolve` |
| Tài xế | Chuyến được giao | driver-app `/(tabs)` | Xem, cập nhật hành trình, bằng chứng, sự cố, check-in | `driverId == accountId` (blocker ở trên) | `TripService`, `MilestoneService` |

## 4. Audit UX (rút gọn, theo ưu tiên)

| Màn hình/flow | Vấn đề | Ảnh hưởng | Giải pháp | Ưu tiên |
|---|---|---|---|---|
| Chọn người thắng (Chủ hàng) | Hộp "OTP" giả chấp nhận mọi 6 số | Người dùng tin có bảo mật không tồn tại | Hộp xác nhận trung thực | P0 |
| Hủy phiên (Chủ hàng) | Gọi route Next không tồn tại | Hủy luôn lỗi | Gọi gateway kèm lý do | P0 |
| Danh sách phiên Chủ hàng | Chỉ 20 phiên, tab "Đã chốt/Đang vận chuyển" không bao giờ có dữ liệu | Mất phiên, tab chết | Phân trang server, tab theo trạng thái thật + "Cần chọn người thắng" | P0 |
| Phòng đấu giá | Không chặn submit lặp; lượt còn lại không giảm; bước giá không hiển thị | Bid trùng, thông tin sai | Khóa khi gửi, cập nhật lượt, kiểm tra bước giá | P0 |
| Phòng đấu giá | Không báo thắng/thua sau khi kết thúc | Không biết bước tiếp | Trạng thái kết quả theo `winningBidId` | P1 |
| Danh sách phiên Chủ xe | Lọc loại hàng dùng mã cứng; nhãn "Khởi điểm" sai | Lọc vô dụng, hiểu sai giá | Lọc theo dữ liệu thật, nhãn "Giá trần" | P1 |
| Chuyến | Không có thao tác nào trên UI | Không thể vận hành chuyến | Panel hành động theo vai trò | P0 |
| Danh sách chuyến | Lỗi tải bị nuốt thành rỗng | Báo sai "chưa có chuyến" | Hiển thị lỗi thật | P1 |
| Khiếu nại | Không có màn Chủ hàng, không có phân loại | Chủ hàng không khiếu nại được | Màn dùng chung + category | P0 |
| Khung ứng dụng | Nền gradient, glass, ô tìm kiếm không hoạt động, nút trợ giúp/toàn màn hình vô nghĩa | Nhiễu, hứa hẹn sai | Shell phẳng, bỏ control giả | P1 |
| Mobile | Chỉ drawer; không điều hướng theo nhiệm vụ | Thao tác một tay khó | Bottom nav theo vai trò, CTA cố định | P0 |
| Thông báo | Bấm thông báo của Chủ hàng luôn về danh sách phiên | Lạc điểm đến | Điều hướng theo `type`/`referenceId` | P2 |
| Lỗi | Chuỗi lỗi ví bị lỗi mã hóa; lỗi bid chưa dịch | Khó hiểu | Sửa chuỗi, thêm bản dịch | P1 |

## 5. Design direction

"Bảng điều độ vận tải": nền trung tính lạnh, mực đậm, một màu nhấn xanh biển `#1B4965` (giữ nhận diện), màu trạng thái có biểu tượng + chữ. Tuyến đường (điểm đi → điểm đến), thời gian, giá và hành động kế tiếp luôn là lớp thông tin đầu tiên. Số tiền dùng chữ số đều (`tabular-nums`). Bỏ gradient, glass, bóng đổ dày; viền 1px, bo góc 8–12px. Tiếng Việt, VND, `vi-VN`.

Token và component nền đặt ở `src/theme/theme.jsx`, `src/app/globals.css`, `src/components/ui/*`, nhãn trạng thái ở `src/lib/statusMeta.js`.

## 6. Kế hoạch milestone

| # | Mục tiêu | File chính | Kiểm chứng |
|---|---|---|---|
| M1 | Design system + shell + bottom nav theo vai trò | theme, globals.css, `components/ui`, `components/layout`, `navigation/*` | build, xem 360–1440px |
| M2 | Complaint Category backend | contract-service enum, DTO, service, V19 migration, test | `mvnw -pl contract-service test` |
| M3 | Complaint UI Chủ hàng/Chủ xe/Admin | `components/complaints/*`, routes | node test, browser |
| M4 | Đấu giá Chủ xe + Chủ hàng | `components/carrier/auction-detail/*`, `components/shipper/*` | node test, browser |
| M5 | Chuyến: hành động theo vai trò web | `components/tracking/*`, transports, tracking | browser |
| M6 | App Tài xế (Expo) | driver-app | `expo export -p web`, browser |
| M7 | Rà soát toàn bộ, kiểm tra viewport, báo cáo | — | lint, test, build |

## 7. Ma trận bao phủ màn hình (B)

Cập nhật ở `progress.md`.

## 8. Tiếp tục: quyền phân công và eKYC NFC

Bản sửa quyền phân công kiểm tra DriverProfile thuộc carrier của chuyến ở fleet-service trước khi phát PIN; xem [continuation.md](continuation.md).

Luồng xác minh người đại diện hiện dùng QR trên web và NFC/selfie trong app Android; web, app và identity-service đã có tích hợp ở mức phát triển. VNPT không còn là luồng dự phòng. Các giới hạn thiết bị thật và production trust được ghi trong [nfc-ekyc-plan.md](nfc-ekyc-plan.md).

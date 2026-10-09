# Kế hoạch redesign V3: hướng thiết kế đen trắng cho web và app

Ngày: 06/10/2026. Trạng thái: **đã triển khai, chưa commit** (xem mục 7). Đã chốt: giữ navy `#1B4965` làm màu hành động; dải đảo màu dùng navy đậm `#102F44`. Quy chuẩn thiết kế: [`DESIGN.md`](../../DESIGN.md) (bản giống hệt ở gốc repo app).

## 1. Quyết định

Chọn hướng **Uber** trong bộ awesome-design-md, điều chỉnh cho BackHaulBid:

- Nghiệp vụ gần nhất: vận tải hai phía (người gửi hàng, người có xe), có cả freight, dùng nhiều trên điện thoại.
- Đen trắng tương phản cao đọc tốt ngoài trời và khi tài xế thao tác nhanh; nút viên thuốc 44–56 px hợp ngón tay.
- Một màu hành động duy nhất làm rõ "bấm vào đâu" trên những màn dày số liệu (phòng đấu giá, ví, đội xe).
- Không cần ảnh minh họa mới vẫn đứng được: nhận diện nằm ở viên thuốc đen và dải đen đảo màu.

Điều chỉnh so với bản gốc (đã ghi trong `DESIGN.md`):

| Bản gốc | BackHaulBid | Lý do |
|---|---|---|
| Không có màu trạng thái | Thêm success, warning, danger, info và nền nhạt | Phiên, chuyến, tiền, giao trễ cần trạng thái rõ |
| Font UberMove độc quyền, gợi ý Inter | Be Vietnam Pro | Miễn phí, thiết kế cho dấu tiếng Việt, tránh Inter mặc định |
| `mute #afafaf` cho chữ nhỏ | Chỉ cho placeholder và viền; chữ nhỏ dùng `subtle #757575` | `#afafaf` chỉ 2.2:1, không đạt AA |
| Không nói về bảng dữ liệu | Quy tắc bảng: đầu bảng xám, số căn phải, điện thoại chuyển thành thẻ | Admin và ví có nhiều bảng |
| Minh họa 4:3 là trang trí duy nhất | Không dùng minh họa trong app; thay ảnh Unsplash ở đăng nhập bằng dải đen | Chưa có bộ minh họa riêng; không dùng ảnh stock |

Các hướng đã cân nhắc:

| Hướng | Vì sao không chọn |
|---|---|
| IBM (Carbon) | Rất hợp bảng dữ liệu, nhưng góc vuông và chữ display mảnh tạo cảm giác lạnh, kém thân thiện với tài xế dùng điện thoại |
| Stripe | Nhận diện dựa vào nền gradient lớn cho trang marketing; font Sohne độc quyền; app nội bộ không có chỗ cho gradient |
| Coinbase, Wise | Hợp tài chính cá nhân; Wise dùng chữ 900 và xanh chanh, quá "tiêu dùng" cho sàn B2B |

Đã chốt giữ navy `#1B4965` thay cho đen. Các thành phần "đen" của bản gốc chuyển thành navy (nút, mục chọn) và navy đậm `#102F44` (dải đảo màu). Xám chuyển sang tông lạnh cho hợp navy.

## 2. Hiện trạng (audit theo skill redesign)

| Mục | Hiện trạng | Ảnh hưởng |
|---|---|---|
| Font | Font hệ thống (`Segoe UI`…) cả web và app | Hiển thị khác nhau giữa máy, không có bản sắc |
| Token | Đã có token màu chung ở `src/theme/theme.jsx` và `src/app/globals.css`; app có `constants/theme.js` | Đổi token cập nhật được phần lớn màn đã chuẩn hóa |
| Màu viết thẳng | 786 mã hex trong 60 file; 940 lớp `slate-*`, 246 `emerald-*`, 142 bo `2xl/3xl` | Các màn này không ăn theo token |
| Trang nặng nhất | `carrier/drivers` (1.482 dòng), `carrier/vehicles` (1.671 dòng), `register`, `carrier/dashboard`, `admin/wallets`, `ekyc`, `admin/fleet-verifications` | Cần viết lại phần trình bày |
| Component nặng | `CarrierProfileModal`, `BiddingHistoryListScreen`, `AuctionMonitorView`, `AuctionRegistrationDialog`, `Step3AuctionConfig`, `BidsTable`, `ProfileWalletScreen`, `WalletScreen`, `ShipmentSummaryCard`, `LowestBidCard`, `EmptyRouteDialog`, `EkycModal` | Như trên |
| Ảnh | Đăng nhập và đăng ký dùng ảnh Unsplash | Trái quy tắc "không ảnh stock" |
| Tương tác | Còn 2 chỗ `window.confirm`; nhiều nút chưa có trạng thái nhấn | Thay bằng dialog chuẩn |
| Đã ổn | Skip link, focus, giảm chuyển động, StatusBadge có biểu tượng + chữ, khung trống/lỗi/đang tải | Giữ và đổi sang token mới |

## 3. Phạm vi

- **Web portal:** 48 trang của Chủ hàng, Chủ xe, Admin, đăng nhập/đăng ký; khoảng 105 component.
- **App:** khoảng 30 màn cho Chủ hàng, Chủ xe, Tài xế; bộ component `components/ui`.
- **Không đổi:** nghiệp vụ, API, quyền, luồng trạng thái, nội dung chữ (trừ chỗ sửa cho đúng giọng văn), thư viện (giữ Next.js 16, MUI 5, Tailwind 4, Expo SDK 54).
- **Ngoài phạm vi:** chế độ tối, bộ minh họa riêng, trang marketing mới.

## 4. Giai đoạn và nhiệm vụ

Quy ước: **W** = web portal, **M** = app. Mỗi nhiệm vụ là một thay đổi có thể review riêng; chạy test và chụp màn hình trước khi qua nhiệm vụ sau.

### Giai đoạn 0: Nền tảng (token, font, kiểm soát)

| ID | Việc | File chính | Nghiệm thu |
|---|---|---|---|
| F1 | Đổi token màu, bo góc, bóng theo `DESIGN.md` | W `src/theme/theme.jsx`, `src/app/globals.css` | Tên token cũ vẫn tồn tại (alias) để màn chưa chuyển không vỡ |
| F2 | Nạp Be Vietnam Pro bằng `next/font/google` (subset vietnamese, latin; 400/500/700) | W `src/app/layout.*`, `theme.jsx` | Không thêm dependency; không nháy font khi tải |
| F3 | Override MUI theo `DESIGN.md`: Button viên thuốc, TextField nền xám bo 8, Card phẳng bo 16, Dialog level 2, Table, Tabs, Chip | W `theme.jsx` | Trang chuẩn hóa (ví dụ khiếu nại) hiển thị đúng mà không sửa trang |
| F4 | Token app, font bằng `@expo-google-fonts/be-vietnam-pro` | M `constants/theme.js`, `app/_layout.jsx`, `package.json` | App chạy được trên bản web export và cần build lại APK |
| F5 | Test chặn màu viết thẳng: quét `*.jsx` tìm hex, `slate-`, `emerald-`, `indigo-`; danh sách file được miễn giảm dần | W `src/lib/designTokens.test.js`; M tương tự | Test đỏ khi file mới thêm màu thẳng |

### Giai đoạn 1: Khung ứng dụng

| ID | Việc | File chính | Nghiệm thu |
|---|---|---|---|
| S1 | Thanh bên trắng, mục chọn vạch đen trái; header gọn; thanh tab dưới trên điện thoại | W `components/layout/*`, `navigation/*` | Đúng ở 360, 768, 1280, 1440 px |
| S2 | Trang đăng nhập/đăng ký: bỏ ảnh Unsplash, dùng dải đen bên trái và form nền xám | W `app/(auth)/*` | Không ảnh ngoài; form giữ nguyên logic |
| S3 | Thanh tab và header app theo token mới | M `app/(tabs)/_layout.jsx` | Đúng cho cả ba vai trò |

### Giai đoạn 2: Bộ component dùng chung

| ID | Việc | File chính | Nghiệm thu |
|---|---|---|---|
| C1 | `StatusBadge`, `Panel`, `StateBlocks`, `KeyValueList`, `StickyActionBar`, `ResponsiveDialog` theo token mới | W `components/ui/*` | Mọi màn đang dùng tự đổi |
| C2 | `RouteLine` thành thẻ hành trình (hai hàng xám, ghim tròn/vuông) | W `components/ui/RouteLine.jsx`; M `RouteBlock` | Dùng chung cho thẻ phiên, chuyến, hợp đồng |
| C3 | Bảng dữ liệu chuẩn (đầu bảng, cột số, hover, chuyển thẻ trên điện thoại) | W thành phần mới `components/ui/DataTable.jsx` | Dùng ở Admin, ví |
| C4 | Dải đen (`HighlightPanel`) | W `components/ui`; M `components/ui` | Dùng ở phòng đấu giá, ví, trang chủ |
| C5 | Component app: Button, Card, Tabs, TextField, Sheet, Banner theo token | M `components/ui/*`, `components/Sheet.jsx` | Toàn bộ màn app đổi theo |

### Giai đoạn 3: Màn có dấu ấn

| ID | Màn | Điểm chính |
|---|---|---|
| K1 | Phòng đấu giá (Chủ xe, web + app) | Bảng đặt giá là dải đen: đồng hồ `display-lg`, giá thấp nhất, lượt còn lại, nút trắng |
| K2 | Trang chủ ba vai trò | Việc gấp nhất là dải đen; còn lại là danh sách việc |
| K3 | Theo dõi chuyến | Thẻ hành trình, bản đồ trong thẻ, tiến trình đen trắng, trạng thái màu chỉ ở huy hiệu |
| K4 | Ví | Số dư trên dải đen; giao dịch dùng bảng chuẩn |
| K5 | Tạo phiên | Form nhiều bước với nút lớn bo 16 px; chọn kho dạng thẻ hành trình |

### Giai đoạn 4: Chuyển các màn còn màu cũ

Thứ tự theo số chỗ vi phạm, mỗi dòng một thay đổi:

1. `carrier/vehicles`, `carrier/drivers`: tách phần trình bày thành component nhỏ khi sửa (file trên 1.400 dòng)
2. `carrier/dashboard`, `admin/wallets`, `admin/fleet-verifications`, `ekyc`
3. `CarrierProfileModal`, `BiddingHistoryListScreen`, `AuctionMonitorView`, `AuctionRegistrationDialog`
4. `Step3AuctionConfig` và các bước tạo phiên, `BidsTable`, `ShipmentSummaryCard`, `LowestBidCard`
5. `ProfileWalletScreen`, `WalletScreen`, `EmptyRouteDialog`, `EkycModal`
6. Các trang Admin còn lại; thay 2 chỗ `window.confirm` bằng dialog

Mỗi file chuyển xong thì rút khỏi danh sách miễn giảm của test F5.

### Giai đoạn 5: App

Áp token và component mới cho toàn bộ màn app; ưu tiên màn Tài xế (nút lớn, tương phản cao), sau đó phòng đấu giá, ví, đội xe, các màn còn lại.

### Giai đoạn 6: Kiểm tra và chốt

- Chụp màn hình tự động mọi trang web ở 360, 390, 768, 1280, 1440 px; mọi màn app ở 390 px. Không tràn ngang, không lỗi console.
- Kiểm tra độ tương phản các cặp màu trên màn thật, điều hướng bàn phím, `prefers-reduced-motion`.
- Chạy lại toàn bộ test web, app và các luồng E2E đã có (đấu giá, hợp đồng, theo dõi chuyến, ví, khiếu nại, đội xe).
- Danh sách miễn giảm của test F5 rỗng.

## 5. Thứ tự và phụ thuộc

```
F1–F5  →  S1–S3  →  C1–C5  →  K1–K5  →  Giai đoạn 4 (song song từng file)  →  Giai đoạn 5  →  Giai đoạn 6
```

Giai đoạn 0–2 cho kết quả nhìn thấy ngay trên phần lớn màn vì đã dùng token. Giai đoạn 4 là phần tốn công nhất. Không hẹn ngày cụ thể; ước lượng lại sau Giai đoạn 0 khi biết bao nhiêu màn tự đổi đúng.

## 6. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Mất nhận diện navy hiện tại | Chốt màu `primary` trước F1; đổi chỉ ở token |
| Màu trạng thái lấn át bản đen trắng | Chỉ dùng ở huy hiệu, banner, số tiền; test F5 kiểm soát màu thẳng |
| Màn quá dài (vehicles, drivers) dễ vỡ khi sửa | Tách component, giữ logic, chụp màn hình trước và sau |
| Đổi font làm dài chữ, vỡ bố cục | Chụp so sánh sau F2; Be Vietnam Pro hơi rộng hơn Segoe UI |
| App cần build lại vì font mới | Gộp với lần build APK kế tiếp |
| Nhiều thay đổi chưa commit đang có trong repo | Tạo nhánh riêng cho redesign từ trạng thái hiện tại; mỗi giai đoạn một commit |

## 7. Kết quả triển khai (07/10/2026)

Mọi giai đoạn 0–6 đã làm trên cây làm việc; **chưa commit, chưa tạo nhánh** vì có phiên khác đang sửa cùng repo.

| Giai đoạn | Đã làm |
|---|---|
| 0 | Token màu, bán kính, bóng trong `theme.jsx` và `globals.css`; font Be Vietnam Pro 400/500/600/700 qua `next/font`; test chặn màu thẳng `designTokens.test.js`, baseline hiện **0 file** |
| 1 | Sidebar (vạch navy bên trái ở mục đang chọn), thanh điều hướng dưới, `AuthShell` cho đăng nhập/đăng ký/quên mật khẩu, trang chủ công khai viết lại chỉ với nội dung đúng (bỏ số liệu bịa, ảnh stock, gradient) |
| 2 | Nút pill, ô nhập dạng filled có nhãn bên trong, chip, `StatusBadge`, `Panel`, `StateBlocks`, `RouteLine`; thêm `HighlightPanel`, `DataTable`, `ConfirmDialog` |
| 3 | Phòng đấu giá nhà xe, "Việc cần xử lý", ví, hồ sơ nhà xe dùng dải navy `#102F44` |
| 4 | Codemod 68 file (2.381 chỗ), sửa tay phần còn lại; xóa các component không còn dùng (khôi phục được từ git); thay 2 chỗ `window.confirm` bằng `ConfirmDialog`; nhãn tiếng Việt cho loại xe (`getVehicleTypeLabel`) và trạng thái xe `INACTIVE` |
| 5 | App: token, font Be Vietnam Pro (mỗi độ đậm một `fontFamily` vì Android bỏ qua `fontWeight` với font tự nạp), component pill/filled, `Band` trên trang chủ chủ hàng/nhà xe/tài xế, ví, phòng đấu giá |
| 6 | Kiểm tra bên dưới |

**Kết quả kiểm tra (đã chạy thật):**

- Test web 125/125, test app 70/70; ESLint sạch trên các file đã sửa; Expo web export build được.
- Quét 41 trang web × 360/768/1440 px: không tràn ngang. Lỗi console duy nhất là CORS `actuator/health` ở `/admin/settings`, có từ trước.
- Độ tương phản đo trên màn thật: web 53 trang ở 1280 px, app 27 màn (3 vai trò): 0 cặp dưới ngưỡng WCAG AA.
- Bàn phím: link "Bỏ qua điều hướng" đưa tới `#main-content`; ô nhập/chọn khi focus có viền navy 2 px nền trắng; dialog giữ focus bên trong, Esc đóng và trả focus về nút mở. `prefers-reduced-motion` đưa transition về ~0.
- E2E trên app (Expo web, dịch vụ thật): tạo phiên qua form → hủy; CRUD sổ địa chỉ; rút/nạp ví (tới trang SePay sandbox); khiếu nại; tạo xe kèm giấy tờ; đấu giá công khai đầy đủ (đăng ký, đặt giá, thắng, hai bên ký, phân công tài xế); tài xế nhận chuyến bằng PIN (PIN sai bị chặn) và ghi mốc "đã đến điểm lấy hàng". Dữ liệu kiểm thử đã dọn: yêu cầu rút 20.000 ₫ bị từ chối, xe `51C-73871` đã vô hiệu hóa.

**Còn lại:**

- Build lại APK để có font mới (bản Expo web đã có).
- Dữ liệu cũ "TEST Admin…" trong DB bị lỗi mã hóa (`?? N?ng`); là dữ liệu, không phải giao diện.
- Ở 360 px nhãn "Việc cần làm" trên thanh điều hướng dưới bị cắt bằng dấu "…".
- Commit theo từng giai đoạn trên nhánh riêng khi không còn phiên khác sửa song song.


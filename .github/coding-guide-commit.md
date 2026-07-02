# 🚀 Hướng dẫn Quy trình Git & Conventional Commits

Tài liệu này quy định quy trình làm việc với Git, cách đặt tên nhánh, và tiêu chuẩn tạo commit (Conventional Commits) cho dự án.

## 🚀 Quy trình làm việc với Git & Đẩy code lên Github

Khi có tính năng mới, sửa lỗi hoặc thực hiện bất kỳ thay đổi nào, hãy tuân thủ quy trình sau:

### Bước 1: Tạo nhánh làm việc mới
Tuyệt đối không làm việc trực tiếp trên nhánh `main` hoặc `dev`. Luôn tạo branch mới từ nhánh `dev` theo định dạng: `<type>/<tên-nhánh>`. Trong đó `<type>` tương tự như chuẩn commit (ví dụ: `feature` cho tính năng mới, `fix` cho sửa lỗi).
- Ví dụ: `feature/login-screen`, `fix/header-bug`, `refactor/api-auth`.

### Bước 2: Commit code theo chuẩn Conventional Commits
- Khi commit code lên Github, cần tạo message theo đúng chuẩn Conventional Commits như sau:

### 1. Cấu trúc chuẩn (1 dòng duy nhất)

```text
<type>[scope]: <mô tả ngắn gọn>
```

*Lưu ý: Bắt buộc phải có một khoảng trắng (dấu cách) sau dấu hai chấm `: `.*

---

### 2. Các từ khóa `<type>` cốt lõi (Nên dùng 6 loại này)

Để đơn giản nhất, bạn chỉ cần yêu cầu nhóm nhớ 6 từ khóa sau:

* **`feat`**: Thêm tính năng mới hoặc giao diện mới.
* **`fix`**: Sửa một lỗi (bug).
* **`refactor`**: Cải thiện, sắp xếp lại code (không thêm tính năng, không sửa lỗi).
* **`style`**: Chỉnh sửa liên quan đến format code, UI/CSS (khoảng trắng, dấu phẩy, đổi màu...).
* **`docs`**: Cập nhật tài liệu (như file README.md).
* **`chore`**: Các công việc lặt vặt như cập nhật thư viện, cấu hình build, sửa file `.gitignore`...

Phần `[scope]` (phạm vi) nằm trong ngoặc đơn là **tùy chọn**, dùng để nói rõ file hoặc module nào đang được sửa (ví dụ: `auth`, `ui`, `components`, `api`).

---

### 3. Ví dụ thực tế cho nhóm

* **Thêm tính năng:**
`feat(ui): thêm màn hình danh sách thiết bị`
* **Sửa lỗi:**
`fix(auth): sửa lỗi ứng dụng bị crash khi đăng nhập sai token`
* **Refactor code:**
`refactor(components): tách logic xử lý API ra khỏi màn hình chính`
* **Cập nhật cấu hình (Chore):**
`chore: cập nhật thư viện expo và react-native`
* **Sửa giao diện/Format:**
`style(header): canh giữa lại tiêu đề và đổi màu nền`

---

### 4. Ba quy tắc "bất di bất dịch"

Để nhìn danh sách commit gọn gàng, hãy dặn nhóm tuân thủ đúng 3 điều này:

1. **Viết thường toàn bộ phần đầu:** Các từ khóa như `feat`, `fix` và `scope` phải viết chữ thường.
2. **Mô tả bắt đầu bằng động từ:** (Ví dụ: *thêm*, *sửa*, *xóa*, *cập nhật*...). Viết chữ thường ở đầu câu và **không** để dấu chấm ở cuối câu.
3. **Không quá 72 ký tự:** Chỉ tóm tắt ý chính nhất của lần commit đó.

### Bước 3: Đẩy code và Tạo Pull Request
- Sau khi hoàn thành code và commit, hãy đẩy nhánh (push branch) lên Github.
- Tạo một Pull Request (PR) trỏ vào nhánh `dev`.
- Khi tạo pull request, hãy tóm tắt những việc mình đã làm, sau đó có thể dùng AI Gen cùng với file `.github/pull-request-template.md` (nếu có) để tạo nội dung chi tiết cho PR.
- **Lưu ý:** Tuyệt đối không tạo PR hoặc trực tiếp push code vào nhánh `main`.

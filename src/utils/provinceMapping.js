// Bảng ánh xạ 63 tỉnh, thành phố trước sáp nhập sang 34 đơn vị sau sáp nhập.
// Căn cứ: Nghị quyết 202/2025/QH15, áp dụng từ 01/07/2025. Đối chiếu bằng phường/xã của provinces.open-api.vn (v2):
// mỗi tỉnh cũ chỉ đổ vào đúng một đơn vị mới. Xem docs/administrative/BANG_ANH_XA_TINH.md.
// legacy: nhãn cũ của ứng dụng. aliases: tên khác của cùng đơn vị (chính tả hoặc tên API cũ).

export const PRE_MERGER_PROVINCES = [
  { legacy: "An Giang", current: "An Giang", relation: "giữ nguyên", aliases: [] },
  { legacy: "Bà Rịa - Vũng Tàu", current: "Hồ Chí Minh", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bạc Liêu", current: "Cà Mau", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bắc Giang", current: "Bắc Ninh", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bắc Kạn", current: "Thái Nguyên", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bắc Ninh", current: "Bắc Ninh", relation: "giữ nguyên", aliases: [] },
  { legacy: "Bến Tre", current: "Vĩnh Long", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bình Dương", current: "Hồ Chí Minh", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bình Định", current: "Gia Lai", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bình Phước", current: "Đồng Nai", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Bình Thuận", current: "Lâm Đồng", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Cà Mau", current: "Cà Mau", relation: "giữ nguyên", aliases: [] },
  { legacy: "Cao Bằng", current: "Cao Bằng", relation: "giữ nguyên", aliases: [] },
  { legacy: "Cần Thơ", current: "Cần Thơ", relation: "giữ nguyên", aliases: [] },
  { legacy: "Đà Nẵng", current: "Đà Nẵng", relation: "giữ nguyên", aliases: [] },
  { legacy: "Đắk Lắk", current: "Đắk Lắk", relation: "giữ nguyên", aliases: [] },
  { legacy: "Đắk Nông", current: "Lâm Đồng", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Điện Biên", current: "Điện Biên", relation: "giữ nguyên", aliases: [] },
  { legacy: "Đồng Nai", current: "Đồng Nai", relation: "giữ nguyên", aliases: [] },
  { legacy: "Đồng Tháp", current: "Đồng Tháp", relation: "giữ nguyên", aliases: [] },
  { legacy: "Gia Lai", current: "Gia Lai", relation: "giữ nguyên", aliases: [] },
  { legacy: "Hà Giang", current: "Tuyên Quang", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Hà Nam", current: "Ninh Bình", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Hà Nội", current: "Hà Nội", relation: "giữ nguyên", aliases: [] },
  { legacy: "Hà Tĩnh", current: "Hà Tĩnh", relation: "giữ nguyên", aliases: [] },
  { legacy: "Hải Dương", current: "Hải Phòng", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Hải Phòng", current: "Hải Phòng", relation: "giữ nguyên", aliases: [] },
  { legacy: "Hậu Giang", current: "Cần Thơ", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Hòa Bình", current: "Phú Thọ", relation: "sáp nhập vào", aliases: ["Hoà Bình"] },
  { legacy: "Hưng Yên", current: "Hưng Yên", relation: "giữ nguyên", aliases: [] },
  { legacy: "Khánh Hòa", current: "Khánh Hòa", relation: "giữ nguyên", aliases: [] },
  { legacy: "Kiên Giang", current: "An Giang", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Kon Tum", current: "Quảng Ngãi", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Lai Châu", current: "Lai Châu", relation: "giữ nguyên", aliases: [] },
  { legacy: "Lạng Sơn", current: "Lạng Sơn", relation: "giữ nguyên", aliases: [] },
  { legacy: "Lào Cai", current: "Lào Cai", relation: "giữ nguyên", aliases: [] },
  { legacy: "Lâm Đồng", current: "Lâm Đồng", relation: "giữ nguyên", aliases: [] },
  { legacy: "Long An", current: "Tây Ninh", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Nam Định", current: "Ninh Bình", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Nghệ An", current: "Nghệ An", relation: "giữ nguyên", aliases: [] },
  { legacy: "Ninh Bình", current: "Ninh Bình", relation: "giữ nguyên", aliases: [] },
  { legacy: "Ninh Thuận", current: "Khánh Hòa", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Phú Thọ", current: "Phú Thọ", relation: "giữ nguyên", aliases: [] },
  { legacy: "Phú Yên", current: "Đắk Lắk", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Quảng Bình", current: "Quảng Trị", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Quảng Nam", current: "Đà Nẵng", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Quảng Ngãi", current: "Quảng Ngãi", relation: "giữ nguyên", aliases: [] },
  { legacy: "Quảng Ninh", current: "Quảng Ninh", relation: "giữ nguyên", aliases: [] },
  { legacy: "Quảng Trị", current: "Quảng Trị", relation: "giữ nguyên", aliases: [] },
  { legacy: "Sóc Trăng", current: "Cần Thơ", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Sơn La", current: "Sơn La", relation: "giữ nguyên", aliases: [] },
  { legacy: "Tây Ninh", current: "Tây Ninh", relation: "giữ nguyên", aliases: [] },
  { legacy: "Thái Bình", current: "Hưng Yên", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Thái Nguyên", current: "Thái Nguyên", relation: "giữ nguyên", aliases: [] },
  { legacy: "Thanh Hóa", current: "Thanh Hóa", relation: "giữ nguyên", aliases: [] },
  { legacy: "Thừa Thiên Huế", current: "Huế", relation: "đổi tên", aliases: ["Huế", "Thành phố Huế"] },
  { legacy: "Tiền Giang", current: "Đồng Tháp", relation: "sáp nhập vào", aliases: [] },
  { legacy: "TP. Hồ Chí Minh", current: "Hồ Chí Minh", relation: "đổi tên", aliases: ["Hồ Chí Minh", "Thành phố Hồ Chí Minh"] },
  { legacy: "Trà Vinh", current: "Vĩnh Long", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Tuyên Quang", current: "Tuyên Quang", relation: "giữ nguyên", aliases: [] },
  { legacy: "Vĩnh Long", current: "Vĩnh Long", relation: "giữ nguyên", aliases: [] },
  { legacy: "Vĩnh Phúc", current: "Phú Thọ", relation: "sáp nhập vào", aliases: [] },
  { legacy: "Yên Bái", current: "Lào Cai", relation: "sáp nhập vào", aliases: [] },
];

const LOOKUP = new Map();
for (const row of PRE_MERGER_PROVINCES) {
  LOOKUP.set(row.legacy, row.current);
  for (const alias of row.aliases) LOOKUP.set(alias, row.current);
}

/**
 * Đơn vị hiện hành của một tên tỉnh cũ hoặc alias. Tên không có trong bảng được trả về nguyên văn,
 * nên dữ liệu đã lưu vẫn đọc và hiển thị được. Hàm này không ghi lại dữ liệu nào.
 */
export function toCurrentProvinceName(name) {
  if (typeof name !== 'string') return name;
  const trimmed = name.trim();
  return LOOKUP.get(trimmed) ?? trimmed;
}

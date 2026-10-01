// Danh mục các địa điểm logistics, cảng biển, KCN và trung tâm hàng hóa phổ biến tại Việt Nam
// Dùng cho Autocomplete tìm kiếm nhanh kiểu Grab / Google Maps
import { VIETNAM_PROVINCES } from "./provinces";

export const VIETNAM_LOGISTICS_HUBS = [
  // ─── CẢNG BIỂN & CẢNG CẠN (ICD) ───
  { name: "Cảng Cát Lái", address: "Đường Nguyễn Thị Định, P. Cát Lái, TP. Thủ Đức, TP. Hồ Chí Minh", lat: 10.7608, lng: 106.7937, category: "Cảng biển" },
  { name: "Cảng Quốc tế Cái Mép (CMIT)", address: "Thị xã Phú Mỹ, Tỉnh Bà Rịa - Vũng Tàu", lat: 10.5361, lng: 107.0253, category: "Cảng nước sâu" },
  { name: "Cảng Hải Phòng (Cảng Hoàng Diệu)", address: "Đường Lê Thánh Tông, Ngô Quyền, Hải Phòng", lat: 20.8656, lng: 106.6917, category: "Cảng biển" },
  { name: "Cảng Lạch Huyện (Hải Phòng)", address: "Huyện Cát Hải, TP. Hải Phòng", lat: 20.8122, lng: 106.8794, category: "Cảng nước sâu" },
  { name: "Cảng Tiên Sa Đà Nẵng", address: "Đường Yết Kiêu, Thọ Quang, Sơn Trà, TP. Đà Nẵng", lat: 16.1264, lng: 108.2197, category: "Cảng biển" },
  { name: "Cảng Quy Nhơn", address: "Đường Phan Chu Trinh, TP. Quy Nhơn, Tỉnh Bình Định", lat: 13.7667, lng: 109.2417, category: "Cảng biển" },
  { name: "Cảng Cần Thơ (Cảng Cái Cui)", address: "Phường Tân Phú, Quận Cái Răng, TP. Cần Thơ", lat: 9.9861, lng: 105.8194, category: "Cảng sông/biển" },
  { name: "Cảng Hiệp Phước", address: "KCN Hiệp Phước, Huyện Nhà Bè, TP. Hồ Chí Minh", lat: 10.6389, lng: 106.7583, category: "Cảng biển" },
  { name: "ICD Phước Long (Thủ Đức)", address: "Xa lộ Hà Nội, P. Phước Long A, TP. Thủ Đức, TP. HCM", lat: 10.8258, lng: 106.7628, category: "Cảng cạn ICD" },
  { name: "ICD Sóng Thần", address: "KCN Sóng Thần 1, Dĩ An, Tỉnh Bình Dương", lat: 10.9017, lng: 106.7456, category: "Cảng cạn ICD" },
  { name: "ICD Tân Cảng Long Bình", address: "Phường Long Bình, TP. Biên Hòa, Tỉnh Đồng Nai", lat: 10.9167, lng: 106.8833, category: "Cảng cạn ICD" },
  { name: "ICD Tiên Sơn (Bắc Ninh)", address: "KCN Tiên Sơn, Thị xã Từ Sơn, Tỉnh Bắc Ninh", lat: 21.1417, lng: 105.9861, category: "Cảng cạn ICD" },

  // ─── KHU CÔNG NGHIỆP TRỌNG ĐIỂM (MIỀN NAM) ───
  { name: "KCN Sóng Thần 1", address: "Dĩ An, Tỉnh Bình Dương", lat: 10.8986, lng: 106.7422, category: "Khu công nghiệp" },
  { name: "KCN Sóng Thần 2", address: "Dĩ An, Tỉnh Bình Dương", lat: 10.9153, lng: 106.7389, category: "Khu công nghiệp" },
  { name: "KCN VSIP 1 (Bình Dương)", address: "TP. Thuận An, Tỉnh Bình Dương", lat: 10.9389, lng: 106.7028, category: "Khu công nghiệp" },
  { name: "KCN VSIP 2 (Bình Dương)", address: "Thành phố Mới Bình Dương, Tỉnh Bình Dương", lat: 11.0833, lng: 106.6833, category: "Khu công nghiệp" },
  { name: "KCN Mỹ Phước 1, 2, 3", address: "Thị xã Bến Cát, Tỉnh Bình Dương", lat: 11.1611, lng: 106.6083, category: "Khu công nghiệp" },
  { name: "KCN Tân Bình", address: "Quận Tân Phú & Bình Tân, TP. Hồ Chí Minh", lat: 10.8167, lng: 106.6167, category: "Khu công nghiệp" },
  { name: "KCN Tân Tạo", address: "Phường Tân Tạo, Quận Bình Tân, TP. Hồ Chí Minh", lat: 10.7583, lng: 106.5861, category: "Khu công nghiệp" },
  { name: "Khu Công Nghệ Cao (SHTP)", address: "TP. Thủ Đức, TP. Hồ Chí Minh", lat: 10.8528, lng: 106.7889, category: "Khu công nghệ cao" },
  { name: "KCN Biên Hòa 1, 2", address: "TP. Biên Hòa, Tỉnh Đồng Nai", lat: 10.9333, lng: 106.8500, category: "Khu công nghiệp" },
  { name: "KCN Amata Đồng Nai", address: "TP. Biên Hòa, Tỉnh Đồng Nai", lat: 10.9583, lng: 106.8833, category: "Khu công nghiệp" },
  { name: "KCN Long Thành", address: "Huyện Long Thành, Tỉnh Đồng Nai", lat: 10.7722, lng: 106.9444, category: "Khu công nghiệp" },
  { name: "KCN Nhơn Trạch 1, 2, 3", address: "Huyện Nhơn Trạch, Tỉnh Đồng Nai", lat: 10.7083, lng: 106.9167, category: "Khu công nghiệp" },
  { name: "KCN Long Hậu", address: "Huyện Cần Giuộc, Tỉnh Long An", lat: 10.6333, lng: 106.7333, category: "Khu công nghiệp" },
  { name: "KCN Thuận Đạo", address: "Huyện Bến Lức, Tỉnh Long An", lat: 10.6417, lng: 106.4917, category: "Khu công nghiệp" },
  { name: "KCN Trảng Bàng", address: "Thị xã Trảng Bàng, Tỉnh Tây Ninh", lat: 11.0333, lng: 106.3500, category: "Khu công nghiệp" },

  // ─── KHU CÔNG NGHIỆP TRỌNG ĐIỂM (MIỀN BẮC & MIỀN TRUNG) ───
  { name: "KCN Thăng Long (Hà Nội)", address: "Huyện Đông Anh, TP. Hà Nội", lat: 21.1278, lng: 105.7722, category: "Khu công nghiệp" },
  { name: "KCN Quang Minh", address: "Huyện Mê Linh, TP. Hà Nội", lat: 21.1917, lng: 105.7583, category: "Khu công nghiệp" },
  { name: "KCN Yên Phong (Bắc Ninh)", address: "Huyện Yên Phong, Tỉnh Bắc Ninh", lat: 21.2167, lng: 106.0167, category: "Khu công nghiệp" },
  { name: "KCN Quế Võ (Bắc Ninh)", address: "Huyện Quế Võ, Tỉnh Bắc Ninh", lat: 21.1667, lng: 106.1333, category: "Khu công nghiệp" },
  { name: "KCN VSIP Bắc Ninh", address: "Thị xã Từ Sơn, Tỉnh Bắc Ninh", lat: 21.1167, lng: 105.9667, category: "Khu công nghiệp" },
  { name: "KCN Quang Châu (Bắc Giang)", address: "Huyện Việt Yên, Tỉnh Bắc Giang", lat: 21.2194, lng: 106.1250, category: "Khu công nghiệp" },
  { name: "KCN Đình Trám (Bắc Giang)", address: "Huyện Việt Yên, Tỉnh Bắc Giang", lat: 21.2583, lng: 106.1083, category: "Khu công nghiệp" },
  { name: "KCN Phố Nối A (Hưng Yên)", address: "Huyện Mỹ Hào, Tỉnh Hưng Yên", lat: 20.9333, lng: 106.0167, category: "Khu công nghiệp" },
  { name: "KCN Nomura Hải Phòng", address: "Huyện An Dương, TP. Hải Phòng", lat: 20.8833, lng: 106.6000, category: "Khu công nghiệp" },
  { name: "KCN Đình Vũ (Hải Phòng)", address: "Quận Hải An, TP. Hải Phòng", lat: 20.8333, lng: 106.7667, category: "Khu công nghiệp" },
  { name: "KCN Hòa Khánh (Đà Nẵng)", address: "Quận Liên Chiểu, TP. Đà Nẵng", lat: 16.0778, lng: 108.1389, category: "Khu công nghiệp" },
  { name: "KCN Chu Lai (Quảng Nam)", address: "Huyện Núi Thành, Tỉnh Quảng Nam", lat: 15.4167, lng: 108.6833, category: "Khu công nghiệp" },
  { name: "KCN Dung Quất (Quảng Ngãi)", address: "Huyện Bình Sơn, Tỉnh Quảng Ngãi", lat: 15.2833, lng: 108.7667, category: "Khu công nghiệp" },
  { name: "KCN VSIP Nghệ An", address: "Huyện Hưng Nguyên, Tỉnh Nghệ An", lat: 18.6667, lng: 105.6167, category: "Khu công nghiệp" },

  // ─── CHỢ ĐẦU MỐI & TRUNG TÂM LOGISTICS ───
  { name: "Chợ Đầu Mối Nông Sản Thủ Đức", address: "Quốc lộ 1A, P. Tam Bình, TP. Thủ Đức, TP. HCM", lat: 10.8667, lng: 106.7333, category: "Chợ đầu mối" },
  { name: "Chợ Đầu Mối Hóc Môn", address: "Đường Nguyễn Thị Sóc, Bà Điểm, Hóc Môn, TP. HCM", lat: 10.8417, lng: 106.6083, category: "Chợ đầu mối" },
  { name: "Chợ Đầu Mối Bình Điền", address: "Đại lộ Nguyễn Văn Linh, P. 7, Quận 8, TP. HCM", lat: 10.6972, lng: 106.6361, category: "Chợ đầu mối" },
  { name: "Sân bay Quốc tế Tân Sơn Nhất", address: "Quận Tân Bình, TP. Hồ Chí Minh", lat: 10.8188, lng: 106.6519, category: "Sân bay hàng hóa" },
  { name: "Sân bay Quốc tế Nội Bài", address: "Huyện Sóc Sơn, TP. Hà Nội", lat: 21.2212, lng: 105.8072, category: "Sân bay hàng hóa" },
];

// Chuyển chuỗi tiếng Việt có dấu thành không dấu để tìm kiếm thông minh
export function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Tìm kiếm địa điểm nhanh offline + online
 * Trả về danh sách địa điểm theo định dạng gợi ý của Grab
 */
export async function searchPlacesLikeGrab(query) {
  if (!query || typeof query !== "string" || !query.trim()) return [];
  const cleanQuery = query.trim();
  const normQuery = removeVietnameseTones(cleanQuery);

  const matchedLocal = [];

  // 1. Tìm trong danh mục Hubs / KCN / Cảng
  for (const hub of VIETNAM_LOGISTICS_HUBS) {
    const normName = removeVietnameseTones(hub.name);
    const normAddr = removeVietnameseTones(hub.address);
    if (normName.includes(normQuery) || normAddr.includes(normQuery)) {
      matchedLocal.push({
        title: hub.name,
        subtitle: hub.address,
        fullAddress: `${hub.name}, ${hub.address}`,
        lat: hub.lat,
        lng: hub.lng,
        category: hub.category,
      });
    }
  }

  // 2. Tìm trong danh sách 64 Tỉnh/Thành phố
  for (const prov of VIETNAM_PROVINCES) {
    const normProv = removeVietnameseTones(prov.name);
    if (normProv.includes(normQuery)) {
      matchedLocal.push({
        title: prov.name,
        subtitle: `Tỉnh / Thành phố ${prov.name}, Việt Nam`,
        fullAddress: `${prov.name}, Việt Nam`,
        lat: prov.lat,
        lng: prov.lng,
        category: "Tỉnh / Thành phố",
      });
    }
  }

  // 3. Nếu người dùng nhập địa chỉ chi tiết cụ thể (có số nhà, tên đường hoặc query dài),
  // thử tìm kiếm qua OpenStreetMap Nominatim
  if (cleanQuery.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cleanQuery
        )}&countrycodes=vn&limit=5&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            "Accept-Language": "vi,en;q=0.8",
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const onlineItems = list.map((item) => {
            const addr = item.address || {};
            const title =
              addr.road ||
              addr.suburb ||
              addr.industrial ||
              addr.commercial ||
              item.display_name.split(",")[0] ||
              item.display_name;
            const subtitle = item.display_name.replace(/, Việt Nam$/, "");

            return {
              title: title.trim(),
              subtitle: subtitle.trim(),
              fullAddress: subtitle.trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              category: "Địa chỉ chi tiết",
            };
          });

          // Hợp nhất: ưu tiên kết quả tìm kiếm khớp, loại bỏ trùng lặp tọa độ gần nhau
          const allResults = [...matchedLocal, ...onlineItems];
          const unique = [];
          for (const item of allResults) {
            const exists = unique.some(
              (u) =>
                Math.abs(u.lat - item.lat) < 0.005 &&
                Math.abs(u.lng - item.lng) < 0.005
            );
            if (!exists) unique.push(item);
          }
          return unique.slice(0, 8);
        }
      }
    } catch {
      // Offline hoặc timeout -> dùng danh sách nội bộ
    }
  }

  return matchedLocal.slice(0, 8);
}

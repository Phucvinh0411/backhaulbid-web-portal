import { VIETNAM_PROVINCES } from "./provinces";

/**
 * Calculates the Haversine distance in kilometers between two coordinates.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest Vietnamese province from coordinates.
 */
export function findNearestProvince(lat, lng) {
  if (lat == null || lng == null) return null;
  let nearest = null;
  let minDistance = Infinity;

  for (const p of VIETNAM_PROVINCES) {
    const dist = calculateDistanceKm(lat, lng, p.lat, p.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = p;
    }
  }

  return { province: nearest, distanceKm: minDistance };
}

/**
 * Reverse geocodes coordinates into a human-readable Vietnamese address.
 * Tries OpenStreetMap Nominatim first; falls back to the nearest province.
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "vi,en;q=0.8",
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.suburb || addr.industrial || addr.commercial || "";
        const ward = addr.quarter || addr.neighbourhood || addr.village || "";
        const district = addr.city_district || addr.district || addr.county || addr.town || "";
        const city = addr.city || addr.state || addr.province || "";

        const parts = [street, ward, district, city].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(", ");
        }
        if (data.display_name) {
          // Truncate long country suffix
          return data.display_name.replace(/, Việt Nam$/, "");
        }
      }
    }
  } catch {
    // Network or timeout - fallback to local nearest province
  }

  const nearest = findNearestProvince(lat, lng);
  if (nearest && nearest.province) {
    return nearest.distanceKm <= 10
      ? nearest.province.name
      : `Gần ${nearest.province.name}`;
  }

  return `Tọa độ [${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}]`;
}

/**
 * Forward geocodes a search string into coordinates and formatted address.
 * Tries OpenStreetMap Nominatim first, falls back to VIETNAM_PROVINCES match.
 */
export async function searchAddress(query) {
  if (!query || typeof query !== "string" || !query.trim()) return [];
  const trimmed = query.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=vn&limit=5&addressdetails=1`,
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
        return list.map((item) => {
          const addr = item.address || {};
          const street = addr.road || addr.pedestrian || addr.suburb || addr.industrial || "";
          const district = addr.city_district || addr.district || addr.county || "";
          const city = addr.city || addr.state || "";
          const shortParts = [street, district, city].filter(Boolean);
          const shortAddress = shortParts.length > 0 ? shortParts.join(", ") : item.display_name.replace(/, Việt Nam$/, "");

          return {
            label: shortAddress,
            fullLabel: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    }
  } catch {
    // Network / timeout - fallback to local province match
  }

  // Fallback: match against VIETNAM_PROVINCES
  const normQuery = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matched = VIETNAM_PROVINCES.filter((p) => {
    const normName = p.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normName.includes(normQuery);
  });

  return matched.map((p) => ({
    label: p.name,
    fullLabel: `${p.name}, Việt Nam`,
    lat: p.lat,
    lng: p.lng,
  }));
}

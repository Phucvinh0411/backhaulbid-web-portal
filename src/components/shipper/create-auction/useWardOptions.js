import { useEffect, useState } from "react";
import { normalizeWards } from "./wardOptions";

const WARD_API = "https://provinces.open-api.vn/api/v2/p";
const cache = new Map();

/**
 * Wards of one province, loaded from the public administrative API. Only the province code is sent; the text the
 * shipper types is filtered in the browser.
 */
export function useWardOptions(provinceCode) {
  const [state, setState] = useState({ wards: [], loading: false, error: "" });

  useEffect(() => {
    if (!provinceCode) {
      setState({ wards: [], loading: false, error: "" });
      return undefined;
    }
    if (cache.has(provinceCode)) {
      setState({ wards: cache.get(provinceCode), loading: false, error: "" });
      return undefined;
    }
    let ignore = false;
    setState({ wards: [], loading: true, error: "" });
    fetch(`${WARD_API}/${provinceCode}?depth=2`)
      .then((response) => {
        if (!response.ok) throw new Error("ward request failed");
        return response.json();
      })
      .then((data) => {
        const wards = normalizeWards(data);
        cache.set(provinceCode, wards);
        if (!ignore) setState({ wards, loading: false, error: "" });
      })
      .catch(() => {
        if (!ignore) setState({ wards: [], loading: false, error: "Không tải được danh sách phường/xã" });
      });
    return () => {
      ignore = true;
    };
  }, [provinceCode]);

  return state;
}

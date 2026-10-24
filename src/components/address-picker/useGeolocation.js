import { useCallback, useState } from "react";

const OPTIONS = { enableHighAccuracy: true, timeout: 10000 };

/** locate() → Promise<{ latitude, longitude }>, plus a locating flag and a user-facing error message. */
export function useGeolocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const locate = useCallback(() => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const message = "Trình duyệt không hỗ trợ lấy vị trí. Hãy chạm vào bản đồ để đặt ghim.";
      setError(message);
      reject(new Error(message));
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        resolve({ latitude: coords.latitude, longitude: coords.longitude });
      },
      () => {
        const message = "Không lấy được vị trí hiện tại. Hãy cho phép truy cập vị trí hoặc chạm vào bản đồ.";
        setLocating(false);
        setError(message);
        reject(new Error(message));
      },
      OPTIONS,
    );
  }), []);

  return { locate, locating, error };
}

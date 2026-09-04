const REQUIRED_CONFIG_KEYS = [
  "BACKEND_URL",
  "TOKEN_KEY",
  "TOKEN_ID",
  "ACCESS_TOKEN",
];

const MINIMUM_TOKEN_VALIDITY_MS = 5 * 60 * 1000;
const PLACEHOLDER_CONFIG_VALUES = new Set([
  "your_token_key_here",
  "your_token_id_here",
  "your_auth_token_here",
]);

export const VNPT_EKYC_ASSETS = Object.freeze({
  FACE_SDK_SCRIPT: "/lib/VNPTBrowserSDKAppV4.1.0.js",
  WEB_OVAL: "/lib/web-oval.json",
  MOBILE_OVAL: "/lib/mobile-oval.json",
  ENGLISH_TUTORIAL: "/lib/english-tutorial.mp4",
  VIETNAMESE_TUTORIAL: "/lib/vietnamese-tutorial.mp4",
});

export const VNPT_DOCUMENT_FLOW_CONFIG = Object.freeze({
  LIST_TYPE_DOCUMENT: [-1, 9],
  DOCUMENT_TYPE_START: 999,
});

export function normalizeVnptAccessToken(accessToken) {
  if (typeof accessToken !== "string") return "";

  return accessToken.trim().replace(/^(Bearer\s+)+/i, "").trim();
}

export function getVnptEkycConfigMessage(validation) {
  if (
    validation?.code === "missing_config" &&
    validation.missingKeys?.includes("ACCESS_TOKEN")
  ) {
    return "Chưa có access token VNPT eKYC. Hãy thêm NEXT_PUBLIC_VNPT_EKYC_AUTH vào cấu hình rồi khởi động lại frontend.";
  }

  if (validation?.code === "missing_config") {
    const configFields = {
      BACKEND_URL: {
        label: "địa chỉ kết nối VNPT",
        env: "NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL",
      },
      TOKEN_KEY: {
        label: "token key VNPT",
        env: "NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY",
      },
      TOKEN_ID: {
        label: "token ID VNPT",
        env: "NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID",
      },
    };
    const missingLabels = validation.missingKeys
      .map((key) => {
        const field = configFields[key];
        return field ? `${field.label} (${field.env})` : key;
      })
      .join(", ");

    return `Thiếu cấu hình VNPT eKYC (${missingLabels}). Hãy bổ sung cấu hình rồi khởi động lại frontend.`;
  }

  if (validation?.code === "expired_token") {
    return "Access token VNPT eKYC đã hết hạn. Hãy cấp token mới và khởi động lại frontend.";
  }

  return "Access token VNPT eKYC sắp hết hạn. Hãy cấp token mới trước khi tiếp tục.";
}

function getJwtExpiryMs(accessToken) {
  const token = normalizeVnptAccessToken(accessToken);
  const segments = token.split(".");

  if (segments.length !== 3) return null;

  try {
    const base64 = segments[1].replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const bytes = Uint8Array.from(
      globalThis.atob(paddedBase64),
      (character) => character.charCodeAt(0)
    );
    const payload = JSON.parse(new globalThis.TextDecoder().decode(bytes));

    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function validateVnptEkycConfig(config = {}, nowMs = Date.now()) {
  const normalizedConfig = {
    ...config,
    ACCESS_TOKEN: normalizeVnptAccessToken(config.ACCESS_TOKEN),
  };
  const missingKeys = REQUIRED_CONFIG_KEYS.filter(
    (key) =>
      typeof normalizedConfig[key] !== "string" ||
      normalizedConfig[key].trim() === "" ||
      PLACEHOLDER_CONFIG_VALUES.has(normalizedConfig[key].trim().toLowerCase())
  );

  if (missingKeys.length > 0) {
    return { ok: false, code: "missing_config", missingKeys };
  }

  const expiresAt = getJwtExpiryMs(normalizedConfig.ACCESS_TOKEN);

  if (expiresAt !== null && expiresAt <= nowMs) {
    return { ok: false, code: "expired_token", expiresAt };
  }

  if (
    expiresAt !== null &&
    expiresAt <= nowMs + MINIMUM_TOKEN_VALIDITY_MS
  ) {
    return { ok: false, code: "token_expiring", expiresAt };
  }

  return { ok: true, expiresAt };
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..", "..", "..");

export const SHARED_ENV_FILE = path.join(
  repositoryRoot,
  "be",
  "backhaulbid-infrastructure",
  ".env",
);

export const FRONTEND_ENV_KEYS = Object.freeze([
  "NEXT_PUBLIC_GATEWAY_URL",
  "NEXT_PUBLIC_BIDDING_SOCKET_PATH",
  "NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL",
  "NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY",
  "NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID",
  "NEXT_PUBLIC_VNPT_EKYC_AUTH",
]);

const REQUIRED_EKYC_ENV_KEYS = Object.freeze([
  "NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL",
  "NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY",
  "NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID",
  "NEXT_PUBLIC_VNPT_EKYC_AUTH",
]);

function normalizeDotEnvValue(rawValue) {
  const value = rawValue.trim();

  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  const inlineCommentIndex = value.search(/\s+#/);
  return inlineCommentIndex >= 0
    ? value.slice(0, inlineCommentIndex).trimEnd()
    : value;
}

export function parseDotEnv(text) {
  const values = {};

  for (const line of String(text).split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const assignment = trimmedLine.startsWith("export ")
      ? trimmedLine.slice("export ".length)
      : trimmedLine;
    const separatorIndex = assignment.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = assignment.slice(0, separatorIndex).trim();

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    values[key] = normalizeDotEnvValue(assignment.slice(separatorIndex + 1));
  }

  return values;
}

export function selectFrontendEnvironment(values = {}) {
  return FRONTEND_ENV_KEYS.reduce((selected, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      selected[key] = String(values[key] ?? "");
    }

    return selected;
  }, {});
}

export function mergeFrontendEnvironment(baseEnvironment = {}, sharedEnvironment = {}) {
  const merged = { ...baseEnvironment };
  const selectedSharedEnvironment = selectFrontendEnvironment(sharedEnvironment);

  for (const [key, value] of Object.entries(selectedSharedEnvironment)) {
    merged[key] = value;
  }

  return merged;
}

export function validateRequiredFrontendEnvironment(environment = {}) {
  return REQUIRED_EKYC_ENV_KEYS.filter(
    (key) => !String(environment[key] ?? "").trim(),
  );
}

function getAuthoritativeSharedEnvironment(parsedEnvironment) {
  return FRONTEND_ENV_KEYS.reduce((selected, key) => {
    selected[key] = parsedEnvironment[key] ?? "";
    return selected;
  }, {});
}

export function loadFrontendEnvironment({
  filePath = SHARED_ENV_FILE,
  existingEnvironment = process.env,
} = {}) {
  if (fs.existsSync(filePath)) {
    const parsedEnvironment = parseDotEnv(fs.readFileSync(filePath, "utf8"));
    const sharedEnvironment = getAuthoritativeSharedEnvironment(
      selectFrontendEnvironment(parsedEnvironment),
    );

    return {
      source: "infrastructure",
      environment: mergeFrontendEnvironment(
        existingEnvironment,
        sharedEnvironment,
      ),
      missing: validateRequiredFrontendEnvironment(sharedEnvironment),
    };
  }

  const existingFrontendEnvironment = selectFrontendEnvironment(
    existingEnvironment,
  );

  if (Object.keys(existingFrontendEnvironment).length === 0) {
    throw new Error(
      "Không tìm thấy cấu hình dùng chung tại be/backhaulbid-infrastructure/.env và cũng không có biến frontend trong môi trường hiện tại.",
    );
  }

  return {
    source: "process",
    environment: { ...existingEnvironment },
    missing: validateRequiredFrontendEnvironment(existingFrontendEnvironment),
  };
}

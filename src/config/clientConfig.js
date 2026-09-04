const DEFAULT_GATEWAY_URL = "http://localhost:8080";

const withoutTrailingSlash = (value) => value.replace(/\/+$/, "");

export const GATEWAY_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_GATEWAY_URL || DEFAULT_GATEWAY_URL,
);

export const BIDDING_SOCKET_PATH =
  process.env.NEXT_PUBLIC_BIDDING_SOCKET_PATH || "/bidding-socket";

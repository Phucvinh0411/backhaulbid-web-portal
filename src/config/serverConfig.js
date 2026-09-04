const DEFAULT_GATEWAY_URL = "http://localhost:8080";

export function getInternalGatewayUrl() {
  return (
    process.env.INTERNAL_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    DEFAULT_GATEWAY_URL
  ).replace(/\/+$/, "");
}

// S3 objects are private; media-service streams operational images to signed-in users.
const S3_OBJECT = /^https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/([a-z-]+)\/([^/?#]+)$/i;
const READABLE_FOLDERS = new Set(["delivery-proofs", "auction-goods", "complaints", "avatars"]);

/** Returns a gateway URL the browser loads with the session cookie; other URLs pass through. */
export function toMediaViewUrl(url, gatewayUrl) {
  if (!url || typeof url !== "string") return url;
  const match = url.trim().match(S3_OBJECT);
  if (!match || !READABLE_FOLDERS.has(match[1])) return url;
  return `${String(gatewayUrl || "").replace(/\/+$/, "")}/api/v1/media/files/${match[1]}/${match[2]}`;
}

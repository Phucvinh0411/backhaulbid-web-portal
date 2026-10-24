// Pure route formatters and helpers.

/**
 * Formats duration in seconds into a friendly Vietnamese string, e.g. "~2 giờ 15 phút" or "~45 phút".
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `~${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `~${hours} giờ ${remainingMins} phút` : `~${hours} giờ`;
}

/**
 * Formats distance in km cleanly, e.g. "125.4 km".
 */
export function formatDistanceKm(distanceKm) {
  if (distanceKm == null || Number.isNaN(Number(distanceKm))) return "";
  return `${Number(distanceKm).toFixed(1)} km`;
}

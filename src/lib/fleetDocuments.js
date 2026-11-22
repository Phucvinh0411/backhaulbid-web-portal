export function getVehicleDocumentPath(vehicleId, kind) {
  return `/api/v1/vehicles/${encodeURIComponent(vehicleId)}/documents/${encodeURIComponent(kind)}`;
}

export function getDriverLicenseDocumentPath(driverId) {
  return `/api/v1/drivers/${encodeURIComponent(driverId)}/license-document`;
}

/**
 * Opens an authenticated private document Blob in a new tab and schedules ObjectURL cleanup.
 * Mirrors Cargo Liability private certificate viewing so S3 keys stay behind gateway auth.
 */
export async function openAuthorizedBlobInNewTab(fetchBlob) {
  const blob = await fetchBlob();
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  if (!opened) {
    throw new Error("POPUP_BLOCKED");
  }
}

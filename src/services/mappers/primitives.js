/** Shared primitive normalizers used across frontend API mappers. */

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const candidate =
    typeof value === "object" && value.$numberDecimal !== undefined
      ? value.$numberDecimal
      : value;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const candidate =
    typeof value === "object" && value.$numberDecimal !== undefined
      ? value.$numberDecimal
      : value;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toId(entity) {
  if (!entity || typeof entity !== "object") return null;
  const raw = entity.id ?? entity._id ?? null;
  return raw === null || raw === undefined ? null : String(raw);
}

export function toIsoString(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  return String(value);
}

export function unwrapData(response) {
  if (response === null || response === undefined) return null;
  if (Array.isArray(response)) return response;
  if (typeof response === "object" && "data" in response && !("pagination" in response)) {
    return response.data;
  }
  return response;
}

export function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  return [];
}

/**
 * Maps a paginated API response while preserving both `data`/`items` and `pagination`
 * fields so callers using either convention remain fully compatible.
 */
export function mapPageResponse(response, itemMapper) {
  const unwrapped =
    response?.data &&
    !Array.isArray(response.data) &&
    (Array.isArray(response.data.data) ||
      Array.isArray(response.data.items) ||
      Array.isArray(response.data.content))
      ? response.data
      : response || {};

  const mappedItems = unwrapList(unwrapped).map((item, index, all) =>
    itemMapper(item, index, all),
  );

  const metaSource = unwrapped?.pagination || unwrapped || {};
  const totalItems = toNumber(
    metaSource.totalItems ?? metaSource.totalElements ?? metaSource.total,
    mappedItems.length,
  );
  const pageSize = toNumber(
    metaSource.pageSize ?? metaSource.size,
    mappedItems.length || 10,
  );
  const page = toNumber(metaSource.page ?? metaSource.currentPage, 1);
  const totalPages = toNumber(
    metaSource.totalPages,
    pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0,
  );

  const pagination = {
    ...(unwrapped?.pagination || {}),
    page: page > 0 ? page : 1,
    pageSize: pageSize > 0 ? pageSize : mappedItems.length,
    totalItems: totalItems >= 0 ? totalItems : mappedItems.length,
    totalPages: totalPages >= 0 ? totalPages : 0,
  };

  return {
    ...(typeof unwrapped === "object" && !Array.isArray(unwrapped) ? unwrapped : {}),
    data: mappedItems,
    items: mappedItems,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    pagination,
  };
}

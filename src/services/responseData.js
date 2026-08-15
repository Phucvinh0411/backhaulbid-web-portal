export function unwrapListData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

export function getPageItems(response) {
  return unwrapListData(response);
}

export function getPageMeta(response) {
  const items = getPageItems(response);
  const source = response?.pagination
    ? response
    : response?.data?.pagination
      ? response.data.pagination
      : response?.data && !Array.isArray(response.data)
        ? response.data
        : response;

  const totalItems = Number(source?.totalItems ?? source?.totalElements ?? source?.total ?? items.length);
  const pageSize = Number(source?.pageSize ?? source?.size ?? (items.length || 10));
  const page = Number(source?.page ?? source?.currentPage ?? 1);

  const totalPages = source?.totalPages ?? Math.ceil(totalItems / pageSize);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : items.length,
    totalItems: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : items.length,
    totalPages: Number.isFinite(Number(totalPages)) ? Number(totalPages) : 0,
  };
}

export function toWithdrawalApiStatus(status) {
  if (status === "ALL") return undefined;
  if (status === "COMPLETED") return "APPROVED";
  return status;
}

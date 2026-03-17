/* ----------------------------------------
    PAGINATION HELPERS
---------------------------------------- */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const paginate = (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedPageSize = Number.parseInt(pageSize, 10);
  const safePage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const boundedLimit =
    Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? Math.min(parsedPageSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const offset = (safePage - 1) * boundedLimit;
  return { limit: boundedLimit, offset };
};

export const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: results } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, results, totalPages, currentPage };
};

/* ----------------------------------------
   VALIDATORS (regex)
---------------------------------------- */

export const validatePhoneNumber = (phone) => {
  const re = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return re.test(String(phone));
};

export const validateURL = (url) => {
  const re = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.]*)*\/?$/;
  return re.test(String(url).toLowerCase());
};

export const validateUUID = (uuid) => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(String(uuid).toLowerCase());
};

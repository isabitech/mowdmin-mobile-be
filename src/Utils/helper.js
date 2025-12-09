/* ----------------------------------------
    PAGINATION HELPERS
---------------------------------------- */
export const paginate = (page, pageSize) => {
    const limit = pageSize ? +pageSize : 10;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
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


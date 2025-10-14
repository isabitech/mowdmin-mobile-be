import { response } from "express";
export const success = (message = 'Success', data = null) => {
    const payload = {
        success: true,
        message,
    };

    if (data !== null) payload.data = data;

    return response.status(200).json(payload);
};

export const error = (message = 'Error', data = null) => {
    const payload = {
        success: false,
        error: message,
    };

    if (data !== null) payload.data = data;

    return response.status(400).json(payload);
};
export const customError = (message = 'Error', statusCode = 400, data = null) => {
    const payload = {
        success: false,
        error: message,
    };

    if (data !== null) payload.data = data;

    return response.status(statusCode).json(payload);
};

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
export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
export const validatePhoneNumber = (phone) => {
    const re = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return re.test(String(phone));
}
export const validateURL = (url) => {
    const re = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.]*)*\/?$/;
    return re.test(String(url).toLowerCase());
}
export const validateUUID = (uuid) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return re.test(String(uuid).toLowerCase());
}
export const validatePassword = (password) => {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return re.test(String(password));
}

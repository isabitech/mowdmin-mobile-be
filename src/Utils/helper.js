import { response } from "express";
import { body, validationResult } from "express-validator";
import User from "../Models/UserModel.js";

/* ----------------------------------------
   RESPONSE HELPERS
---------------------------------------- */
export const success = (res, message = 'Success', data = null) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(200).json(payload);
};

export const error = (res, message = 'Error', data = null) => {
  const payload = { success: false, error: message };
  if (data !== null) payload.data = data;
  return res.status(400).json(payload);
};

export const customError = (res, message = 'Error', statusCode = 400, data = null) => {
  const payload = { success: false, error: message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

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


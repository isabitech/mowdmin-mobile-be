const mergeMeta = (res, meta = {}) => {
  const requestMeta = res?.locals?.meta ?? {};
  return { ...requestMeta, ...meta };
};

export const sendSuccess = (res, { message = "Success", data = {}, meta = {}, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    meta: mergeMeta(res, meta),
  });
};

export const sendError = (res, { message = "Error", statusCode = 400, data = {}, meta = {} } = {}) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    data,
    meta: mergeMeta(res, meta),
  });
};

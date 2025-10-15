export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV === "development") {
        console.error("🔥 Error:", err);
    }

    const responsePayload = {
        success: false,
        message,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === "development") {
        responsePayload.stack = err.stack;
    }

    return res.status(statusCode).json(responsePayload);
};

/* Minimal structured logger; can be swapped for a real logger later */

export const logger = {
  info: (message, meta = {}) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ level: "info", message, ...meta }));
  },
  error: (message, meta = {}) => {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: "error", message, ...meta }));
  },
};

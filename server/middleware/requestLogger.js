/**
 * Minimal request logger. Good enough to see traffic in development and in
 * container logs in production without pulling in a logging dependency.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

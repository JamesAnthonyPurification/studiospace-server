export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} does not exist.` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }

  // Duplicate key from a unique index
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on our end. Please try again.' : err.message,
    ...(err.details && { errors: err.details }),
  });
}

import { ObjectId } from 'mongodb';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Parses a route param into an ObjectId, or throws a 404 with the given label. */
export function toObjectId(id, label = 'Resource') {
  if (!ObjectId.isValid(id)) throw new HttpError(404, `${label} not found.`);
  return new ObjectId(id);
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

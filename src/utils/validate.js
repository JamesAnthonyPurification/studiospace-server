import { HttpError } from './http.js';

export const CATEGORIES = ['Photo Studio', 'Sound Stage', 'Podcast Room', 'Music Suite', 'Art Workshop'];

const URL_RE = /^https?:\/\/\S+$/i;

const text = (value) => String(value ?? '').trim();
const num = (value) => (value === '' || value === null || value === undefined ? NaN : Number(value));

/**
 * Validates the editable fields of a studio listing.
 * Owner info is never read from the body — it comes from the verified JWT.
 */
export function validateStudio(body = {}) {
  const errors = [];

  const title = text(body.title);
  const category = text(body.category);
  const location = text(body.location);
  const image = text(body.image);
  const overview = text(body.overview);
  const hourlyRate = num(body.hourlyRate);
  const securityDeposit = num(body.securityDeposit);
  const maxCapacity = num(body.maxCapacity);

  const amenities = Array.isArray(body.amenities)
    ? [...new Set(body.amenities.map(text).filter(Boolean))].slice(0, 30)
    : [];
  const gallery = Array.isArray(body.gallery) ? body.gallery.map(text).filter(Boolean).slice(0, 8) : [];

  if (title.length < 4 || title.length > 90) errors.push('Title must be between 4 and 90 characters.');
  if (!CATEGORIES.includes(category)) errors.push(`Category must be one of: ${CATEGORIES.join(', ')}.`);
  if (!Number.isFinite(hourlyRate) || hourlyRate < 1 || hourlyRate > 10000) errors.push('Hourly rate must be between $1 and $10,000.');
  if (!Number.isFinite(securityDeposit) || securityDeposit < 0 || securityDeposit > 50000) errors.push('Security deposit must be between $0 and $50,000.');
  if (!Number.isInteger(maxCapacity) || maxCapacity < 1 || maxCapacity > 1000) errors.push('Max capacity must be a whole number between 1 and 1000.');
  if (location.length < 3) errors.push('Location / address is required.');
  if (!URL_RE.test(image)) errors.push('A valid image URL (http/https) is required.');
  if (gallery.some((url) => !URL_RE.test(url))) errors.push('Every gallery image must be a valid URL.');
  if (amenities.length === 0) errors.push('Select at least one amenity.');
  if (overview.length < 40) errors.push('Overview should be at least 40 characters so creators know what to expect.');

  if (errors.length) throw new HttpError(400, errors[0], errors);

  return {
    title,
    category,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    securityDeposit: Math.round(securityDeposit * 100) / 100,
    maxCapacity,
    location,
    image,
    gallery: gallery.filter((url) => url !== image),
    amenities,
    overview,
  };
}

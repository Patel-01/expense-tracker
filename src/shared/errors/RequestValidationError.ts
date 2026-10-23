/** Thrown for invalid client input; the server maps it to 400, everything else to 500. */
export default class RequestValidationError extends Error {
  override readonly name = 'RequestValidationError';
}

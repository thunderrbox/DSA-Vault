import crypto from "crypto";

/**
 * Verifies that the incoming request payload matches the HMAC-SHA256 signature.
 * E.g., X-Hub-Signature-256 = "sha256=abcdef..."
 */
export function verifySignature(payload, signature, secret) {
  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = signature.slice(7).trim(); // strip "sha256="
  
  // A valid SHA256 hex string must be exactly 64 characters long
  if (expectedSignature.length !== 64) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");

  const digestBuf = Buffer.from(digest, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");

  // Double check length of buffers to satisfy timingSafeEqual requirements
  if (digestBuf.length !== expectedBuf.length) {
    return false;
  }

  // Constant time comparison to prevent timing attacks
  return crypto.timingSafeEqual(digestBuf, expectedBuf);
}

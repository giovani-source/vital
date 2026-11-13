import crypto from "crypto";

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = "sha512";

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, expectedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function computeRecordSignature(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

const SESSION_HMAC_SECRET =
  process.env.SESSION_SECRET || "pep-hospitalar-aghuse-secret-key-2026-hmac-sha256";

export function createSignedSessionToken(userId: string, expiresAt: Date): string {
  const payload = JSON.stringify({
    u: userId,
    e: expiresAt.getTime(),
    n: crypto.randomBytes(12).toString("hex"),
  });
  const encoded = Buffer.from(payload, "utf-8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", SESSION_HMAC_SECRET)
    .update(encoded)
    .digest("base64url");
  return `s1.${encoded}.${sig}`;
}

export function verifySignedSessionToken(
  token: string
): { userId: string; expiresAt: Date } | null {
  try {
    if (!token.startsWith("s1.")) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_HMAC_SECRET)
      .update(encoded)
      .digest("base64url");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(sig, "utf-8"),
        Buffer.from(expectedSig, "utf-8")
      )
    ) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (!parsed.u || !parsed.e) return null;
    const expiresAt = new Date(Number(parsed.e));
    if (expiresAt < new Date()) return null;
    return { userId: String(parsed.u), expiresAt };
  } catch {
    return null;
  }
}


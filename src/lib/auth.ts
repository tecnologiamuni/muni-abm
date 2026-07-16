export interface TokenPayload {
  id?: number
  username?: string
  role?: string
  iat?: number
  exp?: number
}

/**
 * Decodes the payload of a JWT without verifying its signature.
 * Signature verification stays on the backend — this only reads claims
 * (username, role, expiry) so the UI can display them.
 */
export function decodeToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    )
    return JSON.parse(json) as TokenPayload
  } catch {
    return null
  }
}

/** Returns true when the token is missing or its `exp` claim is in the past. */
export function isTokenExpired(token: string | null | undefined): boolean {
  const payload = decodeToken(token)
  if (!payload?.exp) return !token
  return payload.exp * 1000 <= Date.now()
}

/**
 * Who may use the tool: SpotOn staff signed in with a Google Workspace account. Pure rules, no I/O, so they
 * can be tested. Enforced on the server (sign-in callback and middleware); the `hd` hint sent to Google only
 * pre-selects the account chooser and is never trusted.
 */
export const ALLOWED_DOMAIN = "spoton.com";

export interface GoogleProfileLike {
  email?: string | null;
  email_verified?: boolean | null;
  hd?: string | null;
}

/** An address of the form name@spoton.com exactly. Sub-domains and look-alike domains do not match. */
export function isSpotOnEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const m = /^[^@\s]+@([^@\s]+)$/.exec(email.trim().toLowerCase());
  return !!m && m[1] === ALLOWED_DOMAIN;
}

/** Google must say the address is verified, it must be @spoton.com, and the Workspace domain (hd) must match. */
export function isAllowedGoogleProfile(p: GoogleProfileLike | null | undefined): boolean {
  if (!p) return false;
  return p.email_verified === true && isSpotOnEmail(p.email) && (p.hd ?? "").toLowerCase() === ALLOWED_DOMAIN;
}

/** Paths that must stay reachable while signed out: the sign-in page and the auth endpoints. */
export function isPublicPath(pathname: string): boolean {
  return pathname === "/signin" || pathname === "/api/auth" || pathname.startsWith("/api/auth/");
}

/**
 * Local-only escape hatch for automated browser tests. It can never apply on Vercel, whatever is set, so a
 * deployment cannot be opened by accident.
 */
export function authBypassed(env: Record<string, string | undefined>): boolean {
  return env.MARGINLAB_AUTH_BYPASS === "1" && !env.VERCEL && !env.VERCEL_ENV;
}

/** Sign-in needs all four settings; without them the app stays closed and says so. */
export function authConfigured(env: Record<string, string | undefined>): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.NEXTAUTH_SECRET && env.NEXTAUTH_URL);
}

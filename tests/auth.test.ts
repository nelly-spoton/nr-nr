import { describe, expect, it } from "vitest";
import { authBypassed, authConfigured, isAllowedGoogleProfile, isPublicPath, isSpotOnEmail } from "@/lib/authRules";

describe("who can sign in", () => {
  it("accepts a verified @spoton.com Google Workspace account, in any letter case", () => {
    expect(isAllowedGoogleProfile({ email: "nelly.ramos@spoton.com", email_verified: true, hd: "spoton.com" })).toBe(true);
    expect(isAllowedGoogleProfile({ email: "Nelly.Ramos@SpotOn.com", email_verified: true, hd: "SPOTON.COM" })).toBe(true);
  });
  it("rejects other domains, look-alikes, sub-domains and personal Gmail", () => {
    for (const email of ["a@gmail.com", "a@spoton.com.evil.com", "a@notspoton.com", "a@evilspoton.com", "a@mail.spoton.com", "a@spoton.co", "spoton.com", "a@b@spoton.com", ""]) {
      expect(isSpotOnEmail(email), email).toBe(false);
    }
    expect(isAllowedGoogleProfile({ email: "a@gmail.com", email_verified: true })).toBe(false);
  });
  it("rejects an unverified address, a missing or different Workspace domain, and empty profiles", () => {
    expect(isAllowedGoogleProfile({ email: "a@spoton.com", email_verified: false, hd: "spoton.com" })).toBe(false);
    expect(isAllowedGoogleProfile({ email: "a@spoton.com", email_verified: true })).toBe(false);
    expect(isAllowedGoogleProfile({ email: "a@spoton.com", email_verified: true, hd: "other.com" })).toBe(false);
    expect(isAllowedGoogleProfile(null)).toBe(false);
    expect(isAllowedGoogleProfile({})).toBe(false);
  });
});

describe("what stays open while signed out", () => {
  it("only the sign-in page and the auth endpoints", () => {
    for (const p of ["/signin", "/api/auth", "/api/auth/signin", "/api/auth/callback/google"]) expect(isPublicPath(p), p).toBe(true);
    for (const p of ["/", "/solutions", "/summary", "/stats", "/signin/x", "/api/authx", "/api"]) expect(isPublicPath(p), p).toBe(false);
  });
});

describe("test bypass and configuration", () => {
  it("the bypass works only when explicitly set and never on Vercel", () => {
    expect(authBypassed({})).toBe(false);
    expect(authBypassed({ MARGINLAB_AUTH_BYPASS: "1" })).toBe(true);
    expect(authBypassed({ MARGINLAB_AUTH_BYPASS: "1", VERCEL: "1" })).toBe(false);
    expect(authBypassed({ MARGINLAB_AUTH_BYPASS: "1", VERCEL_ENV: "production" })).toBe(false);
    expect(authBypassed({ MARGINLAB_AUTH_BYPASS: "true" })).toBe(false);
  });
  it("needs all four settings", () => {
    const all = { GOOGLE_CLIENT_ID: "a", GOOGLE_CLIENT_SECRET: "b", NEXTAUTH_SECRET: "c", NEXTAUTH_URL: "https://x" };
    expect(authConfigured(all)).toBe(true);
    for (const k of Object.keys(all)) expect(authConfigured({ ...all, [k]: "" }), k).toBe(false);
  });
});

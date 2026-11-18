import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ALLOWED_DOMAIN, isAllowedGoogleProfile } from "./authRules";

/** Google sign-in for SpotOn staff only. Sessions are signed cookies (no database); nothing else is stored. */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // `hd` only steers Google's account chooser. The real check is in the signIn callback below.
      authorization: { params: { hd: ALLOWED_DOMAIN, prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    async signIn({ account, profile }) {
      return account?.provider === "google" && isAllowedGoogleProfile(profile as Parameters<typeof isAllowedGoogleProfile>[0]);
    },
  },
};

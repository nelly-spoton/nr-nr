import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { authBypassed, authConfigured, isPublicPath, isSpotOnEmail } from "@/lib/authRules";

/** Every page requires a valid SpotOn session. Fails closed: missing settings or a bad cookie means sign-in. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (authBypassed(process.env) || isPublicPath(pathname)) return NextResponse.next();

  if (authConfigured(process.env)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token && isSpotOnEmail(token.email)) return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.search = "";
  if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

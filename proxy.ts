import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, sha256 } from "@/lib/auth";

// Paths that must stay reachable without logging in.
const PUBLIC_PREFIXES = ["/login", "/api/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const password = process.env.SITE_PASSWORD;
  // If no password is configured, leave the app open (prevents accidental lockout).
  if (!password) return NextResponse.next();

  const expected = await sha256(password);
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

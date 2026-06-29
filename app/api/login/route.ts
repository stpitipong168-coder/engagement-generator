import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, sha256 } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "no-password-set" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    // ignore — falls through to the mismatch below
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await sha256(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  return res;
}

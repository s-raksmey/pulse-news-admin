import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Admin gate placeholder:
 * - Today: allow all
 * - Later: check session/cookie/JWT + roles
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

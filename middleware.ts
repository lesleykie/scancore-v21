import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and health checks
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/api/health"
  ) {
    return NextResponse.next()
  }

  // Check if this is first installation
  const isFirstInstall = process.env.FIRST_INSTALL === "true"

  // Redirect to installer if first install and not already on install page
  if (isFirstInstall && !pathname.startsWith("/install")) {
    return NextResponse.redirect(new URL("/install", request.url))
  }

  // If not first install and trying to access installer, redirect to home
  if (!isFirstInstall && pathname.startsWith("/install")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

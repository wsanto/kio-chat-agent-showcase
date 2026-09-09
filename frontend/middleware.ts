import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = [
  "/chat",
  "/goals",
  "/beliefs",
  "/explore",
  "/profile",
  "/settings",
]

// Routes that should redirect to chat if already authenticated
const authRoutes = ["/auth/signin", "/auth/signup"]

// Public routes that don't need any auth checks
const publicRoutes = ["/", "/about", "/privacy", "/terms"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if user has a token (client-side auth uses localStorage,
  // but we can check for a cookie if needed for SSR)
  // For now, we'll rely on client-side protection via AuthContext
  // This middleware provides basic server-side checks

  // For protected routes, we can't check localStorage in middleware
  // The actual auth check happens client-side via AuthContext
  // This middleware just ensures the routes exist and are accessible

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
}

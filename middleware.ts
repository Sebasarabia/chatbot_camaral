import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware for stricter handling on /chat and /api/*.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chat") || pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store");
  }

  if (
    pathname.startsWith("/api/") &&
    request.method === "POST" &&
    !request.headers.get("content-type")
  ) {
    return NextResponse.json(
      { error: "Content-Type header is required" },
      { status: 415, headers: { "Cache-Control": "no-store" } }
    );
  }

  return response;
}

export const config = {
  matcher: ["/chat/:path*", "/api/:path*"]
};

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (pathname.startsWith("/portal/view")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/clients") && pathname.endsWith(".html")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/clients")) {
    if (role !== "internal") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  if (pathname.startsWith("/portal/designer")) {
    if (role !== "internal" && role !== "designer") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/portal/:path*",
  ],
}
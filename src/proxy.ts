import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isSupportPage = req.nextUrl.pathname.startsWith('/support')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/shop', req.url))
      }
      return null
    }

    if (req.nextUrl.pathname === '/') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin?tab=overview', req.url))
      }
      if (token?.role === 'SUPPORT') {
        return NextResponse.redirect(new URL('/support?tab=overview', req.url))
      }
    }

    const isProtectedRoute = req.nextUrl.pathname.startsWith('/account') || req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/contact') || req.nextUrl.pathname.startsWith('/support')

    if (isProtectedRoute && !isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url))
    }

    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/account', req.url))
    }

    if (isSupportPage && token?.role !== 'SUPPORT' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/account', req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true // We handle authorization in the middleware function above
    }
  }
)

export const config = {
  matcher: ['/', '/admin/:path*', '/account/:path*', '/contact', '/login', '/register']
}

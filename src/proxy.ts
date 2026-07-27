import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isCustomerAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
    const isExecPortal = req.nextUrl.pathname.startsWith('/portal/rk-exec-gateway')
    const isSupportPortal = req.nextUrl.pathname.startsWith('/portal/rk-service-desk')
    const isAnyPortal = req.nextUrl.pathname.startsWith('/portal/')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isSupportPage = req.nextUrl.pathname.startsWith('/support')

    // 0. Stealth Security: If an unauthenticated user tries to access /admin or /support directly, silently bounce to home (/)
    if (!isAuth && (isAdminPage || isSupportPage)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 1. Auth Page & Portal Login Routing for Already Authenticated Users
    if (isCustomerAuthPage || isAnyPortal) {
      if (isAuth) {
        // If an Admin is already logged in, redirect them to Admin HQ
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin?tab=overview', req.url))
        }
        // If Support staff is already logged in, redirect them to Support Desk
        if (token.role === 'SUPPORT') {
          return NextResponse.redirect(new URL('/support?tab=overview', req.url))
        }
        // If Customer (or any non-staff role) tries to visit staff portal or auth pages, redirect to Shop
        return NextResponse.redirect(new URL('/shop', req.url))
      }
      return null
    }

    // 2. Home page redirect for staff
    if (req.nextUrl.pathname === '/') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin?tab=overview', req.url))
      }
      if (token?.role === 'SUPPORT') {
        return NextResponse.redirect(new URL('/support?tab=overview', req.url))
      }
    }

    // 3. Strict Staff Separation: Prevent staff from accessing customer-only pages like /shop, /cart, /checkout, /account while logged in as staff
    if (isAuth) {
      const isCustomerOnlyRoute = (req.nextUrl.pathname.startsWith('/account') || 
                                  req.nextUrl.pathname.startsWith('/checkout') || 
                                  req.nextUrl.pathname.startsWith('/cart') || 
                                  req.nextUrl.pathname.startsWith('/shop') ||
                                  req.nextUrl.pathname.startsWith('/wishlist')) && 
                                  !req.nextUrl.pathname.endsWith('/invoice');
      if (isCustomerOnlyRoute) {
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin?tab=overview', req.url))
        }
        if (token.role === 'SUPPORT') {
          return NextResponse.redirect(new URL('/support?tab=overview', req.url))
        }
      }
    }

    // 4. Protected customer routes requiring authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/account') || req.nextUrl.pathname.startsWith('/contact')

    if (isProtectedRoute && !isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url))
    }

    // 5. Role enforcement for Admin pages
    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/account', req.url))
    }

    // 6. Role enforcement for Support pages
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
  matcher: [
    '/', 
    '/admin/:path*', 
    '/support/:path*', 
    '/portal/:path*', 
    '/account/:path*', 
    '/contact', 
    '/login', 
    '/register',
    '/shop',
    '/cart',
    '/checkout',
    '/wishlist'
  ]
}

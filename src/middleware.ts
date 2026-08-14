import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip paths that shouldn't be redirected (API, Next.js internal, admin portals, static files)
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/support') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Check the JWT token directly
  const token = await getToken({ req: request })
  
  // If an executive account tries to visit customer pages, redirect them to their portal
  if (token && (token.role === 'ADMIN' || token.role === 'SUPERADMIN' || token.role === 'SUPPORT')) {
    const targetUrl = token.role === 'SUPPORT' ? '/support' : '/admin'
    return NextResponse.redirect(new URL(targetUrl, request.url))
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

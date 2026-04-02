import { NextResponse } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/workouts',
  '/exercises',
  '/analytics',
]

const publicRoutes = ['/']

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if the route is public
  const isPublic = publicRoutes.includes(pathname)

  // Get the session token from cookies
  const token = request.cookies.get('fitquest-session')?.value

  // If trying to access protected route without token → redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If already logged in and tries to go to login page → redirect to dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|api).*)',
  ],
}
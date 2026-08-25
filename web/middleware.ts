// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// --- Configuration ------------------------------------------------------

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/privacy-terms',
  '/new-password',
  '/password-updated',
  '/onboarding',
  '/',
];

// Static assets that bypass auth
const STATIC_PATHS = [
  '/_next/',
  '/image/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// Routes that are mentor‑only (or mentor home)
const MENTOR_ROUTES = [ '/mentor-page'];

// Routes that are student‑only (or student home)
const STUDENT_ROUTES = ['/home', '/dashboard', '/saved', '/quiz', '/result'];

// The JWT secret – must match your backend
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// --- Middleware ---------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets
  if (STATIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Allow public routes without checks
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. Get token from cookie or Authorization header
  const token =
    request.cookies.get('careermap_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login, preserving the original URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Verify and decode the token to get the user role
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string; // assumes your JWT has a `role` field

    const isMentor = role === 'mentor';
    const isStudent = role === 'student';

    // 5. Role‑based routing restrictions
    // If a mentor tries to access a student‑only route → redirect to /mentor
    if (isMentor && STUDENT_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/mentor-page', request.url));
    }

    // If a student tries to access a mentor‑only route → redirect to /home
    if (isStudent && MENTOR_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // All good – proceed
    return NextResponse.next();
  } catch (error) {
    // Invalid token → clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('careermap_token');
    return response;
  }
}

// --- Matcher config (keep your existing one) ----------------------------
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
//middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Public routes that don't require authentication
// const PUBLIC_ROUTES = [
//   '/login',
//   '/signup',
//   '/forgot-password',
//   '/privacy-terms',
//   '/new-password',
//   '/password-updated',
//   '/onboarding',
//   '/',
// ];

// // Static assets that should bypass auth checks
// const STATIC_PATHS = [
//   '/_next/',
//   '/image/',
//   '/favicon.ico',
//   '/robots.txt',
//   '/sitemap.xml',
// ];

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Allow static assets to pass through without auth checks
//   if (STATIC_PATHS.some(path => pathname.startsWith(path))) {
//     return NextResponse.next();
//   }

//   // Check if the current route is public
//   const isPublicRoute = PUBLIC_ROUTES.some(route => 
//     pathname === route || pathname.startsWith(`${route}/`)
//   );

//   if (isPublicRoute) {
//     return NextResponse.next();
//   }

//   // Check for authentication token
//   const token = request.cookies.get('careermap_token')?.value || 
//                 request.headers.get('authorization')?.replace('Bearer ', '');

//   // If no token, redirect to login
//   if (!token) {
//     const loginUrl = new URL('/login', request.url);
//     // Store the original URL to redirect back after login
//     loginUrl.searchParams.set('redirect', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Token exists, allow the request
//   return NextResponse.next();
// }

// // Configure which routes the middleware applies to
// export const config = {
//   matcher: [
//     // Match all routes except static files and api routes
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };

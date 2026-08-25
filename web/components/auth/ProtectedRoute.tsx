'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetMe, getToken } from '@/hooks/auth.hook';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/new-password',
  '/password-updated',
  '/privacy-terms',
  '/onboarding',
  '/',
];

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isError } = useGetMe();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute) return;

    // Check if user is authenticated
    const token = getToken();

    if (!token || isError) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [isPublicRoute, isError, pathname, router]);

  // On the server (and first client render before mount), always render children
  // to avoid hydration mismatch. The useEffect redirect handles auth on client.
  if (!mounted) {
    return <>{children}</>;
  }

  // Show loading state while checking auth (client only, after mount)
  if (isLoading && !isPublicRoute) {
    return fallback || null;
  }

  // For public routes or authenticated users, render children
  return <>{children}</>;
}

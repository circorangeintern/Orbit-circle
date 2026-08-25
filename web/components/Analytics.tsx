'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ReactGA from 'react-ga4';

// Replace this with your actual Measurement ID or use an environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initialize GA4 once on mount
 useEffect(() => {
  if (GA_MEASUREMENT_ID) {
    // Enable testMode to log events directly to the browser console
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: process.env.NODE_ENV === 'development',
    });
  }
}, []);

  // 2. Track page views when pathname or searchParams change
  useEffect(() => {
    if (GA_MEASUREMENT_ID && pathname && isInitialized) {
      // Construct the full URL including search parameters
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      ReactGA.send({ 
        hitType: 'pageview', 
        page: url, 
        title: document.title 
      });
    }
  }, [pathname, searchParams, isInitialized]);

  // This component doesn't render any visual UI
  return null;
}
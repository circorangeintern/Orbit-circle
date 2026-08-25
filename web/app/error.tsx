'use client';

import { useEffect, useState } from 'react';
import StateView, { StateType } from '@/components/StateView';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorType, setErrorType] = useState<StateType>('generic_error');

  useEffect(() => {
    // Log the error for tracking
    console.error('Captured by global error boundary:', error);

    // Heuristics to determine the error type
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setErrorType('no_internet');
      return;
    }

    const message = error.message?.toLowerCase() || '';
    if (
      message.includes('network') ||
      message.includes('internet') ||
      message.includes('offline') ||
      message.includes('connection')
    ) {
      setErrorType('no_internet');
    } else if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('database') ||
      message.includes('status code 5')
    ) {
      setErrorType('server_error');
    } else {
      setErrorType('generic_error');
    }
  }, [error]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-1 min-h-[60vh] items-center justify-center p-4 w-full">
      <StateView
        type={errorType}
        onPrimaryAction={reset}
        onGoBack={handleGoHome}
      />
    </div>
  );
}

'use client';

import StateView from '@/components/StateView';

export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-1 min-h-[60vh] items-center justify-center p-4 w-full">
      <StateView
        type="not_found"
        onPrimaryAction={handleGoHome}
        onGoBack={handleGoHome}
      />
    </div>
  );
}

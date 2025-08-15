// Lazy loading components for better performance
import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

// Lazy load heavy components that aren't needed immediately
export const LazyFileUploader = lazy(() => import('../components/FileUploader'));
export const LazyScoreGauge = lazy(() => import('../components/ScoreGauge'));
export const LazyScoreCircle = lazy(() => import('../components/ScoreCircle'));

// Wrapper component with loading fallback
export function LazyComponentWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-20 w-full"></div> 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <div className="lazy-component">
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
}

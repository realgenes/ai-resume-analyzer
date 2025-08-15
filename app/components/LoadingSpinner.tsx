import type { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
        <svg fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function ResumeCardSkeleton() {
  return (
    <div className="resume-card animate-pulse">
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-28 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

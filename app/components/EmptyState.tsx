import { Link } from 'react-router';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
  illustration?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Illustration or Icon */}
      <div className="mb-6">
        {illustration ? (
          <img 
            src={illustration} 
            alt={title}
            className="w-48 h-48 md:w-64 md:h-64 object-contain opacity-80"
          />
        ) : icon ? (
          <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl mb-4">
            {icon}
          </div>
        ) : (
          <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl mb-4">
            <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        {action && (
          <div className="pt-4">
            <Link
              to={action.href}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                action.variant === 'secondary'
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {action.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined empty states for common scenarios
export function NoResumesEmptyState() {
  return (
    <EmptyState
      title="No resumes uploaded yet"
      description="You haven't uploaded any resumes for analysis. Your resume dashboard will show all your submissions and AI-powered feedback once you start uploading."
    />
  );
}

export function UploadEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      }
      title="Ready to analyze your resume?"
      description="Upload your resume in PDF format and get instant AI-powered feedback to improve your chances of landing your dream job."
    />
  );
}

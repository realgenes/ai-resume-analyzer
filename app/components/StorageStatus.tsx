import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';

interface StorageStatus {
  bucketsExist: boolean;
  missingBuckets: string[];
  policiesConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

export function StorageStatus() {
  const [status, setStatus] = useState<StorageStatus>({
    bucketsExist: false,
    missingBuckets: [],
    policiesConfigured: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkStorageBuckets = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          setStatus({
            bucketsExist: false,
            missingBuckets: ['resumes', 'images'],
            policiesConfigured: false,
            isLoading: false,
            error: error.message
          });
          return;
        }

        const requiredBuckets = ['resumes', 'images'];
        const existingBuckets = buckets.map(b => b.name);
        const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
        
        // Test if policies are working by trying to list files (this should not error even if no files exist)
        let policiesConfigured = false;
        try {
          // Try to list files in the resumes bucket - this will fail if policies aren't set up
          await supabase.storage.from('resumes').list('', { limit: 1 });
          await supabase.storage.from('images').list('', { limit: 1 });
          policiesConfigured = true;
        } catch (policyError) {
          console.warn('Storage policies may not be configured:', policyError);
          policiesConfigured = false;
        }
        
        setStatus({
          bucketsExist: missingBuckets.length === 0,
          missingBuckets,
          policiesConfigured,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setStatus({
          bucketsExist: false,
          missingBuckets: ['resumes', 'images'],
          policiesConfigured: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Storage check failed'
        });
      }
    };

    checkStorageBuckets();
  }, []);

  if (status.isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-700 text-sm">Checking storage status...</span>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium text-sm">Storage Error</h3>
            <p className="text-red-700 text-sm mt-1">{status.error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!status.bucketsExist) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-yellow-800 font-medium text-sm">Storage Setup Required</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Missing storage buckets: <strong>{status.missingBuckets.join(', ')}</strong>
            </p>
            <div className="mt-2 text-sm">
              <p className="text-yellow-700 font-medium">To fix this:</p>
              <ol className="list-decimal list-inside text-yellow-700 mt-1 space-y-1">
                <li>Go to your <a href="https://supabase.com/dashboard/project/xzvtcnrpmjvlnwxajjek/storage" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">Supabase Storage dashboard</a></li>
                <li>Create bucket: <code className="bg-yellow-100 px-1 rounded">resumes</code> (Private)</li>
                <li>Create bucket: <code className="bg-yellow-100 px-1 rounded">images</code> (Private)</li>
                <li>Run the <code className="bg-yellow-100 px-1 rounded">supabase-storage-setup.sql</code> script in your SQL Editor</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status.policiesConfigured) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-red-800 font-medium text-sm">Storage Policies Not Configured</h3>
            <p className="text-red-700 text-sm mt-1">
              Storage buckets exist but RLS policies are missing. Files cannot be uploaded without proper policies.
            </p>
            <div className="mt-2 text-sm">
              <p className="text-red-700 font-medium">To fix this:</p>
              <ol className="list-decimal list-inside text-red-700 mt-1 space-y-1">
                <li>Go to your <a href="https://supabase.com/dashboard/project/xzvtcnrpmjvlnwxajjek/sql" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800">Supabase SQL Editor</a></li>
                <li>Copy and run the contents of <code className="bg-red-100 px-1 rounded">supabase-storage-setup.sql</code></li>
                <li>Or manually create policies in <a href="https://supabase.com/dashboard/project/xzvtcnrpmjvlnwxajjek/storage" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800">Storage settings</a></li>
                <li>Refresh this page to verify</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-green-700 text-sm font-medium">Storage configured correctly</span>
      </div>
    </div>
  );
}

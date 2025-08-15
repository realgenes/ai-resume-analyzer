import { useState, useCallback, memo } from 'react';
import { useAppStore } from '~/lib/store';
import { EmailAuth } from './EmailAuth';

export const MultiAuth = memo(function MultiAuth() {
  const [authMethod, setAuthMethod] = useState<'oauth' | 'email'>('oauth');
  const { isLoading, signInWithGoogle } = useAppStore();

  // OAuth providers supported by Supabase
  const oauthProviders = [
    { 
      id: 'google', 
      name: 'Google', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      setupNote: 'Secure and fast sign-in with your Google account'
    }
  ];

  const handleOAuthSignIn = useCallback(async (providerId: string) => {
    try {
      switch (providerId) {
        case 'google':
          await signInWithGoogle();
          break;
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }

      console.log('✅ Authentication successful');
    } catch (error: any) {
      console.error(`❌ ${providerId} authentication error:`, error.message);
      
      // User-friendly error messages
      if (error.message?.includes('popup')) {
        // Show a more user-friendly toast/notification instead of alert
        alert('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.message?.includes('cancelled')) {
        // User cancelled - no need to show error
        return;
      } else if (error.message?.includes('unauthorized')) {
        alert('Domain not authorized. Please contact support.');
      } else {
        alert(`${providerId} authentication failed: ${error.message}`);
      }
    }
  }, [signInWithGoogle]);

  const setOAuthMethod = useCallback(() => {
    setAuthMethod('oauth');
  }, []);

  const setEmailMethod = useCallback(() => {
    setAuthMethod('email');
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Enhanced Auth Method Toggle */}
      <div className="flex mb-4 bg-gray-50 rounded-xl p-1.5 max-w-md w-full border border-gray-200">
        <button
          onClick={setOAuthMethod}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            authMethod === 'oauth' 
              ? 'bg-white text-indigo-600 shadow-md border border-indigo-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Quick Sign In
          </span>
        </button>
        <button
          onClick={setEmailMethod}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            authMethod === 'email' 
              ? 'bg-white text-indigo-600 shadow-md border border-indigo-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email
          </span>
        </button>
      </div>

      <div className="max-w-md w-full">
        {authMethod === 'oauth' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Continue with Google</h3>
              <p className="text-sm text-gray-600">Quick and secure access to your account</p>
            </div>
            
            {oauthProviders.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <button
                  onClick={() => handleOAuthSignIn(provider.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 group"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 text-indigo-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span className="group-hover:scale-110 transition-transform duration-200">{provider.icon}</span>
                      <span>Continue with {provider.name}</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center leading-relaxed">{provider.setupNote}</p>
              </div>
            ))}

          </div>
        ) : (
          <EmailAuth />
        )}
      </div>
    </div>
  );
});

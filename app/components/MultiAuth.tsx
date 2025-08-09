import { useState, useCallback, memo } from 'react';
import { useAppStore } from '~/lib/store';
import { EmailAuth } from './EmailAuth';
import { auth } from '~/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  GithubAuthProvider 
} from 'firebase/auth';

export const MultiAuth = memo(function MultiAuth() {
  const [authMethod, setAuthMethod] = useState<'oauth' | 'email'>('oauth');
  const { isLoading } = useAppStore();

  // OAuth providers that work well with Firebase
  const oauthProviders = [
    { 
      id: 'google', 
      name: 'Google', 
      icon: '🔍',
      setupNote: 'Easiest to set up - just enable in Firebase console'
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: '🐦',
      setupNote: 'Quick setup, works well'
    },
    { 
      id: 'github', 
      name: 'GitHub', 
      icon: '�',
      setupNote: 'Popular with developers, easy OAuth setup'
    }
  ];

  const handleOAuthSignIn = useCallback(async (providerId: string) => {
    try {
      let provider;
      
      switch (providerId) {
        case 'google':
          provider = new GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          break;
        case 'twitter':
          provider = new TwitterAuthProvider();
          break;
        case 'github':
          provider = new GithubAuthProvider();
          break;
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }

      const result = await signInWithPopup(auth, provider);
      console.log('✅ Authentication successful:', result.user.email);
    } catch (error: any) {
      console.error(`❌ ${providerId} authentication error:`, error.code, error.message);
      
      // User-friendly error messages
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User cancelled - no need to show error
        return;
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('Domain not authorized. Please contact support.');
      } else {
        alert(`${providerId} authentication failed: ${error.message}`);
      }
    }
  }, []);

  const setOAuthMethod = useCallback(() => {
    setAuthMethod('oauth');
  }, []);

  const setEmailMethod = useCallback(() => {
    setAuthMethod('email');
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Auth Method Toggle */}
      <div className="flex mb-8 bg-gray-100 rounded-lg p-1 max-w-md w-full">
        <button
          onClick={setOAuthMethod}
          className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'oauth' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Social Login
        </button>
        <button
          onClick={setEmailMethod}
          className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'email' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email/Password
        </button>
      </div>

      <div className="max-w-md w-full">{authMethod === 'oauth' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">Sign in with Social Account</h3>
            
            {oauthProviders.map((provider) => (
              <div key={provider.id} className="space-y-1">
                <button
                  onClick={() => handleOAuthSignIn(provider.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span>Continue with {provider.name}</span>
                </button>
                <p className="text-xs text-gray-500 text-center px-2">{provider.setupNote}</p>
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Quick Setup Guide:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to your Firebase Console</li>
                <li>2. Navigate to Authentication → Sign-in method</li>
                <li>3. Enable your preferred provider (Google is easiest)</li>
                <li>4. Add the OAuth credentials from the provider</li>
              </ol>
            </div>
          </div>
        ) : (
          <EmailAuth />
        )}
      </div>
    </div>
  );
});

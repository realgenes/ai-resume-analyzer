import { useState, useCallback, memo } from 'react';
import { useAppStore } from '~/lib/store';

interface EmailAuthProps {
  onSuccess?: () => void;
}

export const EmailAuth = memo(function EmailAuth({ onSuccess }: EmailAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const { isLoading, error, signInWithEmail, signUpWithEmail, resetPassword, resendConfirmation } = useAppStore();

  const validateForm = useCallback(() => {
    const errors: {[key: string]: string} = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!showForgotPassword && !password) {
      errors.password = 'Password is required';
    } else if (!showForgotPassword && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !showForgotPassword) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password, confirmPassword, isSignUp, showForgotPassword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (showForgotPassword) {
      await resetPassword(email);
      return;
    }

    if (isSignUp) {
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }

    if (onSuccess) {
      onSuccess();
    }
  }, [email, password, isSignUp, showForgotPassword, signInWithEmail, signUpWithEmail, resetPassword, onSuccess, validateForm]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  }, [validationErrors.email]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  }, [validationErrors.password]);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [validationErrors.confirmPassword]);

  const toggleSignUp = useCallback(() => {
    setIsSignUp(!isSignUp);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
  }, [isSignUp]);

  const toggleForgotPassword = useCallback(() => {
    setShowForgotPassword(!showForgotPassword);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
  }, [showForgotPassword]);

  const resetToSignIn = useCallback(() => {
    setShowForgotPassword(false);
    setValidationErrors({});
  }, []);

  const handleResendConfirmation = useCallback(async () => {
    if (!email) {
      setValidationErrors({ email: 'Please enter your email address' });
      return;
    }
    await resendConfirmation(email);
  }, [email, resendConfirmation]);

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <div className="auth-mode-tabs">
          {!showForgotPassword && (
            <>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`auth-tab ${!isSignUp ? 'auth-tab-active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`auth-tab ${isSignUp ? 'auth-tab-active' : ''}`}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        
        <div className="auth-title">
          <h2>
            {showForgotPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p>
            {showForgotPassword 
              ? 'Enter your email and we\'ll send you a reset link' 
              : isSignUp 
                ? 'Start your journey with us today'
                : 'Sign in to your account to continue'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-input-group">
          <label htmlFor="email" className="auth-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <div className="auth-input-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={`auth-input ${validationErrors.email ? 'auth-input-error' : ''}`}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
          </div>
          {validationErrors.email && (
            <span className="auth-field-error">{validationErrors.email}</span>
          )}
        </div>

        {!showForgotPassword && (
          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
                className={`auth-input ${validationErrors.password ? 'auth-input-error' : ''}`}
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span className="auth-field-error">{validationErrors.password}</span>
            )}
          </div>
        )}

        {isSignUp && !showForgotPassword && (
          <div className="auth-input-group">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm password
            </label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className={`auth-input ${validationErrors.confirmPassword ? 'auth-input-error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-password-toggle"
              >
                {showConfirmPassword ? (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className="auth-field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="auth-submit-button"
        >
          {isLoading ? (
            <>
              <svg className="auth-loading-spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : showForgotPassword ? (
            'Send reset link'
          ) : isSignUp ? (
            'Create account'
          ) : (
            'Sign in'
          )}
        </button>

        <div className="auth-footer">
          {!showForgotPassword && (
            <>
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="auth-link"
              >
                Forgot your password?
              </button>
              
              {isSignUp && (
                <>
                  <span className="text-gray-400 mx-2">•</span>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="auth-link"
                    disabled={isLoading}
                  >
                    Resend confirmation
                  </button>
                </>
              )}
            </>
          )}

          {showForgotPassword && (
            <button
              type="button"
              onClick={resetToSignIn}
              className="auth-link"
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

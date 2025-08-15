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
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { isLoading, error, signInWithEmail, signUpWithEmail, resetPassword, resendConfirmation } = useAppStore();

  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  const getPasswordStrengthColor = useCallback((strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  }, []);

  const getPasswordStrengthText = useCallback((strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  }, []);

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
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isSignUp) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    }
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  }, [validationErrors.password, isSignUp, calculatePasswordStrength]);

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
    setPasswordStrength(0);
  }, [isSignUp]);

  const toggleForgotPassword = useCallback(() => {
    setShowForgotPassword(!showForgotPassword);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
    setPasswordStrength(0);
  }, [showForgotPassword]);

  const resetToSignIn = useCallback(() => {
    setShowForgotPassword(false);
    setValidationErrors({});
    setPasswordStrength(0);
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
        <div className="auth-title">
          <h2>
            {showForgotPassword ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                Reset Password
              </span>
            ) : isSignUp ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Create Account
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Welcome Back
              </span>
            )}
          </h2>
          <p>
            {showForgotPassword 
              ? 'Enter your email and we\'ll send you a secure reset link' 
              : isSignUp 
                ? 'Join thousands of professionals improving their resumes'
                : 'Sign in to continue analyzing your resume'
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

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
            {email && !validationErrors.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
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
                title={showPassword ? "Hide password" : "Show password"}
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
            
            {/* Password Strength Indicator for Sign Up */}
            {isSignUp && password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength <= 2 ? 'text-red-600' : 
                    passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Use 8+ characters with uppercase, lowercase, numbers & symbols
                </div>
              </div>
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
                title={showConfirmPassword ? "Hide password" : "Show password"}
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
              {confirmPassword && password === confirmPassword && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {validationErrors.confirmPassword && (
              <span className="auth-field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="auth-submit-button group"
        >
          {isLoading ? (
            <>
              <svg className="auth-loading-spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing...</span>
            </>
          ) : showForgotPassword ? (
            <>
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Send Reset Link</span>
            </>
          ) : isSignUp ? (
            <>
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>Create Account</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Sign In</span>
            </>
          )}
        </button>

        <div className="auth-footer">
          {!showForgotPassword && !isSignUp && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="auth-link"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  Forgot your password?
                </span>
              </button>
              
              <div className="text-center py-2">
                <span className="text-gray-600 text-sm">Don't have an account?</span>
                <button
                  type="button"
                  onClick={toggleSignUp}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 text-sm font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign up here
                </button>
              </div>
            </div>
          )}

          {!showForgotPassword && isSignUp && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="auth-link"
                disabled={isLoading}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Resend confirmation
                </span>
              </button>
              
              <div className="text-center py-2">
                <span className="text-gray-600 text-sm">Already have an account?</span>
                <button
                  type="button"
                  onClick={toggleSignUp}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 text-sm font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

          {showForgotPassword && (
            <button
              type="button"
              onClick={resetToSignIn}
              className="auth-link"
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to sign in
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

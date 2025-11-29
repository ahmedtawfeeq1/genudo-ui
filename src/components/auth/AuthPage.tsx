import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import { Loader2, Mail, Eye, EyeOff, ArrowRight, Lock, User, CheckCircle, Shield } from 'lucide-react';

/**
 * AuthPage
 * Static UI implementation of the login/signup experience.
 * - Preserves visuals, layout, routes, and handlers
 * - Replaces backend auth calls with mocked async logic
 * Integration points to replace later:
 * - Email/Password sign-in and sign-up handlers
 * - Google OAuth handler
 */
interface AuthPageProps {
  mode?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  // Email verification removed - users log in directly after signup
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  /**
   * validateEmail
   * Client-side email format validation.
   */
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * validatePassword
   * Enforces minimum strength in signup mode.
   */
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const missing = [];
    if (!hasLowercase) missing.push("lowercase letter");
    if (!hasUppercase) missing.push("uppercase letter");
    if (!hasNumber) missing.push("number");
    if (missing.length > 0) {
      return `Password must include at least one ${missing.join(", ")}`;
    }
    return null;
  };

  /**
   * getErrorMessage
   * Maps thrown errors to friendly UI copy.
   */
  const getErrorMessage = (error: any) => {
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('invalid login credentials')) {
      return {
        title: "Invalid credentials",
        description: "The email or password you entered is incorrect. Please check your details and try again."
      };
    } else if (errorMessage.includes('user already registered')) {
      return {
        title: "Account already exists",
        description: "An account with this email already exists. Please sign in instead or use a different email."
      };
    } else if (errorMessage.includes('email not confirmed')) {
      return {
        title: "Email not verified",
        description: "Please check your email and click the verification link before signing in."
      };
    } else if (errorMessage.includes('signup disabled')) {
      return {
        title: "Registration unavailable",
        description: "New account registration is currently disabled. Please contact support for assistance."
      };
    } else if (errorMessage.includes('rate limit')) {
      return {
        title: "Too many attempts",
        description: "Please wait a few minutes before trying again."
      };
    } else if (errorMessage.includes('weak password') || errorMessage.includes('password should contain')) {
      return {
        title: "Password requirements not met",
        description: "Your password must be at least 6 characters and include uppercase, lowercase, and number."
      };
    } else if (errorMessage.includes('invalid email')) {
      return {
        title: "Invalid email",
        description: "Please enter a valid email address."
      };
    } else {
      return {
        title: "Authentication error",
        description: error.message || "An unexpected error occurred. Please try again."
      };
    }
  };

  /**
   * mockSignUpWithEmail
   * Simulates a successful signup + immediate sign-in.
   */
  const mockSignUpWithEmail = async (email: string, password: string) => {
    await new Promise(res => setTimeout(res, 500));
    return { success: true, user: { id: 'user-static', email } };
  };

  /**
   * mockSignInWithEmail
   * Simulates a successful sign-in.
   */
  const mockSignInWithEmail = async (email: string, password: string) => {
    await new Promise(res => setTimeout(res, 400));
    if (email.toLowerCase() === 'error@example.com') {
      const err: any = new Error('Invalid login credentials');
      throw err;
    }
    return { success: true, user: { id: 'user-static', email } };
  };

  /**
   * mockSignInWithGoogle
   * Simulates Google OAuth start.
   */
  const mockSignInWithGoogle = async () => {
    await new Promise(res => setTimeout(res, 500));
    return { success: true };
  };
  const handleEmailAuth = async () => {
    setEmailError('');
    setPasswordError('');
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (isSignUp) {
      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        return;
      }
    } else {
      // For sign in, just check minimum length
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignUp) {
        console.log('Starting signup process for:', email);
        await mockSignUpWithEmail(email, password);
        console.log('Sign up successful - user will be automatically logged in');
        toast({
          title: "Welcome to GenuDo!",
          description: "Your account has been created and you're now signed in.",
          variant: "default"
        });
        navigate('/pipelines');
      } else {
        console.log('Starting signin process for:', email);
        await mockSignInWithEmail(email, password);
        console.log('Signin completed, redirecting to magic-pipeline');
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
          variant: "default"
        });
        navigate('/pipelines');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive"
      });

      // If it's a "user already registered" error, switch to sign in mode
      if (error.message?.toLowerCase().includes('user already registered')) {
        setIsSignUp(false);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      console.log('Starting Google authentication');
      await mockSignInWithGoogle();
      // Note: User will be redirected by Google OAuth flow
    } catch (error: any) {
      console.error('Google authentication error:', error);
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * handleMagicLink
   * Simulates sending a passwordless login link via email.
   */
  const handleMagicLink = async () => {
    setEmailError('');
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setMagicLinkLoading(true);
    try {
      console.log('Sending magic link to:', email);
      await new Promise(res => setTimeout(res, 500));
      console.log('Magic link sent successfully to:', email);
      toast({
        title: "Magic link sent!",
        description: "Check your email for a secure sign-in link",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive"
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  /**
   * handlePasswordReset
   * Simulates dispatching a password reset email.
   */
  const handlePasswordReset = async () => {
    setEmailError('');
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setMagicLinkLoading(true);
    try {
      console.log('Sending password reset to:', email);
      await new Promise(res => setTimeout(res, 500));
      console.log('Password reset sent successfully to:', email);
      toast({
        title: "Password reset sent!",
        description: "Check your email for password reset instructions",
        variant: "default"
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive"
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // Show forgot password form
  if (showForgotPassword) {
    return <div className="min-h-screen bg-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md bg-white border shadow-lg rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <img src="/genudo-main-logo.png" alt="GenuDo Logo" className="h-12 w-auto object-contain mx-auto mb-6" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-3">
                  Reset Password
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">Enter your email to receive secure reset instructions</p>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5 z-10" />
                  <Input type="email" placeholder="Enter your email" value={email} onChange={e => {
                  setEmail(e.target.value);
                  setEmailError('');
                }} className={`pl-12 h-14 bg-gray-50 border rounded-2xl text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${emailError ? 'ring-2 ring-red-500' : ''}`} />
                  {emailError && <p className="text-red-500 text-xs mt-2 ml-2">{emailError}</p>}
                </div>
                
                <Button onClick={handlePasswordReset} className="w-full h-14 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300" disabled={magicLinkLoading}>
                  {magicLinkLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>
                      <Shield className="mr-2 h-5 w-5" />
                      Send Reset Instructions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>}
                </Button>
                
                <Button variant="ghost" onClick={() => setShowForgotPassword(false)} className="w-full h-12 text-gray-600 hover:text-primary-600 rounded-2xl font-medium transition-all duration-300">
                  ← Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Main auth form
  return <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white border shadow-lg rounded-3xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <img src="/genudo-main-logo.png" alt="GenuDo Logo" className="h-16 w-auto object-contain mx-auto mb-6" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-3">
                {isSignUp ? 'Join GenuDo' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isSignUp ? 'Create your account and start building amazing pipelines' : 'Sign in to your agentic sales platform'}
              </p>
            </div>

            {/* Google Sign In Button */}
            <div className="mb-6">
              <Button onClick={handleGoogleAuth} disabled={googleLoading} variant="outline" className="w-full h-14 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50">
                {googleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> : <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>}
                Continue with Google
              </Button>
            </div>

            <div className="text-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5 z-10" />
                <Input type="email" placeholder="Enter your email" value={email} onChange={e => {
                setEmail(e.target.value);
                setEmailError('');
              }} className={`pl-12 h-14 bg-gray-50 border rounded-2xl text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${emailError ? 'ring-2 ring-red-500' : ''}`} />
                {emailError && <p className="text-red-500 text-xs mt-2 ml-2">{emailError}</p>}
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5 z-10" />
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => {
                setPassword(e.target.value);
                setPasswordError('');
              }} className={`pl-12 pr-12 h-14 bg-gray-50 border rounded-2xl text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${passwordError ? 'ring-2 ring-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors duration-200 z-10">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordError && <p className="text-red-500 text-xs mt-2 ml-2">{passwordError}</p>}
              </div>
              
              {!isSignUp && <div className="text-right">
                  <button onClick={() => setShowForgotPassword(true)} className="text-sm font-medium transition-colors duration-200 text-transparent">
                    Forgot password?
                  </button>
                </div>}
            </div>
            
            <Button onClick={handleEmailAuth} className="w-full h-14 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 mb-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>
                  {isSignUp ? <User className="mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>}
            </Button>
            
            <div className="text-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <Button onClick={handleMagicLink} disabled={magicLinkLoading} variant="outline" className="w-full h-14 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50">
                {magicLinkLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> : <Mail className="mr-2 h-5 w-5 text-primary-600" />}
                Login with Magic Link
              </Button>
            </div>
            
            <div className="text-center">
              <button onClick={() => {
                const newMode = !isSignUp;
                setIsSignUp(newMode);
                setPassword('');
                setPasswordError('');
                navigate(newMode ? '/sign-up' : '/log-in');
              }} className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AuthPage;

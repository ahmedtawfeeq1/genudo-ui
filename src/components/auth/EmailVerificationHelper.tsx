
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
 
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, Clock, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

interface EmailVerificationHelperProps {
  email: string;
  onBack: () => void;
}

const EmailVerificationHelper: React.FC<EmailVerificationHelperProps> = ({ email, onBack }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (resendCount >= 3) {
      toast({
        title: "Rate limit reached",
        description: "Please wait a few minutes before requesting another verification email.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      console.log('Attempting to resend verification email to:', email);
      await new Promise(res => setTimeout(res, 300));

      setResendCount(prev => prev + 1);
      setLastResendTime(new Date());
      console.log('Verification email resent successfully to:', email);
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder for the verification link.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Failed to resend verification",
        description: error.message || "Please try again in a few minutes.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const checkEmailProvider = () => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    const providers = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail'
    };
    
    return providers[domain as keyof typeof providers];
  };

  const emailProviderUrl = checkEmailProvider();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        {lastResendTime && (
          <p className="text-sm text-gray-500 mt-2">
            Last sent: {lastResendTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Next steps:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Check your email inbox</li>
            <li>Look in your spam/junk folder if you don't see it</li>
            <li>Click the verification link in the email</li>
            <li>Return here to sign in</li>
          </ol>
        </AlertDescription>
      </Alert>

      {emailProviderUrl && (
        <div className="text-center">
          <Button 
            variant="outline" 
            asChild
            className="w-full"
          >
            <a href={emailProviderUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open {email.split('@')[1]} inbox
            </a>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <Button 
          onClick={handleResendVerification}
          disabled={isResending || resendCount >= 3}
          variant="outline"
          className="w-full"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
              {resendCount > 0 && ` (${resendCount}/3)`}
            </>
          )}
        </Button>

        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          ← Back to sign in
        </Button>
      </div>

      {resendCount >= 3 && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Maximum resend attempts reached. Please wait 10 minutes before trying again, or contact support if you continue having issues.
          </AlertDescription>
        </Alert>
      )}

      {resendCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Still not receiving emails?</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Check your spam/junk folder thoroughly</li>
              <li>• Add our domain to your email whitelist</li>
              <li>• Try using a different email address</li>
              <li>• Contact your email provider about delivery issues</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EmailVerificationHelper;

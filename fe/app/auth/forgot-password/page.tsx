"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EmailInputStep from '../../../components/auth/resetPassword/emailInputStep';
import OtpVerificationStep from '../../../components/auth/resetPassword/otpInputStep';
import NewPasswordStep from '../../../components/auth/resetPassword/newPasswordStep';
import SuccessStep from '../../../components/auth/resetPassword/successStep';
import { Errors } from '@/types';

const MOCK_OTP = '123456';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [errors, setErrors] = useState<Errors>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async () => {
    setErrors({});
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(60);
    }, 1000);
  };

  const handleOtpSubmit = (otpCode: string = otp.join('')) => {
    setErrors({});
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' });
      return;
    }
    if (otpCode !== MOCK_OTP) {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
      return;
    }
    setStep(3);
  };

  const handlePasswordSubmit = async () => {
    setErrors({});
    if (!newPassword || newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    setCountdown(60);
    console.log('Resending OTP to:', email);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <EmailInputStep
            email={email}
            setEmail={setEmail}
            errors={errors}
            handleEmailSubmit={handleEmailSubmit}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <OtpVerificationStep
            otp={otp}
            setOtp={setOtp}
            email={email}
            errors={errors}
            countdown={countdown}
            handleResendOtp={handleResendOtp}
            handleOtpSubmit={handleOtpSubmit}
            otpRefs={otpRefs}
          />
        );
      case 3:
        return (
          <NewPasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            handlePasswordSubmit={handlePasswordSubmit}
            isLoading={isLoading}
          />
        );
      case 4:
        return <SuccessStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="glass-effect border-0 shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse mr-2" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Social Blog
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Reset your password securely ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {renderStep()}
            {step < 4 && (
              <div className="mt-6 text-center">
                <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
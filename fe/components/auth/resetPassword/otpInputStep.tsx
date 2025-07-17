import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OtpVerificationStepProps } from '@/types'
import { Mail } from 'lucide-react'

export default function OtpVerificationStep({
  otp,
  setOtp,
  email,
  errors,
  countdown,
  handleResendOtp,
  handleOtpSubmit,
  otpRefs,
}: OtpVerificationStepProps) {
  const MOCK_OTP = '123456'

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      handleOtpSubmit(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Enter Verification Code</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Demo code: <span className="font-mono bg-muted px-2 py-1 rounded">{MOCK_OTP}</span>
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                otpRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`w-12 h-12 text-center text-lg font-bold ${errors.otp ? 'border-red-500' : ''}`}
            />
          ))}
        </div>
        {errors.otp && <p className="text-sm text-red-500 text-center">{errors.otp}</p>}
        <Button
          onClick={() => handleOtpSubmit()}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          disabled={otp.some((digit) => digit === '')}
        >
          Verify Code
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button onClick={handleResendOtp} className="text-primary hover:underline">
                Resend Code
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

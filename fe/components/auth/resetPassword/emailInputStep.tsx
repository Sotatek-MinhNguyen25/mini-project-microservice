import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailInputStepProps } from '@/types';
import { Mail } from 'lucide-react';

export default function EmailInputStep({ email, setEmail, errors, handleEmailSubmit, isLoading }: EmailInputStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a verification code
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <Button
          onClick={handleEmailSubmit}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </div>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessStep() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Password Updated!</h2>
        <p className="text-muted-foreground">Your password has been successfully updated</p>
      </div>
      <Link href="/auth/login">
        <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
          Back to Login
        </Button>
      </Link>
    </div>
  );
}
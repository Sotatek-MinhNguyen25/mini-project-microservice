
import { useMutation } from "@tanstack/react-query";
import authService from "@/service/auth.service";
import { useToast } from "@/hooks/useToast";

interface ResetPasswordData {
  email: string;
}

interface ResetPasswordResponse {
  message: string;
  [key: string]: any;
}

interface MutationOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: unknown) => void;
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await authService.resetPassword(data.email);
      return response as ResetPasswordResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Success! 🎉",
        description: data.message || "A password reset link has been sent to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset link. Please try again.",
        variant: "destructive",
      });
    },
  });
}

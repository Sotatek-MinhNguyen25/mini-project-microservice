import { useMutation, useQueryClient } from '@tanstack/react-query'
import authService from '@/service/auth.service' 
import { useToast } from '@/hooks/useToast'
import { RegisterResponse, RegisterData } from '@/types/auth'

export function useRegister() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authService.register(data)
      return response as RegisterResponse
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] })
      toast({
        title: 'Success! 🎉',
        description: 'Your account has been created successfully! Please check your email to verify.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

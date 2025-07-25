'use client';

import adminService from '@/service/admin.service';
import { AUser } from '@/types/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from './useToast';

export type UserFilters = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  roles?: string;
  status?: string;
  oauthProvider?: string;
};

export function useUsers(initialFilters?: UserFilters) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    roles: '',
    status: '',
    ...initialFilters,
  });

  const fetchUsers = useQuery({
    queryKey: ['users', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const response = await adminService.getUsers(
        currentFilters as UserFilters,
      );
      return response; // Trả về toàn bộ response để truy cập data.data và data.meta
    },
    // select giúp biến đổi dữ liệu nhận được trước khi nó được lưu vào cache và trả về
    select: (response) => ({
      users: response.data.data,
      pagination: {
        page: response.data.meta.currentPage,
        limit: response.data.meta.pageSize,
        total: response.data.meta.totalItems,
        totalPages: response.data.meta.totalPages,
      },
    }),
  });

  const createUser = useMutation({
    mutationFn: async (
      userData: Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      return await adminService.createUser(userData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User created',
        description: 'User has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      userData,
    }: {
      id: string;
      userData: Partial<AUser>;
    }) => {
      const { password, ...rest } = userData;
      await adminService.updateUser(id, rest);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User updated',
        description: 'User has been updated successfully',
      });
    },

    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      return await adminService.deleteUser(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    users: fetchUsers.data?.users,
    loading: fetchUsers.isLoading,
    error: fetchUsers.error,
    pagination: fetchUsers.data?.pagination,
    filters,
    setFilters,
    fetchUsers: fetchUsers.refetch,
    createUser: createUser.mutateAsync,
    updateUser: updateUser.mutateAsync,
    deleteUser: deleteUser.mutateAsync,
  };
}

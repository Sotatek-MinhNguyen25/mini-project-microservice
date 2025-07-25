'use client';

import adminService from '@/service/admin.service';
import { AUser } from '@/types/admin';
import { useState, useEffect } from 'react';

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
  const [users, setUsers] = useState<AUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...initialFilters,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = async (newFilters?: Partial<UserFilters>) => {
    setLoading(true);
    setError(null);

    const appliedFilters = {
      ...filters,
      ...newFilters,
    };

    try {
      const response = await adminService.getUsers(appliedFilters);
      console.log('Fetched users:', response);
      if (response.statusCode === 200) {
        setUsers(response.data.data);
        setPagination({
          page: response.data.meta.currentPage,
          limit: response.data.meta.pageSize,
          total: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages,
        });
        setFilters(appliedFilters);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (
    userData: Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createUser(userData);
      console.log(response);
      const result: any = await response.data.data;

      if (response.status === 201) {
        await fetchUsers();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<AUser>) => {
    setLoading(true);
    setError(null);
    try {
      const { password, ...rest } = userData;
      const response = await adminService.updateUser(id, rest);
      // const response = await adminService.updateUser(id, userData);

      const result: any = await response.data.data;

      if (response.status === 200) {
        await fetchUsers();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteUser(id);
      console.log(response);
      if (response.status === 200) {
        await fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

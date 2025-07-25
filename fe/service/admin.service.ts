import { AxiosResponse } from 'axios';
import { deleteReq, get, patch, post } from '../lib/axiosClient';
import { getAuthorizationHeader } from '../utils/auth';
import {
  AUser,
  CreateUserResponse,
  DeleteUserResponse,
  GetUsersResponse,
  UpdateUserResponse,
} from '@/types/admin';
import { UserFilters } from '@/hooks/useUserManage';
import { Update } from 'next/dist/build/swc/types';

const adminService = {
  getUsers: async (filter: UserFilters): Promise<any> => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
    } = filter;
    const response: AxiosResponse<GetUsersResponse> = await get(
      `/users?search=${search}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      {
        headers: getAuthorizationHeader(),
      },
    );

    return response;
  },
  createUser: async (
    user: Omit<AUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<any> => {
    const response: AxiosResponse<CreateUserResponse> = await post(
      '/users',
      user,
      {
        headers: getAuthorizationHeader(),
      },
    );

    return response;
  },
  updateUser: async (id: string, user: Partial<AUser>): Promise<any> => {
    const response: AxiosResponse<UpdateUserResponse> = await patch(
      `/users/${id}`,
      user,
      {
        headers: getAuthorizationHeader(),
      },
    );

    return response;
  },
  deleteUser: async (id: string): Promise<any> => {
    const response: AxiosResponse<DeleteUserResponse> = await deleteReq(
      `/users/${id}`,
      {
        headers: getAuthorizationHeader(),
      },
    );

    return response;
  },
};

export default adminService;

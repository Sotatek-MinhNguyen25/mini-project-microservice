import { AxiosResponse } from 'axios';
import { get } from '../lib/axiosClient';
import { getAuthorizationHeader } from '../utils/auth';
import { GetUsersResponse } from '@/types/admin';
import { UserFilters } from '@/hooks/useUserManage';

const adminService = {
  getUsers: async (
    filter: UserFilters
  ): Promise<any> => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = filter;
    const response: AxiosResponse<GetUsersResponse> = await get(
      `/users?search=${search}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      {
        headers: getAuthorizationHeader(),
      },
    );

    return response;
  },
};

export default adminService;

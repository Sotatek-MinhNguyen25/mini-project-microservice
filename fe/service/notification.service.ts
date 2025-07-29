import { AxiosResponse } from 'axios';
import { get } from '../lib/axiosClient';

const NotiPrefix = '/notifications';

const notificationService = {
  getNotification: async (page: number = 1, limit: number = 10) => {
    const response: AxiosResponse = await get(
      `${NotiPrefix}?page=${page}&limit=${limit}`,
    );
    return response;
  },
};

export default notificationService;

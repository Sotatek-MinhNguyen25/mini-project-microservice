import { AxiosResponse } from 'axios';
import { get, put } from '../lib/axiosClient';

const NotiPrefix = '/notifications';

const notificationService = {
  getNotification: async (page: number = 1, limit: number = 10) => {
    const response: AxiosResponse = await get(
      `${NotiPrefix}?page=${page}&limit=${limit}`,
    );
    return response;
  },
  markAsReadID: async (notificationId: string) => {
    const response: AxiosResponse = await put(
      `${NotiPrefix}/${notificationId}`,
      {},
    );
    return response;
  },
  markAllAsRead: async () => {
    const response: AxiosResponse = await put(`${NotiPrefix}/mark/all`, {});
    return response;
  },
};

export default notificationService;

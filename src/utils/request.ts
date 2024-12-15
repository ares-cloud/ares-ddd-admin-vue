import NProgress from 'nprogress';
import { Message } from '@arco-design/web-vue';
import { getToken } from '@/utils/auth';
import { ApiResponse } from '@/types/api/base';
import { HttpOption } from '@/types/http';
import { useAppStore } from '@/store';

import $http from './http';

export const request = async <T>(
  url: string,
  option?: HttpOption & { loadingKey?: string }
): Promise<T> => {
  const appStore = useAppStore();
  const loadingKey = option?.loadingKey || 'global';

  try {
    NProgress.start();
    appStore.loading = true;

    const { method = 'GET', params, data } = option || {};
    const headers = {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    };

    const result = await $http.request<any, ApiResponse<T>>({
      url,
      method,
      params: method === 'GET' ? params : undefined,
      data: method !== 'GET' ? data : undefined,
      headers,
    });

    if (result.code === 200) {
      return result.data;
    }
    throw new Error(result.message);
  } catch (error: any) {
    Message.error(error.message || '请求失败');
    throw error;
  } finally {
    NProgress.done();
    appStore.loading = false;
  }
};

export default request;

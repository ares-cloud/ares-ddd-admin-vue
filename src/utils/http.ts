import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { Message } from '@arco-design/web-vue';
import type { ApiResponse } from '@/types/api/base';

const { VITE_API_BASE_URL, VITE_API_VERSION } = import.meta.env;

const http = axios.create({
  baseURL: `${VITE_API_BASE_URL}/${VITE_API_VERSION}`,
  timeout: 5000,
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;
    if (res.code === 401) {
      Message.error(res.message || '身份认证过期, 请重新登录');
      setTimeout(() => {
        localStorage.clear();
        window.location.reload();
      }, 2000);
      return Promise.reject(new Error(res.message || '身份认证过期'));
    }
    return res;
  },
  (error: AxiosError) => {
    Message.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default http;

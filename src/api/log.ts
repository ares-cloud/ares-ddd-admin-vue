import type { LogQueryParams, LogQueryResult } from '@/types/api/log';
import request from '@/utils/request';

export const logApi = {
  // 获取管理端日志列表
  getAdminLogList(params: LogQueryParams): Promise<LogQueryResult> {
    return request(`/sys/login-log/admin`, {
      method: 'GET',
      params,
    });
  },
  // 获取用户端日志列表
  getAppLogList(params: LogQueryParams): Promise<LogQueryResult> {
    return request(`/sys/login-log/app`, {
      method: 'GET',
      params,
    });
  },
};

export default logApi;

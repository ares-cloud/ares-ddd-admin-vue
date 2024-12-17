import { CaptchaResult, LoginData, LoginResult } from '@/types/api/auth';
import request from '@/utils/request';

const BASE_URL = '/auth';

export default {
  // 获取图形验证码
  getCaptcha: (): Promise<CaptchaResult> =>
    request(`${BASE_URL}/captcha`, {
      method: 'GET',
    }),

  // 用户登录
  login: (data: LoginData): Promise<LoginResult> =>
    request(`${BASE_URL}/login`, {
      method: 'POST',
      body: data,
    }),

  // 刷新令牌
  refreshToken: (refreshToken: string): Promise<LoginResult> =>
    request(`${BASE_URL}/refresh`, {
      method: 'POST',
      body: { refreshToken },
    }),
};

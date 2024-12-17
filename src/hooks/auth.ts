import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import authApi from '@/api/auth';
import { useAuthStore } from '@/hooks/store';
import { getToken, setToken, clearToken } from '@/utils/auth';
import emitter from '@/events/event-bus';
import { LoginData } from '@/types/api/auth';

export default function useAuth() {
  const router = useRouter();
  const { userStore, resetUserStore } = useAuthStore();
  const loading = ref(false);
  const { t } = useI18n();

  // 处理令牌刷新
  const handleRefreshToken = async (refreshToken: string) => {
    try {
      const res = await authApi.refreshToken(refreshToken);
      setToken(res.access_token, res.refresh_token);
      return true;
    } catch (err) {
      return false;
    }
  };
  // 处理登出
  const login = async (data: LoginData) => {
    await userStore.login(data);
    Message.success(t('login.form.login.success'));
    const { redirect, ...othersQuery } = router.currentRoute.value.query;
    await router.push({
      name: (redirect as string) || 'Workplace',
      query: {
        ...othersQuery,
      },
    });
  };

  // 处理登出
  const handleLogout = async () => {
    resetUserStore();
    clearToken();
    await router.push({ name: 'login' });
  };

  // 处理令牌过期
  const handleTokenExpired = async () => {
    const tokenInfo = getToken();
    if (!tokenInfo) {
      await handleLogout();
      return;
    }

    const success = await handleRefreshToken(tokenInfo.refresh_token);
    if (!success) {
      Message.error(t('login.error.expired'));
      await handleLogout();
    }
  };

  onMounted(() => {
    emitter.on('auth:token-expired', handleTokenExpired);
  });

  onUnmounted(() => {
    emitter.off('auth:token-expired', handleTokenExpired);
  });

  return {
    loading,
    login,
    handleLogout,
  };
}

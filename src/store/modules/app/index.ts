import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import type { RouteRecordNormalized } from 'vue-router';
import { markRaw } from 'vue';
import defaultSettings from '@/config/settings.json';
import userApi from '@/api/user';
import { PermissionTreeNode } from '@/types/api/authority';
import { AppState } from './types';

function convertToRoute(menu: PermissionTreeNode): RouteRecordNormalized {
  return markRaw({
    path: `/${menu.path}`,
    name: menu.code,
    // component: () => import(`@/views/${menu.component}.vue`),
    meta: {
      title: menu.name,
      icon: menu.icon,
      locale: menu.localize,
      requiresAuth: false,
      roles: menu.roles,
      permissions: menu.permissions,
    },
    children: menu.children?.map(convertToRoute),
  }) as unknown as RouteRecordNormalized;
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({ ...defaultSettings }),

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): RouteRecordNormalized[] {
      return state.serverMenu as unknown as RouteRecordNormalized[];
    },
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig() {
      let notifyInstance: NotificationReturn | null = null;
      try {
        notifyInstance = Notification.info({
          id: 'menuNotice',
          content: 'loading',
          closable: true,
        });
        const data = await userApi.getUserMenus();
        this.serverMenu = data.map(convertToRoute);
        notifyInstance = Notification.success({
          id: 'menuNotice',
          content: 'success',
          closable: true,
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: 'error',
          closable: true,
        });
      }
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
  },
});

export default useAppStore;

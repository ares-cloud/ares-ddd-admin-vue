import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const AUTHORITY: AppRouteRecordRaw = {
  path: '/authority',
  name: 'authority',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.authority',
    requiresAuth: true,
    icon: 'icon-settings',
    order: 7,
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/authority/user/index.vue'),
      meta: {
        locale: 'menu.authority.user',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'role',
      name: 'Role',
      component: () => import('@/views/authority/role/index.vue'),
      meta: {
        locale: 'menu.authority.role',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'permission',
      name: 'Permission',
      component: () => import('@/views/authority/permission/index.vue'),
      meta: {
        locale: 'menu.authority.permission',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'tenant',
      name: 'Tenant',
      component: () => import('@/views/authority/tenant/index.vue'),
      meta: {
        locale: 'menu.authority.tenant',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default AUTHORITY;

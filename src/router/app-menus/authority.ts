import { LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue';

export default {
  path: '/authority',
  name: 'authority',
  meta: {
    locale: 'menu.authority',
    requiresAuth: true,
    icon: SettingOutlined,
    order: 7
  },
  children: [
    // ... 其他已有菜单
    {
      path: '/authority/organization',
      name: 'organization',
      meta: {
        locale: 'menu.authority.organization',
        requiresAuth: true,
        icon: TeamOutlined, // 使用团队图标
        permissions: ['010601']
      }
    }
  ]
};

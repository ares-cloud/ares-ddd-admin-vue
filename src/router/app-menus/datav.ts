import { BarChartOutlined } from '@ant-design/icons-vue';

export default {
  path: '/datav',
  name: 'datav',
  meta: {
    locale: 'menu.datav',
    requiresAuth: true,
    icon: BarChartOutlined,
    order: 5
  },
  children: [
    {
      path: '/datav/editor',
      name: 'dataVEditor',
      meta: {
        locale: 'menu.datav.editor',
        requiresAuth: true
      }
    }
  ]
};

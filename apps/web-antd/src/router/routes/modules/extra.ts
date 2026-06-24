import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_ANTDV_NEXT_PREVIEW_URL,
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
  VBEN_TD_PREVIEW_URL,
} from '@vben/constants';
import { SvgAntdvNextLogoIcon, SvgTDesignIcon } from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

// "EXTRA" — a single collapsible group that holds the leftover Vben template
// demos (dashboards, component demos, project links, about), keeping the main
// sidebar focused on the Autest views. The Vben "Dashboard" group is flattened
// to Analytics/Workspace here to avoid a second "Dashboard" label.
const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:folder-cog',
      order: 9998,
      title: 'Extra',
    },
    name: 'Extra',
    path: '/extra',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          order: 0,
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          order: 1,
          title: $t('page.dashboard.workspace'),
        },
      },
      {
        meta: {
          icon: 'ic:baseline-view-in-ar',
          keepAlive: true,
          order: 2,
          title: $t('demos.title'),
        },
        name: 'Demos',
        path: '/demos',
        children: [
          {
            meta: {
              title: $t('demos.antd'),
            },
            name: 'AntDesignDemos',
            path: '/demos/ant-design',
            component: () => import('#/views/demos/antd/index.vue'),
          },
        ],
      },
      {
        meta: {
          badgeType: 'dot',
          icon: VBEN_LOGO_URL,
          order: 3,
          title: $t('demos.vben.title'),
        },
        name: 'VbenProject',
        path: '/vben-admin',
        children: [
          {
            name: 'VbenDocument',
            path: '/vben-admin/document',
            component: IFrameView,
            meta: {
              icon: 'lucide:book-open-text',
              link: VBEN_DOC_URL,
              title: $t('demos.vben.document'),
            },
          },
          {
            name: 'VbenGithub',
            path: '/vben-admin/github',
            component: IFrameView,
            meta: {
              icon: 'mdi:github',
              link: VBEN_GITHUB_URL,
              title: 'Github',
            },
          },
          {
            name: 'VbenAntdVNext',
            path: '/vben-admin/antdv-next',
            component: IFrameView,
            meta: {
              badgeType: 'dot',
              icon: SvgAntdvNextLogoIcon,
              link: VBEN_ANTDV_NEXT_PREVIEW_URL,
              title: $t('demos.vben.antdv-next'),
            },
          },
          {
            name: 'VbenNaive',
            path: '/vben-admin/naive',
            component: IFrameView,
            meta: {
              badgeType: 'dot',
              icon: 'logos:naiveui',
              link: VBEN_NAIVE_PREVIEW_URL,
              title: $t('demos.vben.naive-ui'),
            },
          },
          {
            name: 'VbenTDesign',
            path: '/vben-admin/tdesign',
            component: IFrameView,
            meta: {
              badgeType: 'dot',
              icon: SvgTDesignIcon,
              link: VBEN_TD_PREVIEW_URL,
              title: $t('demos.vben.tdesign'),
            },
          },
          {
            name: 'VbenElementPlus',
            path: '/vben-admin/ele',
            component: IFrameView,
            meta: {
              badgeType: 'dot',
              icon: 'logos:element',
              link: VBEN_ELE_PREVIEW_URL,
              title: $t('demos.vben.element-plus'),
            },
          },
        ],
      },
      {
        name: 'VbenAbout',
        path: '/vben-admin/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          order: 4,
          title: $t('demos.vben.about'),
        },
      },
    ],
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;

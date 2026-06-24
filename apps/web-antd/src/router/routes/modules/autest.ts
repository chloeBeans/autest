import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bug',
      order: 0,
      title: $t('autest.app.name'),
    },
    name: 'Autest',
    path: '/autest',
    redirect: '/autest/dashboard',
    children: [
      {
        name: 'AutestDashboard',
        path: '/autest/dashboard',
        component: () => import('#/views/autest/dashboard/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:layout-dashboard',
          title: $t('autest.nav.dashboard'),
        },
      },
      {
        name: 'AutestBugs',
        path: '/autest/bugs',
        component: () => import('#/views/autest/bugs/index.vue'),
        meta: {
          icon: 'lucide:bug',
          title: $t('autest.nav.bugs'),
        },
      },
      {
        name: 'AutestTests',
        path: '/autest/tests',
        component: () => import('#/views/autest/tests/index.vue'),
        meta: {
          icon: 'lucide:flask-conical',
          title: $t('autest.nav.tests'),
        },
      },
      {
        name: 'AutestBrs',
        path: '/autest/brs',
        component: () => import('#/views/autest/brs/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('autest.nav.brs'),
        },
      },
      {
        name: 'AutestSetup',
        path: '/autest/setup',
        component: () => import('#/views/autest/setup/index.vue'),
        meta: {
          icon: 'lucide:settings',
          title: $t('autest.nav.settings'),
        },
      },
    ],
  },
];

export default routes;

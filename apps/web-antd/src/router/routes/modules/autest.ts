import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// Autest app navigation — promoted to the top level of the sidebar so the five
// product views sit directly under the logo (no "Autest" group wrapper).
const routes: RouteRecordRaw[] = [
  {
    name: 'AutestDashboard',
    path: '/autest/dashboard',
    component: () => import('#/views/autest/dashboard/index.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:layout-dashboard',
      order: 0,
      title: $t('autest.nav.dashboard'),
    },
  },
  {
    name: 'AutestBugs',
    path: '/autest/bugs',
    component: () => import('#/views/autest/bugs/index.vue'),
    meta: {
      icon: 'lucide:bug',
      order: 1,
      title: $t('autest.nav.bugs'),
    },
  },
  {
    name: 'AutestTests',
    path: '/autest/tests',
    component: () => import('#/views/autest/tests/index.vue'),
    meta: {
      icon: 'lucide:flask-conical',
      order: 2,
      title: $t('autest.nav.tests'),
    },
  },
  {
    name: 'AutestBrs',
    path: '/autest/brs',
    component: () => import('#/views/autest/brs/index.vue'),
    meta: {
      icon: 'lucide:file-text',
      order: 3,
      title: $t('autest.nav.brs'),
    },
  },
  {
    name: 'AutestSetup',
    path: '/autest/setup',
    component: () => import('#/views/autest/setup/index.vue'),
    meta: {
      icon: 'lucide:settings',
      order: 4,
      title: $t('autest.nav.settings'),
    },
  },
  {
    name: 'AutestAdmin',
    path: '/autest/admin',
    meta: {
      // Admin-only group. Sits below the project-scoped views as its own
      // collapsible section so org-wide admin doesn't read as "part of the
      // current project". The authority gate hides the whole group (and its
      // children) from non-admins — mirrors the Extra group's structure.
      authority: ['admin', 'super'],
      icon: 'lucide:shield',
      order: 5,
      title: $t('autest.nav.admin'),
    },
    children: [
      {
        name: 'AutestManagement',
        path: '/autest/management',
        component: () => import('#/views/autest/management/index.vue'),
        meta: {
          authority: ['admin', 'super'],
          icon: 'lucide:sliders-horizontal',
          title: $t('autest.nav.management'),
        },
      },
    ],
  },
];

export default routes;

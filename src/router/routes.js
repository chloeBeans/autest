export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: 'Login' },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
      },
      {
        path: 'bugs',
        name: 'BugList',
        component: () => import('@/views/BugListView.vue'),
        meta: { title: 'Bugs', icon: 'mdi-bug-outline' },
      },
      {
        path: 'tests',
        name: 'Tests',
        component: () => import('@/views/TestsView.vue'),
        meta: { title: 'Tests', icon: 'mdi-flask-outline' },
      },
      {
        path: 'brs',
        name: 'Brs',
        component: () => import('@/views/BrsView.vue'),
        meta: { title: 'BRS', icon: 'mdi-file-document-outline' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: 'Settings', icon: 'mdi-cog-outline' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

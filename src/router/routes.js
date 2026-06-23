export const routes = [
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
        path: 'import',
        name: 'Import',
        component: () => import('@/views/ImportView.vue'),
        meta: { title: 'Import Bug List', icon: 'mdi-upload-outline' },
      },
      {
        path: 'bugs',
        name: 'BugList',
        component: () => import('@/views/BugListView.vue'),
        meta: { title: 'Bug List', icon: 'mdi-bug-outline' },
      },
      {
        path: 'folders',
        name: 'Folders',
        component: () => import('@/views/FoldersView.vue'),
        meta: { title: 'Portal Folders', icon: 'mdi-folder-cog-outline' },
      },
      {
        path: 'record',
        name: 'Record',
        component: () => import('@/views/RecordView.vue'),
        meta: { title: 'Record Test', icon: 'mdi-record-circle-outline' },
      },
      {
        path: 'add-test',
        name: 'AddTest',
        component: () => import('@/views/AddTestView.vue'),
        meta: { title: 'Add Test', icon: 'mdi-flask-outline' },
      },
      {
        path: 'brs',
        name: 'Brs',
        component: () => import('@/views/BrsView.vue'),
        meta: { title: 'BRS', icon: 'mdi-file-document-outline' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

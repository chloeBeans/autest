import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/projects';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(to => {
  const auth = useAuthStore();

  // Unauthenticated users may only see public routes.
  if (!to.meta?.public && !auth.isAuthenticated) {
    return { name: 'Login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined };
  }

  // Authenticated users skip the login page.
  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' };
  }

  // Keep the selected project valid for this user.
  if (auth.isAuthenticated) {
    useProjectStore().ensureValidSelection();
  }

  return true;
});

router.afterEach(to => {
  const base = import.meta.env.VITE_APP_TITLE || 'Autest';
  document.title = to.meta?.title ? `${to.meta.title} — ${base}` : base;
});

export default router;

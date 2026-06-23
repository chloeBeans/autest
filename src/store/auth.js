import { defineStore } from 'pinia';
import { useUserStore } from './users';

/**
 * Auth — who is logged in. Validates against the users store (mock data layer).
 * Swap `login` to hit a real `/auth/login` later without changing call sites.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null, // { username, name, role }
  }),
  getters: {
    isAuthenticated: state => !!state.currentUser,
    isAdmin: state => state.currentUser?.role === 'admin',
    username: state => state.currentUser?.username || '',
  },
  actions: {
    login(username, password) {
      const users = useUserStore();
      const user = users.validate(username, password);
      if (!user) throw new Error('Invalid username or password');
      this.currentUser = user;
      return user;
    },
    logout() {
      this.currentUser = null;
    },
  },
  persist: true,
});

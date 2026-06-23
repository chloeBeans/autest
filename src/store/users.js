import { defineStore } from 'pinia';

/**
 * Users — the mock data layer for accounts (persisted, source of truth for now).
 * A real backend would replace these reads/writes behind the same actions.
 *
 * Seeded with one admin and a few users. Passwords are plain here only because
 * this is a local mock; never do this against a real backend.
 */
export const useUserStore = defineStore('users', {
  state: () => ({
    users: [
      { username: 'admin', password: 'admin', name: 'Administrator', role: 'admin' },
      { username: 'qa1', password: 'qa1', name: 'QA One', role: 'user' },
      { username: 'qa2', password: 'qa2', name: 'QA Two', role: 'user' },
      { username: 'dev1', password: 'dev1', name: 'Dev One', role: 'user' },
    ],
  }),
  getters: {
    find: state => username => state.users.find(u => u.username === username),
    publicList: state => state.users.map(({ username, name, role }) => ({ username, name, role })),
  },
  actions: {
    addUser({ username, password, name, role = 'user' }) {
      const u = String(username || '').trim();
      if (!u) throw new Error('Username is required');
      if (this.users.some(x => x.username === u)) throw new Error('User already exists');
      this.users.push({ username: u, password: password || u, name: name || u, role });
    },
    // Returns the public user shape on success, null otherwise.
    validate(username, password) {
      const u = this.users.find(x => x.username === username && x.password === password);
      return u ? { username: u.username, name: u.name, role: u.role } : null;
    },
  },
  persist: true,
});

import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    drawer: true,
    lang: localStorage.getItem('app-lang') || 'en',
  }),
  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    setLang(lang) {
      this.lang = lang;
      localStorage.setItem('app-lang', lang);
    },
  },
  persist: true,
});

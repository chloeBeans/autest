import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    color: 'success',
    timeout: 3500,
  }),
  actions: {
    notify(message, color = 'success', timeout = 3500) {
      this.message = message;
      this.color = color;
      this.timeout = timeout;
      this.show = true;
    },
    success(message) {
      this.notify(message, 'success');
    },
    error(message) {
      this.notify(message, 'error', 6000);
    },
    warning(message) {
      this.notify(message, 'warning', 5000);
    },
    info(message) {
      this.notify(message, 'info');
    },
  },
});

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue';
import router from './router';
import i18n from './locales';

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import '@/style.css';

// Globally-registered shared components (same convention as the reference portal).
import PageHeader from '@/components/ui/PageHeader.vue';
import Card from '@/components/container/Card.vue';
import Tabs from '@/components/container/Tabs.vue';
import FormButton from '@/components/FormButton.vue';
import Badge from '@/components/ui/Badge.vue';
import DataTable from '@/components/table/DataTable.vue';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1565c0',
          secondary: '#5e35b1',
          success: '#2e7d32',
          warning: '#ed6c02',
          error: '#c62828',
          info: '#0277bd',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VTextField: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
  },
});

window.$t = i18n.global.t;

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vuetify);

app.component('PageHeader', PageHeader);
app.component('Card', Card);
app.component('Tabs', Tabs);
app.component('FormButton', FormButton);
app.component('Badge', Badge);
app.component('DataTable', DataTable);

app.mount('#app');

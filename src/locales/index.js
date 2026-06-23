import { createI18n } from 'vue-i18n';
import en from './en.json';
import bm from './bm.json';

const savedLang = localStorage.getItem('app-lang');
const initialLocale = savedLang === 'en' || savedLang === 'bm' ? savedLang : 'en';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { en, bm },
});

export default i18n;
export const t = i18n.global.t;

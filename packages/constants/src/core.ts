/**
 * @zh_CN 登录页面 url 地址
 */
export const LOGIN_PATH = '/auth/login';

/**
 * Default landing page after login (the Autest dashboard).
 *
 * Used directly by the router/auth code instead of `preferences.app.defaultHomePath`
 * because preferences are cached in localStorage (defu merge is first-wins, so a
 * stale cached value would override the code default and keep sending users to the
 * old `/analytics` page). Routing the landing through this constant makes it
 * deterministic regardless of any cached preferences.
 */
export const DEFAULT_HOME_PATH = '/autest/dashboard';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'ms-MY' | 'zh-CN';
}

/**
 * Supported languages
 * @remarks zh-CN locale files are kept for the framework but intentionally
 * omitted here so only English and Bahasa Melayu appear in the switcher.
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Bahasa Melayu',
    value: 'ms-MY',
  },
];

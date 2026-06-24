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
  value: 'en-US' | 'zh-CN';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];

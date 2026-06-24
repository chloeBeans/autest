import { DEFAULT_HOME_PATH } from '@vben/constants';
import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // Land users on the Autest dashboard after login; the framework default is
    // the Vben "/analytics" demo page. The router/auth code reads DEFAULT_HOME_PATH
    // directly (see @vben/constants) so a stale cached preference can't override it.
    defaultHomePath: DEFAULT_HOME_PATH,
    locale: 'en-US',
  },
  logo: {
    // Autest smiling-robot brand mark (public/logo.svg) — replaces the Vben default.
    source: '/logo.svg',
  },
  // theme: { colorPrimary: '...' },  // TODO: set Autest brand color once decided
});

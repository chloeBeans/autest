import type { Recordable, UserInfo } from '@vben/types';

import type { Account } from '#/types/domain';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { $t } from '#/locales';
import { useAccountStore } from '#/store/accounts';

/**
 * Auth store — fully client-side (no backend). Validates credentials against the
 * accounts store, sets a mock access token so Vben's router guard lets the user
 * in, and rebuilds the user from the persisted username on refresh.
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const accountStore = useAccountStore();
    const router = useRouter();

    const loginLoading = ref(false);
    // Persisted so the session survives a page refresh without a backend call.
    const currentUsername = ref<string>('');

    function toUserInfo(account: Account): UserInfo {
      return {
        avatar: '',
        desc: '',
        homePath: account.homePath || preferences.app.defaultHomePath,
        realName: account.realName,
        roles: account.roles,
        token: `mock-${account.username}`,
        userId: account.username,
        username: account.username,
      };
    }

    async function authLogin(
      params: Recordable<any>,
      onSuccess?: () => Promise<void> | void,
    ) {
      let userInfo: null | UserInfo = null;
      try {
        loginLoading.value = true;
        const account = accountStore.validate(params.username, params.password);
        if (!account) {
          throw new Error($t('autest.auth.invalid'));
        }

        currentUsername.value = account.username;
        accessStore.setAccessToken(`mock-${account.username}`);

        userInfo = toUserInfo(account);
        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(account.roles);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      } finally {
        loginLoading.value = false;
      }

      return { userInfo };
    }

    async function logout(redirect: boolean = true) {
      // Reset only the session — keep the client-side project/bug/BRS data so it
      // survives logout (a different user sees only their own via membership).
      accessStore.$reset();
      userStore.$reset();
      currentUsername.value = '';

      await router.replace({
        path: LOGIN_PATH,
        query: redirect
          ? { redirect: encodeURIComponent(router.currentRoute.value.fullPath) }
          : {},
      });
    }

    async function fetchUserInfo(): Promise<UserInfo> {
      // Rebuild from the persisted username (no backend round-trip). If the
      // persisted session is somehow invalid, clear it so the guard bails to login.
      const account = accountStore.getAccount(currentUsername.value);
      if (!account) {
        accessStore.$reset();
        throw new Error($t('autest.auth.invalid'));
      }
      const userInfo = toUserInfo(account);
      userStore.setUserInfo(userInfo);
      return userInfo;
    }

    function $reset() {
      loginLoading.value = false;
    }

    return {
      $reset,
      authLogin,
      currentUsername,
      fetchUserInfo,
      loginLoading,
      logout,
    };
  },
  { persist: { pick: ['currentUsername'] } },
);

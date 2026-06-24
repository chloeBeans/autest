<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';
import { useAccountStore } from '#/store/accounts';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const accountStore = useAccountStore();

const formSchema = computed((): VbenFormSchema[] => {
  // Quick-login options sourced from the real seeded accounts, so picking one
  // auto-fills credentials that actually validate. (The stock Vben demo filled
  // vben/jack/123456 — accounts that don't exist here — which broke login.)
  const accountOptions: BasicOption[] = accountStore.accounts.map((a) => ({
    label: a.realName ? `${a.realName} (${a.username})` : a.username,
    value: a.username,
  }));

  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: accountOptions,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z.string().optional(),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        trigger(values, form) {
          const account = accountStore.getAccount(values.selectAccount);
          if (account) {
            form.setValues({
              password: account.password,
              username: account.username,
            });
          }
        },
        triggerFields: ['selectAccount'],
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-forget-password="false"
    :show-qrcode-login="false"
    :show-register="false"
    :show-third-party-login="false"
    @submit="authStore.authLogin"
  />
</template>

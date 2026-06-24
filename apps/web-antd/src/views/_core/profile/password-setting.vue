<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: $t('page.profile.password.oldPassword.label'),
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('page.profile.password.oldPassword.placeholder'),
      },
    },
    {
      fieldName: 'newPassword',
      label: $t('page.profile.password.newPassword.label'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.password.newPassword.placeholder'),
      },
    },
    {
      fieldName: 'confirmPassword',
      label: $t('page.profile.password.confirmPassword.label'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.password.confirmPassword.placeholder'),
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({
              required_error: $t(
                'page.profile.password.confirmPassword.requiredError',
              ),
            })
            .min(1, {
              message: $t('page.profile.password.confirmPassword.minError'),
            })
            .refine((value) => value === newPassword, {
              message: $t('page.profile.password.confirmPassword.mismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

function handleSubmit() {
  message.success($t('page.profile.password.submitSuccess'));
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-1/3"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';

import { $t } from '#/locales';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.security.accountPassword.label'),
      description: $t('page.profile.security.accountPassword.description'),
    },
    {
      value: true,
      fieldName: 'securityPhone',
      label: $t('page.profile.security.securityPhone.label'),
      description: $t('page.profile.security.securityPhone.description'),
    },
    {
      value: true,
      fieldName: 'securityQuestion',
      label: $t('page.profile.security.securityQuestion.label'),
      description: $t('page.profile.security.securityQuestion.description'),
    },
    {
      value: true,
      fieldName: 'securityEmail',
      label: $t('page.profile.security.securityEmail.label'),
      description: $t('page.profile.security.securityEmail.description'),
    },
    {
      value: false,
      fieldName: 'securityMfa',
      label: $t('page.profile.security.securityMfa.label'),
      description: $t('page.profile.security.securityMfa.description'),
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>

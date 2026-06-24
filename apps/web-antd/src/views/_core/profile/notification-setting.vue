<script setup lang="ts">
import { computed } from 'vue';

import { ProfileNotificationSetting } from '@vben/common-ui';

import { $t } from '#/locales';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.notice.accountPassword.label'),
      description: $t('page.profile.notice.accountPassword.description'),
    },
    {
      value: true,
      fieldName: 'systemMessage',
      label: $t('page.profile.notice.systemMessage.label'),
      description: $t('page.profile.notice.systemMessage.description'),
    },
    {
      value: true,
      fieldName: 'todoTask',
      label: $t('page.profile.notice.todoTask.label'),
      description: $t('page.profile.notice.todoTask.description'),
    },
  ];
});
</script>
<template>
  <ProfileNotificationSetting :form-schema="formSchema" />
</template>

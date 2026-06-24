<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { Empty } from 'ant-design-vue';

import { $t } from '#/locales';
</script>

<template>
  <Page :title="$t('autest.brs.title')">
    <Empty description="BRS tracker — building next." />
  </Page>
</template>

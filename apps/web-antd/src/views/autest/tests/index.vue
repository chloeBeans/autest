<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { Empty } from 'ant-design-vue';

import { $t } from '#/locales';
</script>

<template>
  <Page
    :title="$t('autest.tests.title')"
    :description="$t('autest.tests.subtitle')"
  >
    <Empty
      description="Tests (record / build / code / Test IDs guide) — building next."
    />
  </Page>
</template>

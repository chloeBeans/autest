<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Card, Col, Progress, Row, Statistic, Tag } from 'ant-design-vue';

import { $t } from '#/locales';
import { useBrsStore } from '#/store/brs';
import { useBugStore } from '#/store/bugs';
import { useFolderStore } from '#/store/folders';
import { useProjectStore } from '#/store/projects';
import { PORTALS } from '#/utils/constants';

const router = useRouter();
const userStore = useUserStore();
const projectStore = useProjectStore();
const bugStore = useBugStore();
const brsStore = useBrsStore();
const folderStore = useFolderStore();

const greeting = computed(
  () =>
    `${$t('autest.dashboard.hello')}, ${userStore.userInfo?.realName ?? ''}`,
);

const steps = [
  { key: 'step1', to: '/autest/bugs' },
  { key: 'step2', to: '/autest/setup' },
  { key: 'step3', to: '/autest/tests' },
  { key: 'step4', to: '/autest/brs' },
];

function folderState(portal: string) {
  return folderStore.isConnected(portal)
    ? $t('autest.folders.connected')
    : $t('autest.folders.notConnected');
}
</script>

<template>
  <Page
    :title="greeting"
    :description="
      projectStore.currentProject
        ? `${$t('autest.settings.project')}: ${projectStore.currentProject.name}`
        : $t('autest.app.tagline')
    "
  >
    <Row :gutter="[16, 16]">
      <Col :md="6" :xs="12">
        <Card>
          <Statistic
            :title="$t('autest.general.all')"
            :value="bugStore.counts.all"
          />
        </Card>
      </Col>
      <Col :md="6" :xs="12">
        <Card>
          <Statistic
            :title="$t('autest.general.external')"
            :value="bugStore.counts.external"
          />
        </Card>
      </Col>
      <Col :md="6" :xs="12">
        <Card>
          <Statistic
            :title="$t('autest.general.internal')"
            :value="bugStore.counts.internal"
          />
        </Card>
      </Col>
      <Col :md="6" :xs="12">
        <Card>
          <Statistic
            title="BRS done"
            :value="brsStore.progress.done"
            :suffix="`/ ${brsStore.progress.total}`"
          />
        </Card>
      </Col>
    </Row>

    <Row :gutter="[16, 16]" class="mt-4">
      <Col :md="14" :xs="24">
        <Card :title="$t('autest.dashboard.gettingStarted')">
          <div
            v-for="(step, i) in steps"
            :key="step.key"
            class="step-row"
            @click="router.push(step.to)"
          >
            <span class="step-index">{{ i + 1 }}</span>
            <span>{{ $t(`autest.dashboard.${step.key}`) }}</span>
            <span class="step-arrow">→</span>
          </div>
        </Card>
      </Col>
      <Col :md="10" :xs="24">
        <Card :title="$t('autest.folders.title')">
          <div class="folder-line">
            <span>{{ $t('autest.general.external') }}</span>
            <Tag
              :color="
                folderStore.isConnected(PORTALS.EXTERNAL)
                  ? 'success'
                  : 'default'
              "
            >
              {{ folderState(PORTALS.EXTERNAL) }}
            </Tag>
          </div>
          <div class="folder-line">
            <span>{{ $t('autest.general.internal') }}</span>
            <Tag
              :color="
                folderStore.isConnected(PORTALS.INTERNAL)
                  ? 'success'
                  : 'default'
              "
            >
              {{ folderState(PORTALS.INTERNAL) }}
            </Tag>
          </div>
          <Progress
            v-if="brsStore.progress.total"
            :percent="brsStore.progress.pct"
            size="small"
            class="mt-2"
          />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped>
.mt-2 {
  margin-top: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.step-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  cursor: pointer;
  border-bottom: 1px solid hsl(var(--border));
}
.step-row:hover {
  color: hsl(var(--primary));
}
.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-size: 12px;
}
.step-arrow {
  margin-left: auto;
  opacity: 0.5;
}
.folder-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}
</style>

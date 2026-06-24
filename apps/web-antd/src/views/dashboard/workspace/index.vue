<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();

// Sample data — adjust to your real project.
// The url can also be an internal route, handled in navTo for internal navigation.
// e.g. url: /dashboard/workspace
const projectItems = computed<WorkbenchProjectItem[]>(() => [
  {
    color: '',
    content: $t('page.workspace.projects.github.content'),
    date: '2021-04-01',
    group: $t('page.workspace.projects.github.group'),
    icon: 'carbon:logo-github',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: $t('page.workspace.projects.vue.content'),
    date: '2021-04-01',
    group: $t('page.workspace.projects.vue.group'),
    icon: 'ion:logo-vue',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: $t('page.workspace.projects.html5.content'),
    date: '2021-04-01',
    group: $t('page.workspace.projects.html5.group'),
    icon: 'ion:logo-html5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: $t('page.workspace.projects.angular.content'),
    date: '2021-04-01',
    group: 'UI',
    icon: 'ion:logo-angular',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: $t('page.workspace.projects.react.content'),
    date: '2021-04-01',
    group: $t('page.workspace.projects.react.group'),
    icon: 'bx:bxl-react',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#EBD94E',
    content: $t('page.workspace.projects.js.content'),
    date: '2021-04-01',
    group: $t('page.workspace.projects.js.group'),
    icon: 'ion:logo-javascript',
    title: 'Js',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  },
]);

// Likewise, these urls can be external links starting with http.
const quickNavItems = computed<WorkbenchQuickNavItem[]>(() => [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: $t('page.workspace.quickNav.home'),
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: $t('page.workspace.quickNav.dashboard'),
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: $t('page.workspace.quickNav.components'),
    url: '/demos/features/icons',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    // Example URL — adjust to your real project.
    title: $t('page.workspace.quickNav.systemManagement'),
    url: '/demos/features/login-expired',
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: $t('page.workspace.quickNav.permissionManagement'),
    url: '/demos/access/page-control',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: $t('page.workspace.quickNav.charts'),
    url: '/analytics',
  },
]);

const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: $t('page.workspace.todo.reviewFrontendCode.content'),
    date: '2024-07-30 11:00:00',
    title: $t('page.workspace.todo.reviewFrontendCode.title'),
  },
  {
    completed: true,
    content: $t('page.workspace.todo.optimizePerformance.content'),
    date: '2024-07-30 11:00:00',
    title: $t('page.workspace.todo.optimizePerformance.title'),
  },
  {
    completed: false,
    content: $t('page.workspace.todo.securityCheck.content'),
    date: '2024-07-30 11:00:00',
    title: $t('page.workspace.todo.securityCheck.title'),
  },
  {
    completed: false,
    content: $t('page.workspace.todo.updateDependencies.content'),
    date: '2024-07-30 11:00:00',
    title: $t('page.workspace.todo.updateDependencies.title'),
  },
  {
    completed: false,
    content: $t('page.workspace.todo.fixUiIssue.content'),
    date: '2024-07-30 11:00:00',
    title: $t('page.workspace.todo.fixUiIssue.title'),
  },
]);
const trendItems = computed<WorkbenchTrendItem[]>(() => [
  {
    avatar: 'svg:avatar-1',
    content: $t('page.workspace.trends.createdProject.content'),
    date: $t('page.workspace.trends.justNow'),
    title: $t('page.workspace.trends.william'),
  },
  {
    avatar: 'svg:avatar-2',
    content: $t('page.workspace.trends.followed.content'),
    date: $t('page.workspace.trends.oneHourAgo'),
    title: $t('page.workspace.trends.ewen'),
  },
  {
    avatar: 'svg:avatar-3',
    content: $t('page.workspace.trends.publishedStatus.content'),
    date: $t('page.workspace.trends.oneDayAgo'),
    title: $t('page.workspace.trends.chris'),
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.workspace.trends.publishedArticleVite.content'),
    date: $t('page.workspace.trends.twoDaysAgo'),
    title: 'Vben',
  },
  {
    avatar: 'svg:avatar-1',
    content: $t('page.workspace.trends.repliedQuestion.content'),
    date: $t('page.workspace.trends.threeDaysAgo'),
    title: $t('page.workspace.trends.pete'),
  },
  {
    avatar: 'svg:avatar-2',
    content: $t('page.workspace.trends.closedIssue.content'),
    date: $t('page.workspace.trends.oneWeekAgo'),
    title: $t('page.workspace.trends.jack'),
  },
  {
    avatar: 'svg:avatar-3',
    content: $t('page.workspace.trends.publishedStatus.content'),
    date: $t('page.workspace.trends.oneWeekAgo'),
    title: $t('page.workspace.trends.william'),
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.workspace.trends.pushedCode.content'),
    date: '2021-04-01 20:00',
    title: $t('page.workspace.trends.william'),
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.workspace.trends.publishedArticleVben.content'),
    date: '2021-03-01 20:00',
    title: 'Vben',
  },
]);

const router = useRouter();

// This is a sample method, adjust according to the actual project requirements.
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        {{
          $t('page.workspace.header.greeting', {
            name: userStore.userInfo?.realName,
          })
        }}
      </template>
      <template #description>
        {{ $t('page.workspace.header.weather') }}
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject
          :items="projectItems"
          :title="$t('page.workspace.cards.project')"
          @click="navTo"
        />
        <WorkbenchTrends
          :items="trendItems"
          class="mt-5"
          :title="$t('page.workspace.cards.latestActivity')"
        />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          :title="$t('page.workspace.cards.quickNav')"
          @click="navTo"
        />
        <WorkbenchTodo
          :items="todoItems"
          class="mt-5"
          :title="$t('page.workspace.cards.todo')"
        />
        <AnalysisChartCard
          class="mt-5"
          :title="$t('page.workspace.cards.visitsSource')"
        >
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import ProjectSwitcher from '@/components/layout/ProjectSwitcher.vue';

const ui = useUiStore();
const auth = useAuthStore();
const router = useRouter();
const { locale } = useI18n();

const toggleLang = () => {
  const next = locale.value === 'en' ? 'bm' : 'en';
  locale.value = next;
  ui.setLang(next);
};

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <v-app-bar flat border="b" color="white" height="60">
    <v-app-bar-nav-icon @click="ui.toggleDrawer" />
    <div class="d-flex align-center ga-2">
      <v-icon icon="mdi-robot-happy-outline" color="primary" />
      <span class="text-h6 font-weight-bold d-none d-sm-inline">{{ $t('app.name') }}</span>
    </div>

    <v-spacer />

    <ProjectSwitcher class="mr-2" />

    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="text-none">
          <v-avatar size="28" color="primary" class="mr-2">
            <span class="text-caption">{{ (auth.username[0] || '?').toUpperCase() }}</span>
          </v-avatar>
          <span class="d-none d-sm-inline">{{ auth.currentUser?.name || auth.username }}</span>
        </v-btn>
      </template>
      <v-list density="comfortable" min-width="200">
        <v-list-item :title="auth.currentUser?.name || auth.username" :subtitle="auth.username">
          <template #append>
            <Badge :variant="auth.isAdmin ? 'purple' : 'grey'">{{ auth.currentUser?.role }}</Badge>
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item
          prepend-icon="mdi-translate"
          :title="$t('settings.language')"
          @click="toggleLang"
        >
          <template #append>
            <Badge variant="blue">{{ locale === 'en' ? 'EN' : 'BM' }}</Badge>
          </template>
        </v-list-item>
        <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout" />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/store/ui';

const ui = useUiStore();
const { locale } = useI18n();

const toggleLang = () => {
  const next = locale.value === 'en' ? 'bm' : 'en';
  locale.value = next;
  ui.setLang(next);
};
</script>

<template>
  <v-app-bar flat border="b" color="white" height="60">
    <v-app-bar-nav-icon @click="ui.toggleDrawer" />
    <div class="d-flex align-center ga-2">
      <v-icon icon="mdi-robot-happy-outline" color="primary" />
      <span class="text-h6 font-weight-bold">{{ $t('app.name') }}</span>
      <span class="text-caption text-medium-emphasis d-none d-sm-inline">
        — {{ $t('app.tagline') }}
      </span>
    </div>
    <v-spacer />
    <v-btn variant="tonal" size="small" @click="toggleLang">
      {{ locale === 'en' ? 'BM' : 'EN' }}
    </v-btn>
  </v-app-bar>
</template>

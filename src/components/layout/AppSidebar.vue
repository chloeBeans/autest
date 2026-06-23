<script setup>
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/store/ui';
import { useBugStore } from '@/store/bugs';

const ui = useUiStore();
const { drawer } = storeToRefs(ui);
const bugStore = useBugStore();

const items = [
  { to: '/', icon: 'mdi-view-dashboard-outline', key: 'dashboard' },
  { to: '/bugs', icon: 'mdi-bug-outline', key: 'bugs' },
  { to: '/tests', icon: 'mdi-flask-outline', key: 'tests' },
  { to: '/brs', icon: 'mdi-file-document-outline', key: 'brs' },
  { to: '/settings', icon: 'mdi-cog-outline', key: 'settings' },
];
</script>

<template>
  <v-navigation-drawer v-model="drawer" color="grey-lighten-5" width="248">
    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        exact
        :prepend-icon="item.icon"
        :title="$t(`nav.${item.key}`)"
        rounded="lg"
      >
        <template v-if="item.key === 'bugs' && bugStore.counts.all" #append>
          <v-chip size="x-small" color="primary" variant="tonal">
            {{ bugStore.counts.all }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

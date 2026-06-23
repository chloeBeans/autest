<script setup>
import { RouterView } from 'vue-router';
import AppToast from '@/components/ui/AppToast.vue';
</script>

<template>
  <v-app>
    <RouterView />
    <AppToast />
  </v-app>
</template>

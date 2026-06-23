<script setup>
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/store/toast';

const toast = useToastStore();
const { show, message, color, timeout } = storeToRefs(toast);
</script>

<template>
  <v-snackbar v-model="show" :color="color" :timeout="timeout" location="top right">
    {{ message }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" @click="show = false" />
    </template>
  </v-snackbar>
</template>

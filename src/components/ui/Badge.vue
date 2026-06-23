<!--
USAGE

<Badge variant="green">Active</Badge>
<Badge :color="customColor">{{ label }}</Badge>

PROPS:
variant: "green" | "red" | "yellow" | "blue" | "grey" | "purple"
-->

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: String, default: 'grey' },
});

const color = computed(() => {
  const map = {
    green: 'success',
    red: 'error',
    yellow: 'warning',
    blue: 'info',
    purple: 'secondary',
    grey: 'grey',
  };
  return map[props.variant] || 'grey';
});
</script>

<template>
  <v-chip :color="color" size="small" variant="tonal" label>
    <slot></slot>
  </v-chip>
</template>

<!--
USAGE

<FormButton
  size="md"               // optional - md (default) | lg
  variant="primary"       // optional - primary | green | red | yellow | line-primary | line-secondary
  prependIcon="mdi-plus"  // optional - mdi icon name
  appendIcon="mdi-magnify"
  :loading="false"
  :disabled="false"
  :block="false"
  @click="handleClick"
>
  Button Text
</FormButton>
-->

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'primary' },
  prependIcon: { type: String, default: null },
  appendIcon: { type: String, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
});

defineEmits(['click']);

// Map the reference variant vocabulary onto Vuetify color + style.
const config = computed(() => {
  const map = {
    primary: { color: 'primary', variant: 'flat' },
    green: { color: 'success', variant: 'flat' },
    red: { color: 'error', variant: 'flat' },
    yellow: { color: 'warning', variant: 'flat' },
    'line-primary': { color: 'primary', variant: 'outlined' },
    'line-secondary': { color: 'grey-darken-1', variant: 'outlined' },
  };
  return map[props.variant] || map.primary;
});
</script>

<template>
  <v-btn
    :color="config.color"
    :variant="config.variant"
    :size="size === 'lg' ? 'large' : 'default'"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    class="text-none"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </v-btn>
</template>

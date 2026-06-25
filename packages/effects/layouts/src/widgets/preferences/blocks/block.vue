<script setup lang="ts">
interface Props {
  title?: string;
}

defineOptions({
  name: 'PreferenceBlock',
});

withDefaults(defineProps<Props>(), {
  title: '',
});
</script>

<template>
  <div
    class="bg-card border-border/60 mb-3 flex flex-col rounded-xl border px-2 pb-2 pt-3"
  >
    <h3
      class="text-foreground mb-1.5 px-1 text-[13px] font-semibold leading-none tracking-tight"
    >
      {{ title }}
    </h3>
    <div class="flex flex-col">
      <slot></slot>
    </div>
  </div>
</template>

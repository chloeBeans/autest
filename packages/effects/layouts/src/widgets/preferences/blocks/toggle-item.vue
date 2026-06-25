<script setup lang="ts">
import type { SelectOption } from '@vben/types';

import { ToggleGroup, ToggleGroupItem } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'PreferenceToggleItem',
});

withDefaults(defineProps<{ disabled?: boolean; items?: SelectOption[] }>(), {
  disabled: false,
  items: () => [],
});

const modelValue = defineModel<string>();
</script>

<template>
  <div
    :class="{
      'pointer-events-none opacity-50': disabled,
    }"
    class="hover:bg-accent/60 my-0.5 flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors"
    disabled
  >
    <span class="text-foreground/90 min-w-0 flex-1 text-sm leading-snug">
      <slot></slot>
    </span>
    <ToggleGroup
      v-model="modelValue"
      class="gap-2"
      size="sm"
      type="single"
      variant="outline"
    >
      <template v-for="item in items" :key="item.value">
        <ToggleGroupItem
          :value="item.value"
          class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-7 rounded-sm"
        >
          {{ item.label }}
        </ToggleGroupItem>
      </template>
    </ToggleGroup>
  </div>
</template>

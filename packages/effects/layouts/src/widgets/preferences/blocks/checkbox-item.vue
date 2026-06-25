<script setup lang="ts">
import type { SelectOption } from '@vben/types';

import { useSlots } from 'vue';

import { CircleHelp } from '@vben/icons';

import { VbenCheckButtonGroup, VbenTooltip } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'PreferenceCheckboxItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: SelectOption[];
    multiple?: boolean;
    onBtnClick?: (value: string) => void;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: '',
    items: () => [],
    onBtnClick: () => {},
    multiple: false,
  },
);

const inputValue = defineModel<string[]>();

const slots = useSlots();
</script>

<template>
  <div
    :class="{
      'hover:bg-accent/60': !slots.tip,
      'pointer-events-none opacity-50': disabled,
    }"
    class="my-0.5 flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 transition-colors"
  >
    <span
      class="text-foreground/90 flex min-w-0 flex-1 items-center text-sm leading-snug"
    >
      <slot></slot>

      <VbenTooltip v-if="slots.tip" side="bottom">
        <template #trigger>
          <CircleHelp class="ml-1 size-3 cursor-help" />
        </template>
        <slot name="tip"></slot>
      </VbenTooltip>
    </span>
    <VbenCheckButtonGroup
      v-model="inputValue"
      class="h-8 w-[165px]"
      :options="items"
      :disabled="disabled"
      :multiple="multiple"
      @btn-click="onBtnClick"
    />
  </div>
</template>

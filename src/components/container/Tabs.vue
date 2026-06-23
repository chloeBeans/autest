<!--
USAGE

<Tabs :tabs="tabList" v-model="activeTab" :showBadges="true" />

DATA STRUCTURE:
const tabList = [
  { label: "All", value: "all", badge: 12 },
  { label: "External", value: "external", badge: 5, icon: "mdi-web" },
];
-->

<script setup>
defineProps({
  tabs: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
  showBadges: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <v-tabs
    :model-value="modelValue"
    color="primary"
    density="comfortable"
    class="mb-4"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" class="text-none">
      <v-icon v-if="tab.icon" :icon="tab.icon" start size="small" />
      {{ tab.label }}
      <v-chip
        v-if="showBadges && tab.badge != null"
        size="x-small"
        class="ml-2"
        :color="modelValue === tab.value ? 'primary' : 'grey'"
        variant="tonal"
      >
        {{ tab.badge }}
      </v-chip>
    </v-tab>
  </v-tabs>
</template>

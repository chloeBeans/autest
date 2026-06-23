<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
});
</script>

<template>
  <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
    <div class="d-flex align-center ga-3">
      <v-avatar v-if="icon" color="primary" variant="tonal" rounded="lg" size="44">
        <v-icon :icon="icon" />
      </v-avatar>
      <div>
        <h2 class="text-h5 font-weight-bold">{{ title }}</h2>
        <div v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</div>
      </div>
    </div>
    <div class="d-flex align-center ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>

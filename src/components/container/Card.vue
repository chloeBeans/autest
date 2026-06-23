<!--
USAGE

<Card :fullWidth="false">
  <template #header>Optional header</template>
  // Card content
</Card>

PROPS:
fullWidth: false   // optional - Make card full width
fullHeight: false  // optional - Make card full height
padding: "10px 20px" // optional - Custom padding for card content
-->

<script setup>
defineProps({
  fullWidth: { type: Boolean, default: false },
  fullHeight: { type: Boolean, default: false },
  padding: { type: String, default: null },
});
</script>

<template>
  <div class="card" :class="[fullWidth ? 'full-width' : '', fullHeight ? 'h-full' : '']">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content" :style="padding != null ? { padding } : {}">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 14px;
  border: 1px solid #e6e9f0;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}
.card.full-width {
  width: 100%;
}
.card.h-full {
  height: 100%;
}
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eef1f6;
  font-weight: 600;
}
.card-content {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}
</style>

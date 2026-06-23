<script setup>
import AppTopbar from '@/components/layout/AppTopbar.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<template>
  <AppTopbar />
  <AppSidebar />
  <v-main style="background: var(--app-bg); min-height: 100vh">
    <v-container fluid class="pa-6">
      <div class="page-wrap">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup>
import { ref } from 'vue';
import { useBugStore } from '@/store/bugs';
import { useToastStore } from '@/store/toast';
import { PORTAL_OPTIONS, ENV_OPTIONS } from '@/utils/constants';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const bugStore = useBugStore();
const toast = useToastStore();

const form = ref({ id: '', portal: 'external', env: 'dev', description: '' });

const portalItems = PORTAL_OPTIONS.map(o => ({ title: o.label, value: o.value }));
const envItems = ENV_OPTIONS.map(o => ({ title: o.label, value: o.value }));

function close() {
  emit('update:modelValue', false);
}

function save() {
  if (!form.value.description.trim()) {
    toast.error('Issue description is required');
    return;
  }
  bugStore.addBug({
    id: form.value.id.trim() || `BUG-${Date.now().toString().slice(-5)}`,
    portal: form.value.portal,
    env: form.value.env,
    description: form.value.description.trim(),
    raw: {},
  });
  toast.success('Bug added');
  form.value = { id: '', portal: 'external', env: 'dev', description: '' };
  close();
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-bold">{{ $t('bugs.addBug') }}</span>
        <v-btn variant="text" icon="mdi-close" @click="close" />
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.id" :label="$t('bugs.id')" placeholder="auto" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="form.portal" :items="portalItems" :label="$t('bugs.portal')" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="form.env" :items="envItems" label="Env" />
          </v-col>
        </v-row>
        <v-textarea
          v-model="form.description"
          :label="$t('bugs.description')"
          rows="4"
          class="mt-1"
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <FormButton variant="line-secondary" @click="close">{{ $t('general.cancel') }}</FormButton>
        <FormButton prependIcon="mdi-plus" @click="save">{{ $t('general.save') }}</FormButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

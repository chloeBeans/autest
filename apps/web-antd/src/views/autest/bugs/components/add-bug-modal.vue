<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { Form, FormItem, Input, Modal, Select, Textarea } from 'ant-design-vue';

import { $t } from '#/locales';
import { useBugStore } from '#/store/bugs';
import { ENV_OPTIONS, PORTAL_OPTIONS } from '#/utils/constants';
import { toast } from '#/utils/toast';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const visible = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const bugStore = useBugStore();
const form = reactive({
  id: '',
  portal: 'external',
  env: 'dev',
  description: '',
});

function submit() {
  if (!form.description.trim()) {
    toast.error('Issue description is required');
    return;
  }
  bugStore.addBug({
    id: form.id.trim() || `BUG-${Date.now().toString().slice(-5)}`,
    portal: form.portal,
    env: form.env,
    description: form.description.trim(),
    raw: {},
  });
  toast.success('Bug added');
  form.id = '';
  form.description = '';
  visible.value = false;
}
</script>

<template>
  <Modal
    v-model:open="visible"
    :title="$t('autest.bugs.addBug')"
    :ok-text="$t('autest.general.save')"
    @ok="submit"
  >
    <Form layout="vertical">
      <div class="grid">
        <FormItem :label="$t('autest.bugs.id')">
          <Input v-model:value="form.id" placeholder="auto" />
        </FormItem>
        <FormItem :label="$t('autest.bugs.portal')">
          <Select v-model:value="form.portal" :options="PORTAL_OPTIONS" />
        </FormItem>
        <FormItem label="Env">
          <Select v-model:value="form.env" :options="ENV_OPTIONS" />
        </FormItem>
      </div>
      <FormItem :label="$t('autest.bugs.description')">
        <Textarea v-model:value="form.description" :rows="4" />
      </FormItem>
    </Form>
  </Modal>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
</style>

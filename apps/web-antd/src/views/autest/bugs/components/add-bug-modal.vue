<script lang="ts" setup>
import type { Bug } from '#/types/domain';

import { computed, reactive } from 'vue';

import { Form, FormItem, Input, Modal, Select, Textarea } from 'ant-design-vue';

import { $t } from '#/locales';
import { useBugStore } from '#/store/bugs';
import { BUG_FIELDS } from '#/utils/constants';
import { toast } from '#/utils/toast';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const visible = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const bugStore = useBugStore();

function emptyForm(): Record<string, string> {
  const form: Record<string, string> = {};
  BUG_FIELDS.forEach((f) => {
    form[f.key] = '';
  });
  return form;
}
const form = reactive<Record<string, string>>(emptyForm());

function submit() {
  if (!form.description?.trim()) {
    toast.error('Issue description is required');
    return;
  }
  const bug = { raw: {} } as Bug;
  const writable = bug as unknown as Record<string, unknown>;
  BUG_FIELDS.forEach((f) => {
    writable[f.key] = (form[f.key] ?? '').trim();
  });
  if (!bug.logId) bug.logId = `BUG-${Date.now().toString().slice(-5)}`;

  bugStore.addBug(bug);
  toast.success('Bug added');
  Object.assign(form, emptyForm());
  visible.value = false;
}
</script>

<template>
  <Modal
    v-model:open="visible"
    :title="$t('autest.bugs.addBug')"
    :ok-text="$t('autest.general.save')"
    width="900px"
    @ok="submit"
  >
    <Form layout="vertical">
      <div class="grid">
        <FormItem
          v-for="f in BUG_FIELDS"
          :key="f.key"
          :label="$t(`autest.bugs.fields.${f.key}`)"
          :class="{ full: f.kind === 'textarea' }"
        >
          <Select
            v-if="f.kind === 'select'"
            v-model:value="form[f.key]"
            :options="f.options"
            allow-clear
          />
          <Textarea
            v-else-if="f.kind === 'textarea'"
            v-model:value="form[f.key]"
            :rows="3"
          />
          <Input v-else v-model:value="form[f.key]" />
        </FormItem>
      </div>
    </Form>
  </Modal>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px 16px;
}
.full {
  grid-column: 1 / -1;
}
</style>

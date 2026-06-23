<script setup>
import { ref, computed } from 'vue';
import { parseSpreadsheet, detectColumn, rowsToBugs } from '@/utils/spreadsheet';
import { useBugStore } from '@/store/bugs';
import { useToastStore } from '@/store/toast';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const bugStore = useBugStore();
const toast = useToastStore();

const file = ref(null);
const sheets = ref([]);
const fileName = ref('');
const mapping = ref({
  idCol: null,
  descCol: null,
  portalCol: null,
  envCol: null,
  useSheetNameAsPortal: false,
});

const allColumns = computed(() => {
  const cols = new Set();
  sheets.value.forEach(s => s.columns.forEach(c => cols.add(c)));
  return [...cols];
});

const previewBugs = computed(() => {
  if (!mapping.value.descCol) return [];
  return rowsToBugs(sheets.value, mapping.value).slice(0, 6);
});

function close() {
  emit('update:modelValue', false);
}

async function onFile(files) {
  const f = Array.isArray(files) ? files[0] : files;
  if (!f) return;
  try {
    const parsed = await parseSpreadsheet(f);
    if (!parsed.length) {
      toast.error($t('import.noData'));
      return;
    }
    sheets.value = parsed;
    fileName.value = f.name;
    const cols = allColumns.value;
    mapping.value.idCol = detectColumn(cols, 'id');
    mapping.value.descCol = detectColumn(cols, 'description');
    mapping.value.portalCol = detectColumn(cols, 'portal');
    mapping.value.envCol = detectColumn(cols, 'env');
    mapping.value.useSheetNameAsPortal = !mapping.value.portalCol && parsed.length > 1;
  } catch (err) {
    toast.error(err.message);
  }
}

function load() {
  const bugs = rowsToBugs(sheets.value, mapping.value);
  if (!bugs.length) {
    toast.error($t('import.noData'));
    return;
  }
  bugStore.setBugs(bugs, fileName.value);
  toast.success($t('import.loaded', { count: bugs.length }));
  close();
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-bold">{{ $t('import.title') }}</span>
        <v-btn variant="text" icon="mdi-close" @click="close" />
      </v-card-title>

      <v-card-text>
        <v-file-input
          v-model="file"
          accept=".csv,.xlsx,.xls"
          prepend-icon="mdi-file-table-outline"
          :label="$t('import.drop')"
          variant="outlined"
          density="comfortable"
          show-size
          @update:model-value="onFile"
        />

        <template v-if="sheets.length">
          <div class="text-subtitle-2 font-weight-bold mt-2 mb-1">{{ $t('import.mapping') }}</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="mapping.idCol"
                :items="allColumns"
                :label="$t('import.idColumn')"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="mapping.descCol"
                :items="allColumns"
                :label="$t('import.descriptionColumn')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="mapping.portalCol"
                :items="allColumns"
                :label="$t('import.portalColumn')"
                :disabled="mapping.useSheetNameAsPortal"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="mapping.envCol"
                :items="allColumns"
                label="Environment column (DEV/SIT/UAT)"
                clearable
              />
            </v-col>
          </v-row>
          <v-checkbox
            v-model="mapping.useSheetNameAsPortal"
            :label="$t('import.useSheetName')"
            density="compact"
            hide-details
          />

          <v-table v-if="previewBugs.length" density="compact" class="mt-2">
            <thead>
              <tr>
                <th>{{ $t('bugs.id') }}</th>
                <th>{{ $t('bugs.portal') }}</th>
                <th>Env</th>
                <th>{{ $t('bugs.description') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in previewBugs" :key="b.id">
                <td class="mono">{{ b.id }}</td>
                <td>{{ b.portal }}</td>
                <td>{{ b.env.toUpperCase() }}</td>
                <td class="text-truncate" style="max-width: 280px">{{ b.description }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <FormButton variant="line-secondary" @click="close">{{ $t('general.cancel') }}</FormButton>
        <FormButton
          :disabled="!mapping.descCol"
          prependIcon="mdi-database-import-outline"
          @click="load"
        >
          {{ $t('import.load') }}
        </FormButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

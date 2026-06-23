<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { parseSpreadsheet, detectColumn, rowsToBugs } from '@/utils/spreadsheet';
import { useBugStore } from '@/store/bugs';
import { useToastStore } from '@/store/toast';

const router = useRouter();
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
  return rowsToBugs(sheets.value, mapping.value).slice(0, 8);
});

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
  router.push('/bugs');
}
</script>

<template>
  <div>
    <PageHeader :title="$t('import.title')" icon="mdi-upload-outline" />

    <v-card rounded="lg" border flat class="mb-4">
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
      </v-card-text>
    </v-card>

    <template v-if="sheets.length">
      <v-card rounded="lg" border flat class="mb-4">
        <v-card-title class="text-subtitle-1 font-weight-bold">{{
          $t('import.mapping')
        }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="mapping.idCol"
                :items="allColumns"
                :label="$t('import.idColumn')"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="mapping.descCol"
                :items="allColumns"
                :label="$t('import.descriptionColumn')"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="mapping.portalCol"
                :items="allColumns"
                :label="$t('import.portalColumn')"
                :disabled="mapping.useSheetNameAsPortal"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
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
            class="mt-2"
          />
          <div class="text-caption text-medium-emphasis mt-1">
            Sheets: {{ sheets.map(s => `${s.name} (${s.rows.length})`).join(', ') }}
          </div>
        </v-card-text>
      </v-card>

      <v-card v-if="previewBugs.length" rounded="lg" border flat class="mb-4">
        <v-card-title class="text-subtitle-1 font-weight-bold">{{
          $t('import.preview')
        }}</v-card-title>
        <v-table density="comfortable">
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
              <td>
                <v-chip size="x-small" :color="b.portal === 'external' ? 'info' : 'secondary'">
                  {{ b.portal }}
                </v-chip>
              </td>
              <td>
                <v-chip size="x-small" variant="outlined">{{ b.env.toUpperCase() }}</v-chip>
              </td>
              <td class="text-truncate" style="max-width: 420px">{{ b.description }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-btn
        color="primary"
        size="large"
        :disabled="!mapping.descCol"
        prepend-icon="mdi-database-import-outline"
        @click="load"
      >
        {{ $t('import.load') }}
      </v-btn>
    </template>
  </div>
</template>

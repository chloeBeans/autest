<script setup>
import { ref, computed } from 'vue';
import { buildTestFromSteps } from '@/utils/playwright';
import { buildCodegenCommand, buildBookmarklet, RECORDER_SOURCE } from '@/utils/recorder';
import { slugify } from '@/utils/format';
import { writeFile, downloadTextFile } from '@/utils/fileSystem';
import { useFolderStore } from '@/store/folders';
import { useToastStore } from '@/store/toast';
import { PORTALS } from '@/utils/constants';

const folderStore = useFolderStore();
const toast = useToastStore();

const tab = ref('record');
const targetPortal = ref(PORTALS.EXTERNAL);
const baseUrl = ref('http://localhost:5173');
const testName = ref('new test');

const portalOptions = [
  { title: 'External', value: PORTALS.EXTERNAL },
  { title: 'Internal', value: PORTALS.INTERNAL },
];

const connected = computed(() => folderStore.isConnected(targetPortal.value));

// --- Record tab ---
const codegenCommand = computed(() =>
  buildCodegenCommand({ baseUrl: baseUrl.value, name: testName.value })
);
const bookmarklet = computed(() => buildBookmarklet());

// --- Build (drag & drop) tab ---
const stepTypes = [
  { title: 'Go to URL', value: 'goto' },
  { title: 'Click', value: 'click' },
  { title: 'Fill', value: 'fill' },
  { title: 'Expect visible', value: 'expectVisible' },
  { title: 'Expect text', value: 'expectText' },
];
const steps = ref([{ type: 'click', selector: '', value: '' }]);
const dragIndex = ref(null);

function addStep() {
  steps.value.push({ type: 'click', selector: '', value: '' });
}
function removeStep(i) {
  steps.value.splice(i, 1);
}
function onDragStart(i) {
  dragIndex.value = i;
}
function onDrop(i) {
  if (dragIndex.value === null || dragIndex.value === i) return;
  const moved = steps.value.splice(dragIndex.value, 1)[0];
  steps.value.splice(i, 0, moved);
  dragIndex.value = null;
}

const builtSpec = computed(() =>
  buildTestFromSteps({ name: testName.value, baseUrl: baseUrl.value, steps: steps.value })
);

// --- Code tab ---
const code = ref(`import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // TODO: write steps and assertions
  await expect(page).toHaveTitle(/.*/);
});
`);

// --- Test IDs guide tab ---
// Examples shown verbatim in the guide so testers can copy the pattern.
const EX_INLINE = `<!-- Add data-testid to the element you want to target -->
<button data-testid="login-submit">Sign in</button>
<input data-testid="login-username" />`;

const EX_PROP =
  `<!-- Shared base component: add a testId prop, bind to the REAL element -->
<script setup>
defineProps({ testId: { type: String, default: null } });
<` +
  `/script>

<template>
  <!-- bind onto the actual <button>/<input>, not the wrapper -->
  <button :data-testid="testId"><slot /></button>
</template>

<!-- Usage in any view -->
<FormButton testId="employer-registration-submit">Submit</FormButton>`;

// Single-quoted lines so the backticks / \${...} stay literal in the snippet.
const EX_TABLE = [
  '<!-- GOOD: stable business key (survives sort / filter / paging) -->',
  '<tr',
  '  v-for="row in rows"',
  '  :key="row.id"',
  '  :data-testid="`registration-list-row-${row.refNo}`"',
  '>',
  '  <td>',
  '    <button :data-testid="`registration-list-edit-${row.refNo}`">Edit</button>',
  '  </td>',
  '</tr>',
  '',
  '<!-- BAD: index shifts when the list reorders -> flaky -->',
  '<tr :data-testid="`row-${index}`">...</tr>',
].join('\n');

const EX_PLAYWRIGHT = `import { test, expect } from '@playwright/test';

test('submit registration', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-username').fill('qa1');
  await page.getByTestId('login-password').fill('secret');
  await page.getByTestId('login-submit').click();

  // locate by id, assert on the visible label/value
  await expect(page.getByTestId('status-badge')).toHaveText('Approved');
});`;

const guideExamples = [
  {
    title: '1. Add an ID inline',
    desc: 'Put data-testid directly on the element you want a test to find.',
    code: EX_INLINE,
  },
  {
    title: '2. Reusable component prop',
    desc: 'For shared components, add a testId prop and forward it to the real inner element. Instrument once, reuse everywhere.',
    code: EX_PROP,
  },
  {
    title: '3. Table rows — use a stable key, never the index',
    desc: 'Derive row IDs from a business key (reference no.), so they survive sorting, filtering and pagination.',
    code: EX_TABLE,
  },
  {
    title: '4. Use it in Playwright',
    desc: 'Locate by data-testid; assert on the visible value (pin a locale so EN/BM text does not break assertions).',
    code: EX_PLAYWRIGHT,
  },
];

// --- shared save ---
async function save(fileName, content) {
  try {
    if (connected.value) {
      const path = await writeFile(
        folderStore.handleFor(targetPortal.value),
        'tests',
        fileName,
        content
      );
      toast.success(`Saved ${path}`);
    } else {
      downloadTextFile(fileName, content);
      toast.info('No folder connected — downloaded the spec instead.');
    }
  } catch (err) {
    toast.error(err.message);
  }
}
const saveBuilt = () => save(builtSpec.value.fileName, builtSpec.value.content);
const saveCode = () => save(`${slugify(testName.value)}.spec.js`, code.value);

async function copy(text, label) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} ${$t('general.copied').toLowerCase()}`);
}

const tabs = computed(() => [
  { label: $t('tests.record'), value: 'record', icon: 'mdi-record-circle-outline' },
  { label: $t('tests.build'), value: 'build', icon: 'mdi-drag-variant' },
  { label: $t('tests.code'), value: 'code', icon: 'mdi-code-tags' },
  { label: $t('tests.guide'), value: 'guide', icon: 'mdi-tag-text-outline' },
]);
</script>

<template>
  <div>
    <PageHeader
      :title="$t('tests.title')"
      :subtitle="$t('tests.subtitle')"
      icon="mdi-flask-outline"
    />

    <Card>
      <v-row dense class="mb-1">
        <v-col cols="12" md="4">
          <v-select v-model="targetPortal" :items="portalOptions" label="Save into portal" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="testName" :label="$t('addTest.name')" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="baseUrl" :label="$t('addTest.baseUrl')" />
        </v-col>
      </v-row>
      <div class="text-caption text-medium-emphasis">
        <v-icon
          :icon="connected ? 'mdi-folder-check-outline' : 'mdi-folder-alert-outline'"
          size="small"
        />
        {{
          connected
            ? `Connected: ${folderStore.names[targetPortal]}`
            : 'Folder not connected — saves will download. Connect in Settings.'
        }}
      </div>
    </Card>

    <Card>
      <Tabs v-model="tab" :tabs="tabs" />

      <!-- Record -->
      <div v-if="tab === 'record'">
        <p class="text-body-2 text-medium-emphasis mb-2">{{ $t('record.codegenDesc') }}</p>
        <div class="code-block mb-3">{{ codegenCommand }}</div>
        <FormButton
          variant="green"
          prependIcon="mdi-content-copy"
          @click="copy(codegenCommand, 'Command')"
        >
          {{ $t('record.copyCommand') }}
        </FormButton>

        <v-divider class="my-4" />
        <p class="text-body-2 text-medium-emphasis mb-2">{{ $t('record.snippetDesc') }}</p>
        <div class="d-flex align-center ga-3 mb-2 flex-wrap">
          <a :href="bookmarklet" class="recorder-bookmarklet" @click.prevent>
            <v-icon icon="mdi-record-circle" size="small" class="mr-1" />{{
              $t('record.bookmarklet')
            }}
          </a>
          <span class="text-caption text-medium-emphasis">← drag me to your bookmarks bar</span>
        </div>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Show recorder snippet">
            <template #text>
              <div class="code-block" style="max-height: 240px">{{ RECORDER_SOURCE }}</div>
              <FormButton
                class="mt-3"
                variant="line-primary"
                prependIcon="mdi-content-copy"
                @click="copy(RECORDER_SOURCE, 'Snippet')"
              >
                {{ $t('record.copySnippet') }}
              </FormButton>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Build (drag & drop) -->
      <div v-else-if="tab === 'build'">
        <v-row>
          <v-col cols="12" md="7">
            <div
              v-for="(step, i) in steps"
              :key="i"
              class="step-row d-flex ga-2 mb-2 align-center"
              draggable="true"
              @dragstart="onDragStart(i)"
              @dragover.prevent
              @drop="onDrop(i)"
            >
              <v-icon icon="mdi-drag" class="drag-handle" />
              <v-select
                v-model="step.type"
                :items="stepTypes"
                style="max-width: 170px"
                hide-details
                density="compact"
              />
              <v-text-field
                v-model="step.selector"
                label="Selector"
                hide-details
                density="compact"
              />
              <v-text-field v-model="step.value" label="Value" hide-details density="compact" />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="removeStep(i)"
              />
            </div>
            <FormButton variant="line-primary" prependIcon="mdi-plus" @click="addStep">
              {{ $t('addTest.addStep') }}
            </FormButton>
          </v-col>
          <v-col cols="12" md="5">
            <div class="text-caption text-medium-emphasis mb-1">{{ builtSpec.fileName }}</div>
            <div class="code-block mb-3" style="max-height: 320px">{{ builtSpec.content }}</div>
            <FormButton block prependIcon="mdi-content-save-outline" @click="saveBuilt">
              {{ connected ? 'Save to folder' : $t('general.download') }}
            </FormButton>
          </v-col>
        </v-row>
      </div>

      <!-- Code -->
      <div v-else-if="tab === 'code'">
        <v-textarea
          v-model="code"
          rows="16"
          class="mono"
          variant="outlined"
          hide-details
          auto-grow
        />
        <FormButton class="mt-3" prependIcon="mdi-content-save-outline" @click="saveCode">
          {{ connected ? 'Save to folder' : $t('general.download') }}
        </FormButton>
      </div>

      <!-- Test IDs guide -->
      <div v-else>
        <v-alert
          type="info"
          variant="tonal"
          border="start"
          class="mb-4"
          icon="mdi-information-outline"
        >
          <strong
            >Locate by <span class="mono">data-testid</span>, assert on the visible label.</strong
          >
          Test IDs are stable selectors that don't break when copy or language (EN/BM) changes.
        </v-alert>

        <div class="text-subtitle-2 font-weight-bold mb-1">Naming convention</div>
        <ul class="text-body-2 mb-4 ps-4">
          <li>
            <span class="mono">module-screen-element</span> in kebab-case — e.g.
            <span class="mono">login-submit</span>,
            <span class="mono">registration-list-table</span>.
          </li>
          <li>
            Select by <span class="mono">data-testid</span>; assert on the visible text / value.
          </li>
          <li>
            For table rows, append a <strong>stable record key</strong> (reference no.) — never the
            array index.
          </li>
          <li>Don't locate by label text — it changes between EN and BM.</li>
        </ul>

        <div v-for="ex in guideExamples" :key="ex.title" class="mb-4">
          <div class="d-flex align-center justify-space-between mb-1 flex-wrap ga-2">
            <div>
              <div class="text-subtitle-2 font-weight-bold">{{ ex.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ ex.desc }}</div>
            </div>
            <FormButton
              size="md"
              variant="line-primary"
              prependIcon="mdi-content-copy"
              @click="copy(ex.code, 'Example')"
            >
              {{ $t('general.copy') }}
            </FormButton>
          </div>
          <div class="code-block">{{ ex.code }}</div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.recorder-bookmarklet {
  display: inline-flex;
  align-items: center;
  background: #1565c0;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: grab;
}
.step-row {
  background: #f8f9fc;
  border: 1px solid #e6e9f0;
  border-radius: 10px;
  padding: 6px 8px;
}
.drag-handle {
  cursor: grab;
  color: #9aa3b2;
}
</style>

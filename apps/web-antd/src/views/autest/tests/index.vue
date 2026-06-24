<script lang="ts" setup>
import type { PlaywrightStep } from '#/types/domain';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Collapse,
  CollapsePanel,
  Divider,
  Input,
  Select,
  TabPane,
  Tabs,
  Textarea,
} from 'ant-design-vue';

import { $t } from '#/locales';
import { useFolderStore } from '#/store/folders';
import { PORTAL_OPTIONS, PORTALS } from '#/utils/constants';
import { downloadTextFile, writeFile } from '#/utils/fileSystem';
import { slugify } from '#/utils/format';
import { buildTestFromSteps } from '#/utils/playwright';
import {
  buildBookmarklet,
  buildCodegenCommand,
  RECORDER_SOURCE,
} from '#/utils/recorder';
import { toast } from '#/utils/toast';

const folderStore = useFolderStore();

const activeTab = ref('record');
const targetPortal = ref<string>(PORTALS.EXTERNAL);
const baseUrl = ref('http://localhost:5173');
const testName = ref('new test');

const connected = computed(() => folderStore.isConnected(targetPortal.value));

// --- Record tab ---
const codegenCommand = computed(() =>
  buildCodegenCommand({ baseUrl: baseUrl.value, name: testName.value }),
);
const bookmarklet = computed(() => buildBookmarklet());

// --- Build (drag & drop) tab ---
const stepTypes = [
  { label: 'Go to URL', value: 'goto' },
  { label: 'Click', value: 'click' },
  { label: 'Fill', value: 'fill' },
  { label: 'Expect visible', value: 'expectVisible' },
  { label: 'Expect text', value: 'expectText' },
];
const steps = ref<PlaywrightStep[]>([
  { type: 'click', selector: '', value: '' },
]);
const dragIndex = ref<null | number>(null);

function addStep() {
  steps.value.push({ type: 'click', selector: '', value: '' });
}
function removeStep(i: number) {
  steps.value.splice(i, 1);
}
function onDragStart(i: number) {
  dragIndex.value = i;
}
function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return;
  const [moved] = steps.value.splice(dragIndex.value, 1);
  if (moved) steps.value.splice(i, 0, moved);
  dragIndex.value = null;
}

// Selects/Inputs write through handlers so the template stays free of TS casts
// (vue-eslint-parser rejects `as`/typed params inside template expressions).
function setStepType(i: number, value: unknown) {
  const step = steps.value[i];
  if (step) step.type = value as PlaywrightStep['type'];
}
function setStepSelector(i: number, value: unknown) {
  const step = steps.value[i];
  if (step) step.selector = (value as string) ?? '';
}
function setStepValue(i: number, value: unknown) {
  const step = steps.value[i];
  if (step) step.value = (value as string) ?? '';
}

const builtSpec = computed(() =>
  buildTestFromSteps({
    name: testName.value,
    baseUrl: baseUrl.value,
    steps: steps.value,
  }),
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

// The closing script tag below is assembled from parts so it cannot terminate
// this SFC block early.
const EX_PROP = `<!-- Shared base component: add a testId prop, bind to the REAL element -->
<script setup>
defineProps({ testId: { type: String, default: null } });
<${'/script>'}

<template>
  <!-- bind onto the actual <button>/<input>, not the wrapper -->
  <button :data-testid="testId"><slot /></button>
</template>

<!-- Usage in any view -->
<FormButton testId="employer-registration-submit">Submit</FormButton>`;

// Single-quoted lines so the backticks / ${...} stay literal in the snippet
// (these are example markup, not real interpolation).
/* eslint-disable no-template-curly-in-string */
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
/* eslint-enable no-template-curly-in-string */

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
async function save(fileName: string, content: string) {
  const handle = folderStore.handleFor(targetPortal.value);
  try {
    if (handle) {
      const path = await writeFile(handle, 'tests', fileName, content);
      toast.success(`Saved ${path}`);
    } else {
      downloadTextFile(fileName, content);
      toast.info('No folder connected — downloaded the spec instead.');
    }
  } catch (error) {
    toast.error((error as Error).message);
  }
}
function saveBuilt() {
  save(builtSpec.value.fileName, builtSpec.value.content);
}
function saveCode() {
  save(`${slugify(testName.value)}.spec.js`, code.value);
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} ${$t('autest.general.copied').toLowerCase()}`);
  } catch (error) {
    toast.error((error as Error).message);
  }
}
</script>

<template>
  <Page
    :title="$t('autest.tests.title')"
    :description="$t('autest.tests.subtitle')"
  >
    <Card class="mb-4">
      <div class="config-grid">
        <div>
          <div class="field-label">{{ $t('autest.tests.savePortal') }}</div>
          <Select
            v-model:value="targetPortal"
            :options="PORTAL_OPTIONS"
            class="w-full"
          />
        </div>
        <div>
          <div class="field-label">{{ $t('autest.addTest.name') }}</div>
          <Input v-model:value="testName" />
        </div>
        <div>
          <div class="field-label">{{ $t('autest.addTest.baseUrl') }}</div>
          <Input v-model:value="baseUrl" />
        </div>
      </div>
      <div class="status" :class="{ connected }">
        <span v-if="connected">
          {{ $t('autest.folders.connected') }}:
          {{ folderStore.names[targetPortal] }}
        </span>
        <span v-else>{{ $t('autest.tests.notConnected') }}</span>
      </div>
    </Card>

    <Card>
      <Tabs v-model:active-key="activeTab">
        <!-- Record -->
        <TabPane key="record" :tab="$t('autest.tests.record')">
          <p class="muted mb-2">{{ $t('autest.record.codegenDesc') }}</p>
          <pre class="code-block mb-3">{{ codegenCommand }}</pre>
          <Button type="primary" @click="copy(codegenCommand, 'Command')">
            {{ $t('autest.record.copyCommand') }}
          </Button>

          <Divider />

          <p class="muted mb-2">{{ $t('autest.record.snippetDesc') }}</p>
          <div class="bookmarklet-row mb-3">
            <a :href="bookmarklet" class="recorder-bookmarklet" @click.prevent>
              ● {{ $t('autest.record.bookmarklet') }}
            </a>
            <span class="muted text-xs">{{
              $t('autest.record.dragHint')
            }}</span>
          </div>

          <Collapse>
            <CollapsePanel
              key="snippet"
              :header="$t('autest.record.showSnippet')"
            >
              <pre class="code-block snippet">{{ RECORDER_SOURCE }}</pre>
              <Button class="mt-3" @click="copy(RECORDER_SOURCE, 'Snippet')">
                {{ $t('autest.record.copySnippet') }}
              </Button>
            </CollapsePanel>
          </Collapse>
        </TabPane>

        <!-- Build (drag & drop) -->
        <TabPane key="build" :tab="$t('autest.tests.build')">
          <div class="build-grid">
            <div>
              <div
                v-for="(step, i) in steps"
                :key="i"
                class="step-row"
                draggable="true"
                @dragstart="onDragStart(i)"
                @dragover.prevent
                @drop="onDrop(i)"
              >
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <Select
                  :value="step.type"
                  :options="stepTypes"
                  class="step-type"
                  @change="(v) => setStepType(i, v)"
                />
                <Input
                  :value="step.selector || ''"
                  :placeholder="$t('autest.tests.selector')"
                  @update:value="(v) => setStepSelector(i, v)"
                />
                <Input
                  :value="step.value || ''"
                  :placeholder="$t('autest.tests.stepValue')"
                  @update:value="(v) => setStepValue(i, v)"
                />
                <Button danger type="text" @click="removeStep(i)">✕</Button>
              </div>
              <Button class="mt-2" @click="addStep">
                + {{ $t('autest.addTest.addStep') }}
              </Button>
            </div>

            <div>
              <div class="muted mb-1 text-xs">{{ builtSpec.fileName }}</div>
              <pre class="code-block built mb-3">{{ builtSpec.content }}</pre>
              <Button type="primary" block @click="saveBuilt">
                {{
                  connected
                    ? $t('autest.tests.saveToFolder')
                    : $t('autest.general.download')
                }}
              </Button>
            </div>
          </div>
        </TabPane>

        <!-- Code -->
        <TabPane key="code" :tab="$t('autest.tests.code')">
          <Textarea
            v-model:value="code"
            :auto-size="{ minRows: 16 }"
            class="code-editor"
          />
          <Button class="mt-3" type="primary" @click="saveCode">
            {{
              connected
                ? $t('autest.tests.saveToFolder')
                : $t('autest.general.download')
            }}
          </Button>
        </TabPane>

        <!-- Test IDs guide -->
        <TabPane key="guide" :tab="$t('autest.tests.guide')">
          <Alert
            type="info"
            show-icon
            class="mb-4"
            message="Locate by data-testid, assert on the visible label."
            description="Test IDs are stable selectors that don't break when copy or language (EN/BM) changes."
          />

          <div class="guide-heading">Naming convention</div>
          <ul class="guide-list mb-4">
            <li>
              <code>module-screen-element</code> in kebab-case — e.g.
              <code>login-submit</code>, <code>registration-list-table</code>.
            </li>
            <li>
              Select by <code>data-testid</code>; assert on the visible text /
              value.
            </li>
            <li>
              For table rows, append a <strong>stable record key</strong>
              (reference no.) — never the array index.
            </li>
            <li>Don't locate by label text — it changes between EN and BM.</li>
          </ul>

          <div v-for="ex in guideExamples" :key="ex.title" class="mb-4">
            <div class="guide-example-head">
              <div>
                <div class="guide-example-title">{{ ex.title }}</div>
                <div class="muted text-xs">{{ ex.desc }}</div>
              </div>
              <Button size="small" @click="copy(ex.code, 'Example')">
                {{ $t('autest.general.copy') }}
              </Button>
            </div>
            <pre class="code-block">{{ ex.code }}</pre>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped>
.mb-1 {
  margin-bottom: 4px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.text-xs {
  font-size: 12px;
}
.w-full {
  width: 100%;
}
.muted {
  color: hsl(var(--foreground) / 0.6);
}
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: hsl(var(--foreground) / 0.7);
}
.status {
  margin-top: 10px;
  font-size: 12px;
  color: hsl(var(--foreground) / 0.6);
}
.status.connected {
  color: hsl(var(--primary));
}
.code-block {
  margin: 0;
  overflow: auto;
  padding: 12px;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
.code-block.snippet {
  max-height: 240px;
}
.code-block.built {
  max-height: 320px;
}
.code-editor {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
}
.bookmarklet-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.recorder-bookmarklet {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  cursor: grab;
  background: #1565c0;
  border-radius: 8px;
}
.build-grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 16px;
  align-items: start;
}
.step-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 8px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.step-type {
  min-width: 150px;
}
.drag-handle {
  font-size: 16px;
  color: hsl(var(--foreground) / 0.4);
  cursor: grab;
  user-select: none;
}
.guide-heading {
  font-weight: 700;
  margin-bottom: 4px;
}
.guide-list {
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.7;
}
.guide-list code,
.guide-example-head code {
  padding: 1px 5px;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  background: hsl(var(--accent));
  border-radius: 4px;
}
.guide-example-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.guide-example-title {
  font-weight: 600;
}
@media (max-width: 960px) {
  .build-grid,
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>

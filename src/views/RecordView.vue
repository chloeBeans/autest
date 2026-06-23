<script setup>
import { ref, computed } from 'vue';
import { useToastStore } from '@/store/toast';
import { buildCodegenCommand, buildBookmarklet, RECORDER_SOURCE } from '@/utils/recorder';

const toast = useToastStore();

const baseUrl = ref('http://localhost:5173');
const testName = ref('recorded flow');

const command = computed(() =>
  buildCodegenCommand({ baseUrl: baseUrl.value, name: testName.value })
);
const bookmarklet = computed(() => buildBookmarklet());

async function copy(text, label) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} ${$t('general.copied').toLowerCase()}`);
}
</script>

<template>
  <div>
    <PageHeader
      :title="$t('record.title')"
      :subtitle="$t('record.subtitle')"
      icon="mdi-record-circle-outline"
    />

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="baseUrl" :label="$t('record.targetUrl')" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="testName" :label="$t('record.testName')" />
      </v-col>
    </v-row>

    <Card>
      <template #header>
        <v-icon icon="mdi-star-circle-outline" color="success" class="mr-2" />
        {{ $t('record.codegenTitle') }}
      </template>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ $t('record.codegenDesc') }}</p>
      <div class="code-block mb-3">{{ command }}</div>
      <FormButton variant="green" prependIcon="mdi-content-copy" @click="copy(command, 'Command')">
        {{ $t('record.copyCommand') }}
      </FormButton>
    </Card>

    <Card>
      <template #header>
        <v-icon icon="mdi-cursor-default-click-outline" color="primary" class="mr-2" />
        {{ $t('record.snippetTitle') }}
      </template>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ $t('record.snippetDesc') }}</p>
      <div class="d-flex align-center ga-3 mb-3 flex-wrap">
        <a :href="bookmarklet" class="recorder-bookmarklet" @click.prevent>
          <v-icon icon="mdi-record-circle" size="small" class="mr-1" />{{
            $t('record.bookmarklet')
          }}
        </a>
        <span class="text-caption text-medium-emphasis">← drag me to your bookmarks bar</span>
      </div>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel title="Show recorder snippet (paste into the app console)">
          <template #text>
            <div class="code-block" style="max-height: 280px">{{ RECORDER_SOURCE }}</div>
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
</style>

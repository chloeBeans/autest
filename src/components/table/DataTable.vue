<!--
USAGE

<DataTable :columns="columns" :data="rows" :loading="false">
  <template #actions="{ row }">
    <FormButton size="md" @click="open(row)">Open</FormButton>
  </template>
  <template #cell-status="{ value }"> ... </template>
</DataTable>

COLUMN STRUCTURE:
const columns = computed(() => [
  { key: 'id', title: 'ID', minWidth: '120px' },
  { key: 'status', title: 'Status', badge: true, badgeEval: val => 'green', formatter: val => val },
]);
-->

<script setup>
defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: 'key' },
  emptyText: { type: String, default: 'No records' },
});
</script>

<template>
  <div class="data-table-wrapper">
    <v-table density="comfortable" hover>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ minWidth: col.minWidth }">
            {{ col.title }}
          </th>
          <th v-if="$slots.actions" class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </td>
        </tr>
        <tr v-else-if="!data.length">
          <td
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
            class="text-center py-8 text-medium-emphasis"
          >
            {{ emptyText }}
          </td>
        </tr>
        <tr v-for="row in data" v-else :key="row[rowKey]">
          <td v-for="col in columns" :key="col.key" :style="{ minWidth: col.minWidth }">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              <Badge
                v-if="col.badge"
                :variant="col.badgeEval ? col.badgeEval(row[col.key]) : 'grey'"
              >
                {{ col.formatter ? col.formatter(row[col.key], row) : row[col.key] }}
              </Badge>
              <span v-else>{{
                col.formatter ? col.formatter(row[col.key], row) : row[col.key]
              }}</span>
            </slot>
          </td>
          <td v-if="$slots.actions" class="text-right">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
</style>

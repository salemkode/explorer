<template>
  <table class="table table-striped mb-0">
    <thead v-if="props.columns">
      <tr>
        <td
          v-for="(column, index) in props.columns"
          :key="index"
          v-text="$t(column)"
        />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <table-cell
          v-for="(column, columnIndex) in row"
          :key="columnIndex"
          :column="column"
        />
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { tableColumn } from "~/types/table";
const props = defineProps<{
  columns: string[];
  rows: tableColumn[][];
}>();
</script>

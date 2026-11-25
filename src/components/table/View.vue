<template>
  <div
    v-if="loading || error || rows.length || emptyMessage"
    :aria-busy="loading"
    :class="[
      headerLess
        ? 'w-full'
        : 'bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors'
    ]"
  >
    <div
      v-if="!headerLess"
      class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80"
    >
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">
        {{ props.title }}
      </h3>
      <BasePagination
        v-show="props.hasPrevPage || props.hasNextPage"
        :has-prev-page="props.hasPrevPage"
        :has-next-page="props.hasNextPage"
        @next="event('next')"
        @previous="event('previous')"
      />
    </div>

    <div v-if="error" class="p-8 text-center text-sm text-rose-500">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto w-full">
      <table
        v-if="loading || !!rows.length"
        class="w-full text-left border-collapse"
      >
        <thead v-if="props.columns" class="bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800/80">
          <tr>
            <th
              v-for="(column, index) in props.columns"
              :key="index"
              class="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500"
              v-text="$t(column)"
            />
          </tr>
        </thead>
        <Transition name="fade" mode="out-in">
          <tbody
            :key="change.count"
            class="divide-y divide-slate-100 dark:divide-zinc-800/60 transition-opacity"
            :class="{ 'opacity-50': loading && rows.length }"
          >
            <tr
              v-for="row in loading && !rows.length ? skeletonRows : 0"
              :key="`skeleton-${row}`"
              aria-hidden="true"
            >
              <td v-for="(_column, columnIndex) in props.columns" :key="columnIndex" class="px-5 py-4">
                <Skeleton class="h-4" :class="skeletonWidths[(row + columnIndex) % skeletonWidths.length]" />
              </td>
            </tr>
            <tr
              v-for="(row, index) in rows"
              :key="rowKeys?.[index] || index"
              class="hover:bg-slate-50/75 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <table-cell
                v-for="(column, columnIndex) in row"
                :key="columnIndex"
                :column="column"
              />
            </tr>
          </tbody>
        </Transition>
      </table>
    </div>

    <p v-if="!loading && !error && !rows.length && emptyMessage" role="status" class="px-5 py-6 text-sm text-slate-500 dark:text-zinc-400">
      {{ emptyMessage }}
    </p>

    <span v-if="loading" role="status" class="sr-only">Loading</span>
  </div>
</template>

<script setup lang="ts">
import type { tableColumn } from "~/types/index.js";

type emitName = "next" | "previous";
const emit = defineEmits<(event: emitName) => void>();
const skeletonRows = 5;
const skeletonWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6"];
const change = reactive({
	count: 0,
	navigate: false,
});

const props = withDefaults(
	defineProps<{
		title: string;
		columns: string[];
		rows: tableColumn[][];
		rowKeys?: string[];
		emptyMessage?: string;
		loading?: boolean;
		headerLess?: boolean;
		error?: string;
		hasNextPage?: boolean;
		hasPrevPage?: boolean;
	}>(),
	{ loading: false, headerLess: false, error: "", emptyMessage: "" },
);

const event = (emitName: emitName) => {
	if (change.navigate) return;
	change.navigate = true;
	emit(emitName);
};

watch(toRef(props, "rows"), () => {
	if (props.rows.length !== 0) {
		if (change.navigate) {
			change.count++;
			change.navigate = false;
		}
	}
});
</script>

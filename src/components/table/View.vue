<template>
  <div
    v-if="loading || error || rows.length"
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
          <tbody :key="change.count" class="divide-y divide-slate-100 dark:divide-zinc-800/60">
            <tr
              v-for="(row, index) in rows"
              :key="index"
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

    <LoadingSpinner
      v-if="loading"
      class="py-6"
    />
  </div>
</template>

<script setup lang="ts">
import type { tableColumn } from "~/types/index.js";
type emitName = "next" | "previous";
const emit = defineEmits<(event: emitName) => void>();
const change = reactive({
	count: 0,
	navigate: false,
});

const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	columns: {
		type: Array as PropType<string[]>,
		required: true,
	},
	rows: {
		type: Array as PropType<tableColumn[][]>,
		required: true,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	headerLess: {
		type: Boolean,
		default: false,
	},
	error: {
		type: String,
		default: "",
	},
	hasNextPage: {
		type: Boolean,
	},
	hasPrevPage: {
		type: Boolean,
	},
});

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

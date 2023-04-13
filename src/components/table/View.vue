<template>
  <div v-if="loading || error || rows.length" class="card">
    <h3 class="p-3 d-flex">
      <span>{{ props.title }}</span>
      <div class="mx-auto" />
      <div v-if="props.hasPrevPage || props.hasNextPage" class="pagination">
        <button
          class="border-0 btn p-0"
          :disabled="!props.hasPrevPage"
          @click="event('previous')"
        >
          <img
            src="~/assets/icons/angle-small-left.svg"
            alt=""
            width="30"
            :style="{
              opacity: props.hasPrevPage ? 1 : 0.5,
            }"
          />
        </button>
        <button
          class="border-0 btn p-0"
          :disabled="!props.hasNextPage"
          @click="event('next')"
        >
          <img
            src="~/assets/icons/angle-small-right.svg"
            alt=""
            width="30"
            :style="{
              opacity: props.hasNextPage ? 1 : 0.5,
            }"
          />
        </button>
      </div>
    </h3>
    <div v-if="error" class="m-auto py-5 my-5">
      {{ error }}
    </div>
    <div v-else class="overflow-x-auto text-nowrap">
      <table
        v-if="loading || !!rows.length"
        class="table fade show table-striped mb-0"
      >
        <thead v-if="props.columns">
          <tr>
            <td
              v-for="(column, index) in props.columns"
              :key="index"
              v-text="$t(column)"
            />
          </tr>
        </thead>
        <Transition name="fade" mode="out-in">
          <tbody :key="change.count">
            <tr v-for="(row, index) in rows" :key="index">
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
      :class="loading && !rows.length ? 'py-5 my-5' : 'py-2 mt-2'"
    />
  </div>
</template>

<script setup lang="ts">
import type { tableColumn } from "~/types/index.js";
type emitName = "next" | "previous";
const emit = defineEmits<{
  (event: emitName): void;
}>();
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
    } else {
      change.navigate = false;
    }
  }
});
</script>

<style scoped>
.table {
  animation: fade 0.8s linear;
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

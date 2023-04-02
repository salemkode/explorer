<template>
  <div v-if="loading || error || rows.length" class="card">
    <h3 class="p-3 d-flex">
      <span>{{ props.title }}</span>
      <div class="mx-auto" />
      <div v-if="props.hasPrevPage || props.hasNextPage" class="pagination">
        <button
          class="border-0 btn p-0"
          :disabled="!props.hasPrevPage"
          @click="emit('previous')"
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
          @click="emit('next')"
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
        <Transition name="fade" mode="out-in">
          <tbody :key="change">
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
    <LoadingSpinner v-if="loading" class="py-2 mt-2" />
  </div>
</template>

<script setup lang="ts">
import { tableColumn } from "~/types/index.js";
const emit = defineEmits(["next", "previous"]);
const change = ref(0);

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
watch(toRef(props, "rows"), () => change.value++);
</script>

<style scoped>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

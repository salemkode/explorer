<template>
  <div class="pagination">
    <button
      class="border-0 btn p-0"
      :disabled="!props.hasPrevPage"
      @click="emit('previous')"
    >
      <i
        class="uicon-angle-small-left uicon-md"
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
      <i
        class="uicon-angle-small-right uicon-md"
        :style="{
          opacity: props.hasNextPage ? 1 : 0.5,
        }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
	hasPrevPage: boolean;
	hasNextPage: boolean;
}>();
const emit = defineEmits<{
	(event: "next"): void;
	(event: "previous"): void;
}>();
</script>

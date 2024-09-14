<template>
  <div>
    <div ref="list">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";

const emit =
	defineEmits<
		(event: "sort-end", value: { newIndex: number; oldIndex: number }) => void
	>();
const list = ref<HTMLElement>();

const onSortEnd = (event: Sortable.SortableEvent) => {
	const { newIndex, oldIndex } = event;
	if (newIndex === undefined || oldIndex === undefined) return;
	emit("sort-end", { newIndex, oldIndex });
};

onMounted(() => {
	if (!list.value) return;
	Sortable.create(list.value, {
		animation: 200,
		onEnd: onSortEnd,
	});
});
</script>

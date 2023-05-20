<template>
  <div>
    <div ref="list">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="card flex-row justify-content-between p-2 mb-2"
      >
        {{ item.name }}
        <i class="uicon-draggable" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";

const props = defineProps<{ items: { name: string }[] }>();
const emit = defineEmits<{
  (event: "sort-end", value: { newIndex: number; oldIndex: number }): void;
}>();
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

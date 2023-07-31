<template>
  <PopperOver placement="auto-end" hover>
    <slot />
    <template #content>
      <div
        class="bg-black p-1 px-2 rounded-1 text-white floating"
        v-text="props.msg"
      />
    </template>
  </PopperOver>
</template>

<script lang="ts" setup>
const PopperOver = defineAsyncComponent({
  loader: () => import("vue3-popper"),
});
const props = defineProps<{ msg: string }>();
</script>

<style>
.floating {
  transition: opacity 0.5s;
  font-size: 12.5px;
  margin-bottom: 5px;
  white-space: break-spaces;
  max-width: 300px;
}
</style>

<template>
  <ul class="nav nav-pills nav-fill my-4">
    <li v-for="(item, index) in props.items" :key="index" class="nav-item">
      <button
        class="nav-link"
        :class="{
          active: navItem === index,
        }"
        @click="navItem = index"
      >
        {{ $t(item) }}
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: string[];
  select: number;
}>();

const emit = defineEmits<{
  (event: "update:select", value: number): void;
}>();

const navItem = computed({
  get() {
    return props.select;
  },
  set(value) {
    emit("update:select", value);
  },
});
</script>

<style scoped>
.nav-link {
  --bs-nav-link-color: black;
}
</style>

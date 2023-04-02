<template>
  <ul class="nav nav-pills nav-fill my-4 d-md-none">
    <li v-for="(item, index) in navItems" :key="index" class="nav-item">
      <button
        class="nav-link"
        :class="{
          active: navItem === index,
        }"
        @click="navItem = index"
      >
        {{ item }}
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
const navItems = ["Transaction", "Token Register"];
const emit = defineEmits<{
  (event: "update:navItem", value: number): void;
}>();
const props = defineProps<{
  navItem: number;
}>();
const navItem = computed({
  get() {
    return props.navItem;
  },
  set(value) {
    emit("update:navItem", value);
  },
});
</script>

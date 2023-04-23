<template>
  <div class="card d-flex flex-column p-3 flex-md-row">
    <vue-qr-code :content="address" />
    <div
      class="d-flex flex-column align-items-start justify-content-center ms-md-3"
    >
      <div class="badge text-bg-primary">pubkeyhash</div>
      <BaseCopy class="my-1" copy warp :text="address" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  address: string;
}>();
</script>

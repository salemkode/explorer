<template>
  <div class="card d-flex flex-column p-3 flex-md-row z-3">
    <vue-qr-code :scale="scaleQr" :content="address" />
    <div
      class="d-flex flex-column align-items-start justify-content-center ms-md-3"
    >
      <div v-if="addressType" class="badge text-bg-primary mt-2 mt-md-0">
        {{ addressType }}
      </div>
      <span class="d-flex">
        <BaseCopy class="my-1 align-items-center" copy warp :text="address" />
        <i
          ref="scaleQrBtn"
          class="ms-2 uicon-arrows-alt"
          style="font-size: 14px"
          @click="scaleQr = !scaleQr"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAddressType } from "@/module/bitcoin";

const props = defineProps<{
	address: string;
}>();
const scaleQrBtn = ref();
const scaleQr = ref(false);

const outsideClick = (event: MouseEvent) => {
	if (scaleQrBtn.value !== event.target && scaleQr.value) {
		scaleQr.value = false;
	}
};
document.addEventListener("click", outsideClick);

const addressType = computed(() => getAddressType(props.address));
</script>

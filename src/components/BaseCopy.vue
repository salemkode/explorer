<template>
  <span
    :class="{
      'text-break': !!props.warp,
    }"
  >
    <PopOver :msg="props.short ? '' + props.text : ''">
      <NuxtLink :to="props.url" class="copy">
        {{ text }}
      </NuxtLink>
    </PopOver>
    <img
      v-if="props.text && props.copy"
      src="~/assets/icons/duplicate.svg"
      width="16"
      class="copy-icon align-items-center"
      @click="copy"
    />
    <div class="copy-popup" :class="{ show: showPopup }">copied!</div>
  </span>
</template>

<script setup lang="ts">
import { shortTx } from "~/module/utils";

const text = computed(() => {
  if (props.short && typeof props.text === "string") {
    return shortTx(props.text);
  } else {
    return props.text;
  }
});
const props = defineProps<{
  text: string | number;
  short?: boolean;
  url?: string;
  copy: boolean;
  warp?: boolean;
}>();
const showPopup = ref(false);

// Copy without navigator.clipboard
function fallbackCopyTextToClipboard(text: string): void {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy", true);
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

const copy = async () => {
  window.setTimeout(() => (showPopup.value = false), 1000);
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard("" + props.text);
    showPopup.value = true;
    return;
  }

  /* Modern browser */
  await navigator.clipboard.writeText("" + props.text);
  showPopup.value = true;
};
</script>

<style scoped>
.copy {
  font-family: monospace;
  text-decoration: none;
  color: initial;
}

.copy-icon {
  margin: 0px 2px;
  cursor: pointer;
}

.copy-popup {
  position: fixed;
  bottom: 50px;
  left: 50%;
  background: #6c757d;
  color: white;
  padding: 10px 30px;
  border-radius: 50px;
  transform: translateX(-50%);
  transition: opacity 0.5s;
  opacity: 0;
  font-size: 16px;
}

.copy-popup.show {
  opacity: 1;
}
</style>

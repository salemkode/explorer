<template>
  <span ref="reference" class="reference" @mouseover="update">
    <slot />
  </span>
  <div
    v-if="props.msg"
    ref="floating"
    :style="{
      position: strategy,
      top: `${(y || 0) - 15}px`,
      left: `${x || 0}px`,
      width: '300px',
    }"
    class="bg-black p-1 px-2 rounded-1 text-white floating"
  >
    {{ props.msg || "message" }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { autoUpdate, useFloating } from "@floating-ui/vue";

const props = defineProps<{ msg: string }>();
const reference = ref(null);
const floating = ref(null);
const { x, y, strategy, update } = useFloating(reference, floating, {
  strategy: "fixed",
  placement: "top",
  whileElementsMounted: autoUpdate,
});
</script>

<style>
.floating {
  opacity: 0;
  transition: opacity 0.5s;
  font-size: 12.5px;
  margin-bottom: 5px;
}
.floating::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 100%;
  border: solid 10px transparent;
  border-top-color: black;
  transform: translate(-50%, 0);
  border-radius: 1px;
}
.reference:hover ~ .floating {
  opacity: 1;
}
</style>

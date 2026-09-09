<template>
  <Transition name="dialog-fade">
    <div
      v-if="open"
      class="settings-dialog"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="settings-backdrop" @click="emit('close')" />
      <section class="settings-panel card">
        <header class="settings-header">
          <div>
            <h5 class="mb-1">{{ $t("settings") }}</h5>
            <p class="mb-0 settings-subtitle">Preferences</p>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="emit('close')"
          />
        </header>
        <div class="settings-body">
          <h6 class="mb-3">{{ $t("address_display_format") }}</h6>
          <div class="options-grid">
            <label
              class="option-card"
              :class="{ active: addressDisplayMode === 'token' }"
            >
              <input
                v-model="addressDisplayMode"
                class="form-check-input"
                type="radio"
                value="token"
              />
              <span class="option-title">{{ $t("token_address") }}</span>
              <small class="option-text">Shows token-enabled cashaddr format</small>
            </label>

            <label
              class="option-card"
              :class="{ active: addressDisplayMode === 'regular' }"
            >
              <input
                v-model="addressDisplayMode"
                class="form-check-input"
                type="radio"
                value="regular"
              />
              <span class="option-title">{{ $t("regular_address") }}</span>
              <small class="option-text">Shows regular cashaddr format</small>
            </label>
          </div>
          <hr class="my-4" />
          <IpfsGatewaySettings heading-tag="h6" />
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary px-4" @click="emit('close')">
            Done
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";

const emit = defineEmits<(event: "close") => void>();

const props = defineProps<{
	open: boolean;
}>();

const onKeydown = (event: KeyboardEvent) => {
	if (event.key === "Escape" && props.open) {
		emit("close");
	}
};

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
	document.body.style.overflow = "";
});

watch(
	() => props.open,
	(value) => {
		document.body.style.overflow = value ? "hidden" : "";
	},
);
</script>

<style scoped>
.settings-dialog {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 20px;
}

.settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
}

.settings-panel {
  position: relative;
  z-index: 1;
  width: min(560px, 100%);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--bs-border-color);
}

.settings-subtitle {
  font-size: 13px;
  opacity: 0.7;
}

.settings-body {
  padding: 18px 20px;
}

.options-grid {
  display: grid;
  gap: 10px;
}

.option-card {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  row-gap: 2px;
  align-items: center;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    transform 0.25s ease,
    background-color 0.25s ease;
}

.option-card:hover {
  transform: translateY(-1px);
  border-color: var(--bs-primary);
}

.option-card.active {
  border-color: var(--bs-primary);
  background: color-mix(in srgb, var(--bs-primary) 14%, transparent);
}

.option-title {
  font-weight: 600;
}

.option-text {
  grid-column: 2;
  font-size: 12px;
  opacity: 0.75;
}

.settings-actions {
  padding: 0 20px 20px;
  display: flex;
  justify-content: end;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>

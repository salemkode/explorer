<script setup lang="ts">
import { useRegistryStore } from "~/store";
type Status = {
	type: "ready" | "loading";
	errorMessage?: string;
};
const registryStore = useRegistryStore();
const url = ref("");
const status = ref<Status>({
	type: "ready",
});

const addRegisters = async () => {
	status.value.type = "loading";
	const result = await registryStore.addRegistryProvider(url.value);
	status.value = {
		type: "ready",
		errorMessage: result.errorMessage,
	};
};
</script>

<template>
  <div class="card p-3 h-max-content">
    <h4 class="mb-3">Add your own registers</h4>
    <p>
      Control who you want to verify the tokens from and who you take the token
      data from.
    </p>
    <b class="m-1"> You must trust the provider. </b>
    <div class="input-group">
      <input
        v-model="url"
        name="register-url"
        type="text"
        class="form-control"
        placeholder="Registers Url"
        :disabled="status.type !== 'ready'"
      />
      <button
        type="button"
        :disabled="status.type !== 'ready'"
        class="btn border d-flex align-items-center gap-1"
        @click="addRegisters"
      >
        <span class="ms-3">Add</span>
        <LoadingSpinner
          small
          :class="{ 'opacity-0': status.type !== 'loading' }"
        />
      </button>
    </div>
    <small> {{ status.errorMessage }} <span class="opacity-0">L</span> </small>
  </div>
</template>

<template>
  <div
    v-if="typeof registry.registryIdentity === 'object'"
    class="card p-3 h-max-content pointer"
    @click="open = !open"
  >
    <div class="content d-flex flex-column flex-md-row gap-3">
      <div>
        <BcmrIcon
          :token-category="registry.registryIdentity.name"
          :icon="registry.registryIdentity.uris?.icon || ''"
          rounded
        />
      </div>
      <div v-if="typeof registry.registryIdentity !== 'string'" class="w-100">
        <div class="d-flex w-100 justify-content-between mb-1">
          <h5 v-text="registry.registryIdentity.name" />
          <small
            class="white-space-nowrap"
            v-text="formatTimeAgo(registry.latestRevision)"
          />
        </div>
        <p class="mb-1" v-text="registry.registryIdentity.description || ''" />
        <div v-if="registry.registryIdentity.tags" class="mb-2">
          <span
            v-for="tag in registry.registryIdentity.tags"
            :key="tag"
            class="badge text-bg-primary"
            v-text="tag"
          />
        </div>
      </div>
    </div>
    <SliderUpDown :active="open" @click.stop>
      <TableView
        title="Register tokens"
        :rows="transactions"
        :columns="['token', 'category', 'symbol']"
        :has-prev-page="!!pagination"
        :has-next-page="pagination < maxPagination"
        header-less
        :style="{
          '--bs-table-striped-bg': 'none',
        }"
        class="mt-3"
        @next="maxPagination++"
        @previous="maxPagination--"
      />
      <div class="d-flex mt-3">
        <DropDown class="d-md-none" :title="$t('uris')" :items="uris" />
        <a
          v-for="url in uris"
          :key="url.name"
          :href="url.href"
          target="_blank"
          class="btn d-none d-md-block"
          v-text="$t(url.name)"
        />
      </div>
    </SliderUpDown>
  </div>
</template>

<script setup lang="ts">
import type { Registry, tableColumn } from "~/types";
import { formatTimeAgo } from "~/module/utils";
import { useRegistryStore } from "~/store";
const open = ref(false);

const props = defineProps<{
  url: string;
  registry: Registry;
}>();

const registryStore = useRegistryStore();
const limit = 8;
const pagination = ref(0);
const maxPagination = ref(
  Object.keys(props.registry.identities || {}).length / limit
);
const transactions = computed<tableColumn[][]>(() => {
  const identities = Object.keys(props.registry.identities || {});

  return identities
    .map((identity) => {
      const metadata = registryStore.getTokenFromRegister(
        props.registry,
        identity
      );
      if (!metadata) return;
      const icon = metadata.uris ? metadata.uris["icon"] : "";
      const category = metadata.token?.category || "N/A";
      return [
        {
          text: metadata.name || "N/A",
          token: {
            category,
            icon: icon || "",
          },
          url: `/token/${category}`,
        },
        {
          text: category,
          short: true,
          copy: true,
          url: `/token/${category}`,
        },
        {
          text: metadata.token?.symbol || "N/A",
        },
      ];
    })
    .filter(Boolean);
});

const uris = computed(() => {
  const registryIdentity = props.registry.registryIdentity;

  // TODO: add auth chain support.
  if (typeof registryIdentity !== "object") return [];
  return [
    {
      name: "website",
      href: registryIdentity?.uris?.web || "",
    },
    {
      name: "blog",
      href: registryIdentity?.uris?.blog || "",
    },
    {
      name: "chat",
      href: registryIdentity?.uris?.chat || "",
    },
    {
      name: "forum",
      href: registryIdentity?.uris?.forum || "",
    },
    {
      name: "raw",
      href: props.url,
    },
  ].filter((url) => Boolean(url.href));
});
</script>

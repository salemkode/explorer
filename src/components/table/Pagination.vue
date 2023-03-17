<template>
  <div class="tabel-container">
    <Loading :loading="status.loading">
      <div class="table-warp">
        <table class="table table-striped">
          <thead v-if="headers">
            <tr>
              <td
                v-for="(header, key) in headers"
                :key="key"
                v-text="header ? $t(header) : ''"
              />
            </tr>
          </thead>
          <tbody>
            <table-row
              v-for="(cells, key) in status.items"
              :key="key"
              :cells="cells"
            />
          </tbody>
        </table>
      </div>
    </Loading>
    <pagination-nav :itemsLength="pages" @change="onPaginationChange" />
  </div>
</template>

<script lang="ts">
// Modules
import { defineComponent, reactive } from "vue";

// Types
import { PropType } from "vue";
import { table_row } from "@/types/table.type";

// Components
import PaginationNav from "@/components/global/PaginationNav.vue";
import TableRow from "@/components/global/table/TableRow.vue";

//
export default defineComponent({
  components: { PaginationNav, TableRow },
  name: "PaginationTable",
  props: {
    headers: {
      type: Object as PropType<string[]>,
    },
    items: {
      type: Object as PropType<table_row[]>,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },
    change: {
      type: Function as PropType<(index: number) => Promise<table_row[]>>,
      required: true,
    },
  },
  setup(props) {
    //
    let status = reactive({
      loading: false,
      items: props.items,
    });

    //
    async function onPaginationChange(index: number) {
      // Start loading
      status.loading = true;

      // Run change event
      status.items = await props.change(index);

      // Stop loading
      status.loading = false;
    }

    //
    return {
      status,
      onPaginationChange,
    };
  },
});
</script>

<style scoped>
.table-warp {
  overflow-x: auto;
}

.table thead td {
  white-space: nowrap;
}
</style>

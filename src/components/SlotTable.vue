<script setup>
// A "renderless-ish" table: it owns layout + iteration, the PARENT owns how each
// cell looks via SCOPED SLOTS. This is the pattern behind Element Plus / PrimeVue
// table columns.
defineProps({
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, required: true },
})
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          <!-- named + scoped: parent can override a header, gets the column object -->
          <slot :name="`head-${col.key}`" :column="col">{{ col.label }}</slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="row.id ?? i">
        <td v-for="col in columns" :key="col.key">
          <!-- SCOPED SLOT: child exposes data (row, value) up to the parent's template -->
          <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
            {{ row[col.key] }}
          </slot>
        </td>
      </tr>
      <tr v-if="!rows.length">
        <td :colspan="columns.length">
          <slot name="empty">No data.</slot>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="$slots.footer">
      <tr>
        <td :colspan="columns.length"><slot name="footer" /></td>
      </tr>
    </tfoot>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
th,
td {
  text-align: left;
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
}
th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}
</style>

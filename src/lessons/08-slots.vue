<script setup>
import { ref } from 'vue'
import SlotTable from '@/components/SlotTable.vue'

const columns = [
  { key: 'id', label: 'Shipment' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'onTime', label: 'Status' },
  { key: 'cost', label: 'Cost' },
]
const rows = ref([
  { id: 'SHP-1001', carrier: 'Maersk', onTime: true, cost: 1240 },
  { id: 'SHP-1002', carrier: 'DHL', onTime: false, cost: 880 },
  { id: 'SHP-1003', carrier: 'DB Schenker', onTime: true, cost: 1510 },
])
</script>

<template>
  <div>
    <h1>08 · Slots: default, named, scoped</h1>
    <p>Slots let a parent inject markup into a child. <strong>Scoped slots</strong> also pass data
      back out — the key to reusable table/list components.</p>

    <div class="demo-box">
      <SlotTable :columns="columns" :rows="rows">
        <!-- scoped slot: we receive { row, value } from the child -->
        <template #cell-onTime="{ value }">
          <BaseBadge :tone="value ? 'success' : 'danger'">
            {{ value ? 'On time' : 'Late' }}
          </BaseBadge>
        </template>

        <template #cell-cost="{ value }">
          ${{ value.toLocaleString() }}
        </template>

        <template #head-id> 🚚 ID </template>

        <template #footer>
          {{ rows.length }} shipments · total
          ${{ rows.reduce((n, r) => n + r.cost, 0).toLocaleString() }}
        </template>
      </SlotTable>

      <button @click="rows = []">clear rows (see #empty fallback)</button>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>Default slot</strong>: <code>&lt;slot /&gt;</code> + fallback content between the tags if the parent passes nothing.</li>
        <li><strong>Named slots</strong>: <code>&lt;slot name="header" /&gt;</code> ⇐ <code>&lt;template #header&gt;</code>.</li>
        <li><strong>Scoped slots</strong>: child does <code>&lt;slot :row="row" /&gt;</code>, parent reads <code>&lt;template #x="{ row }"&gt;</code>. This is how you build a generic <code>&lt;DataTable&gt;</code> whose columns are defined by the consumer.</li>
        <li>Check slot presence with <code>useSlots()</code> / <code>$slots.footer</code> to conditionally render wrappers.</li>
        <li>Slot content is compiled in the <em>parent's</em> scope — it can't see the child's internals except what the child exposes via slot props.</li>
        <li>"Renderless components" take this to the extreme: a component that renders only a slot and provides behaviour/data (largely replaced by composables now).</li>
      </ul>
    </details>
  </div>
</template>

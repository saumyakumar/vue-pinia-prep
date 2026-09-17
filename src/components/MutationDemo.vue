<script setup>
// The child from lesson 06's new "modifying a prop" section. It demonstrates the
// anti-pattern AND the three correct fixes, side by side.
import { ref, watch, computed } from 'vue'

const props = defineProps({ count: { type: Number, required: true } })
const emit = defineEmits(['update:count'])

// ── ANTI-PATTERN ─────────────────────────────────────────────────────────────
// Mutating a prop directly. In dev, Vue's props object is readonly at the top
// level: the assignment is BLOCKED (the value does not actually change) and a
// warning is logged. In production that dev check is stripped out, so it would
// silently "work" for one tick — until the parent re-renders and overwrites it
// with the real value anyway. Either way: never do this.
const lastWarning = ref('')
function mutateDirectly() {
  const original = console.warn
  console.warn = (...args) => {
    lastWarning.value = args.join(' ')
    original(...args)
  }
  try {
    // ESLint catches this too (vue/no-mutating-props, part of flat/essential) —
    // in real code this line fails `npm run lint` before you'd even run it.
    // eslint-disable-next-line vue/no-mutating-props -- deliberate, for the demo.
    props.count++
  } finally {
    console.warn = original
  }
}

// ── FIX A: emit and let the parent own the change ───────────────────────────
function correctViaEmit() {
  emit('update:count', props.count + 1)
}

// ── FIX B: a local draft, initialised from the prop, explicitly committed ───
// Good when the user should be able to type/edit freely before it "counts"
// (a form field seeded from a prop). Resync if the parent changes the prop
// out from under you (e.g. a websocket update) while the user isn't editing.
const draft = ref(props.count)
watch(
  () => props.count,
  (v) => (draft.value = v),
)
function commitDraft() {
  emit('update:count', draft.value)
}

// ── FIX C: a writable computed proxy ─────────────────────────────────────────
// Reads the prop, writes by emitting. This IS what defineModel() generates for
// you (lesson 07) — worth knowing how to hand-roll for a non-model prop, or in
// Vue <3.4 codebases.
const proxied = computed({
  get: () => props.count,
  set: (v) => emit('update:count', v),
})
</script>

<template>
  <div class="demo-child">
    <p>prop <code>count</code> = <strong>{{ count }}</strong></p>

    <div class="row">
      <BaseButton size="sm" variant="danger" @click="mutateDirectly">
        mutate prop directly (anti-pattern)
      </BaseButton>
      <BaseButton size="sm" @click="correctViaEmit">emit update:count (fix A)</BaseButton>
    </div>
    <p v-if="lastWarning" class="warn">⚠️ Vue said: {{ lastWarning }}</p>

    <div class="row">
      <label>Fix B — local draft: <input v-model.number="draft" type="number" style="width: 70px" /></label>
      <BaseButton size="sm" variant="secondary" @click="commitDraft">commit draft →</BaseButton>
    </div>

    <div class="row">
      <label>Fix C — writable computed: <input v-model.number="proxied" type="number" style="width: 70px" /></label>
      <span><small>(every keystroke emits immediately)</small></span>
    </div>
  </div>
</template>

<style scoped>
.demo-child {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-2) 0;
}
.warn {
  color: var(--color-danger);
  font-size: 0.82rem;
}
input {
  padding: 4px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
</style>

<script setup>
// This project is JS first. This lesson is the on-ramp to the TypeScript pass.
</script>

<template>
  <div>
    <h1>35 · TypeScript migration</h1>

    <div class="lesson-note">
      <strong>Why the JD wants it:</strong> Vue 3, Pinia, and Vue Router are TS-first. Types catch
      prop/emit/store-shape mistakes at build time, make refactors safe, and are the norm on
      enterprise teams.
    </div>

    <div class="lesson-note">
      <strong>The migration, incrementally</strong>
      <ol>
        <li>Add <code>typescript</code>, <code>vue-tsc</code>; <code>tsconfig.json</code> (extend <code>@vue/tsconfig</code>); set <code>"build": "vue-tsc --noEmit &amp;&amp; vite build"</code>.</li>
        <li>Rename files to <code>.ts</code> / add <code>lang="ts"</code> to <code>&lt;script setup&gt;</code> one module at a time — JS and TS coexist.</li>
        <li>Start with leaf modules (utils, <code>api/</code>, composables), then stores, then components.</li>
        <li>Turn on <code>strict</code> from day one on new files; loosen only if a legacy file fights you.</li>
      </ol>
    </div>

    <div class="lesson-note">
      <strong>The Vue-specific type patterns</strong>
      <pre>
// props: generic form, with defaults
const props = withDefaults(
  defineProps&lt;{ label: string; tone?: 'good' | 'bad'; delta?: number }&gt;(),
  { tone: 'good', delta: 0 },
)

// emits: call-signature form
const emit = defineEmits&lt;{
  (e: 'drilldown', payload: { label: string }): void
  (e: 'update:modelValue', v: string): void
}&gt;()

// v-model
const model = defineModel&lt;number&gt;({ default: 0 })

// refs
const items = ref&lt;Shipment[]&gt;([])
const el = useTemplateRef&lt;HTMLDivElement&gt;('el')

// composable: type inputs as MaybeRefOrGetter, return typed refs
export function useFetch&lt;T&gt;(url: MaybeRefOrGetter&lt;string&gt;) {
  const data = shallowRef&lt;T | null&gt;(null)
  // ...
  return { data, error, loading }
}

// Pinia setup store infers types from what you return.
// Option store: state() return type is inferred; getters/actions typed via `this`.

// Router: declare route meta
declare module 'vue-router' {
  interface RouteMeta { requiresAuth?: boolean; title?: string }
}
      </pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>defineProps</code>/<code>defineEmits</code>/<code>defineModel</code> take generic type args — no runtime <code>PropType</code> gymnastics. <code>withDefaults</code> for prop defaults.</li>
        <li><code>vue-tsc</code> type-checks <code>.vue</code> files (the IDE uses Volar/"Vue - Official"). Run it in <code>build</code> and CI.</li>
        <li>Pinia setup stores get full inference for free; option stores infer state and type <code>this</code> in getters/actions.</li>
        <li>Type the API layer once (response DTOs) and the types flow through composables → stores → components.</li>
        <li><code>MaybeRefOrGetter&lt;T&gt;</code> + <code>toValue()</code> is the idiom for flexible composable inputs.</li>
        <li>Augment <code>RouteMeta</code> so <code>to.meta.requiresAuth</code> is typed in guards.</li>
        <li>Migration is file-by-file; a mixed JS/TS codebase is fine and normal mid-migration.</li>
      </ul>
    </details>
  </div>
</template>

<script setup>
// This whole app IS a small design system (src/design-system/). This lesson makes
// the principles explicit and shows the component APIs in one place.
</script>

<template>
  <div>
    <h1>30 · Design systems &amp; component libraries</h1>

    <div class="lesson-note">
      <strong>The layers</strong> (all in <code>src/design-system/</code>):
      <ol>
        <li><strong>Tokens</strong> (<code>tokens.css</code>): CSS custom properties for color / space / type / radius / shadow, redefined under <code>[data-theme="dark"]</code>. Components reference tokens, never raw values. Change a token → whole app updates.</li>
        <li><strong>Primitives</strong>: <code>BaseButton</code>, <code>BaseInput</code>, <code>BaseCard</code>, <code>BaseBadge</code>, <code>BaseSpinner</code> — small, single-purpose, styleable only through their prop API.</li>
        <li><strong>Patterns</strong>: <code>BaseModal</code> (Teleport + focus trap), <code>BaseTabs</code> (ARIA + roving tabindex), <code>ToastHost</code> + <code>useToast</code>.</li>
        <li><strong>Distribution</strong>: <code>index.js</code> exports each component and an <code>install()</code> plugin that registers them globally.</li>
      </ol>
    </div>

    <div class="demo-box">
      <h3>BaseButton — enumerated variants, not class soup</h3>
      <div class="row">
        <BaseButton>primary</BaseButton>
        <BaseButton variant="secondary">secondary</BaseButton>
        <BaseButton variant="ghost">ghost</BaseButton>
        <BaseButton variant="danger">danger</BaseButton>
        <BaseButton :loading="true">loading</BaseButton>
        <BaseButton size="sm">sm</BaseButton>
        <BaseButton size="lg">lg</BaseButton>
      </div>

      <h3>BaseCard — named slots as the API</h3>
      <BaseCard>
        <template #header>Card header slot</template>
        Body (default slot). Slots let the consumer own content while the component owns layout.
        <template #footer><BaseButton size="sm">Footer action</BaseButton></template>
      </BaseCard>

      <h3>BaseBadge tones</h3>
      <div class="row">
        <BaseBadge>neutral</BaseBadge>
        <BaseBadge tone="success">success</BaseBadge>
        <BaseBadge tone="warning">warning</BaseBadge>
        <BaseBadge tone="danger">danger</BaseBadge>
        <BaseBadge tone="info">info</BaseBadge>
      </div>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>Tokens are the system.</strong> Everything else references them. Support theming by redefining tokens, not by rewriting components.</li>
        <li><strong>Constrain the API</strong>: enumerated <code>variant</code>/<code>size</code>/<code>tone</code> props with <code>validator</code>s beat free-form class strings — consistency by construction.</li>
        <li><strong>Slots are the extension API</strong>: named slots for regions, scoped slots for "you render this item, here's its data" (e.g. a <code>&lt;DataTable&gt;</code> column). Check <code>useSlots()</code> to render wrappers conditionally.</li>
        <li><strong>Controlled vs uncontrolled</strong>: expose <code>v-model</code> for controlled use; keep a sensible internal default so the component works uncontrolled too (see <code>BaseTabs</code>).</li>
        <li><strong>Attribute fallthrough</strong>: set <code>inheritAttrs: false</code> + <code>v-bind="$attrs"</code> to forward <code>class</code>/listeners/aria to the right inner element (see <code>BaseInput</code>).</li>
        <li><strong>Accessibility is part of the component</strong>, not the consumer's problem: label association, ARIA roles, focus management baked in.</li>
        <li>Document with a live catalog (Storybook / Histoire) — states, props, do/don't. This lesson page is a mini version.</li>
        <li>Global-register for app convenience vs explicit imports for tree-shaking in a shipped library — pick per context.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  align-items: center;
}
</style>

<script setup>
import { ref, computed } from 'vue'

// XSS demo: Vue escapes {{ }} and :attr bindings automatically. v-html does NOT.
// The payload below runs JS via an <img onerror> — but instead of alert() (noisy)
// it just replaces itself with a warning, proving arbitrary code executed.
const userInput = ref(
  `<img src=x onerror="this.replaceWith('🚨 onerror JS executed')"> <b>bold text</b>`,
)

// A tiny allow-list sanitizer. Real apps: DOMPurify.
function sanitize(dirty) {
  const tpl = document.createElement('template')
  tpl.innerHTML = dirty
  tpl.content.querySelectorAll('*').forEach((el) => {
    if (!['B', 'I', 'EM', 'STRONG', 'A', 'P', 'BR'].includes(el.tagName)) {
      el.replaceWith(...el.childNodes)
      return
    }
    ;[...el.attributes].forEach((a) => {
      if (a.name.startsWith('on') || (a.name === 'href' && a.value.trim().toLowerCase().startsWith('javascript:'))) {
        el.removeAttribute(a.name)
      }
    })
  })
  return tpl.innerHTML
}
const safeHtml = computed(() => sanitize(userInput.value))
</script>

<template>
  <div>
    <h1>33 · Secure frontend practices</h1>

    <div class="demo-box">
      <h3>XSS &amp; <code>v-html</code></h3>
      <label for="xss">Untrusted input</label>
      <input id="xss" v-model="userInput" style="width: 100%" />
      <table class="cmp">
        <tr>
          <td>Text interpolation <code v-pre>{{ userInput }}</code></td>
          <td class="out">{{ userInput }}</td>
          <td><BaseBadge tone="success">safe — escaped</BaseBadge></td>
        </tr>
        <tr>
          <td><code>v-html="userInput"</code></td>
          <td class="out"><span v-html="userInput" /></td>
          <td><BaseBadge tone="danger">DANGER — runs markup</BaseBadge></td>
        </tr>
        <tr>
          <td><code>v-html="sanitize(userInput)"</code></td>
          <td class="out"><span v-html="safeHtml" /></td>
          <td><BaseBadge tone="warning">ok if sanitizer is solid</BaseBadge></td>
        </tr>
      </table>
    </div>

    <div class="lesson-note">
      <strong>The rest of the checklist</strong>
      <ul>
        <li><strong>Never <code>v-html</code> user content</strong> without DOMPurify. Same for <code>innerHTML</code>, <code>outerHTML</code>, chart tooltip <code>formatter</code>s that return HTML.</li>
        <li><strong>Dynamic attributes</strong>: <code>:href</code>/<code>:src</code> with user data → validate the scheme (block <code>javascript:</code>, <code>data:</code>). <code>:style</code> with a raw string can inject; prefer the object form.</li>
        <li><strong>Never build a component from user input</strong>: <code>&lt;component :is&gt;</code> must map through an allow-list, never a raw string/URL.</li>
        <li><strong>Auth tokens</strong>: <code>httpOnly</code>, <code>Secure</code>, <code>SameSite</code> cookies are safest (JS can't read them → XSS can't exfiltrate). <code>localStorage</code> is convenient but XSS-readable — an accepted risk for many SPAs; if you use it, keep tokens short-lived + refresh. This repo's <code>auth</code> store uses localStorage and says so.</li>
        <li><strong>CSRF</strong>: cookie auth needs a CSRF token or <code>SameSite=Lax/Strict</code>. Token-in-header auth is not CSRF-prone.</li>
        <li><strong>CORS</strong> is enforced by the browser on the API's <code>Access-Control-*</code> headers — it's not a client-side control; don't rely on it for security.</li>
        <li><strong>CSP</strong>: a strong Content-Security-Policy header is the backstop that neuters injected scripts. Avoid <code>unsafe-inline</code>.</li>
        <li><strong>Dependencies</strong>: <code>npm audit</code> in CI, Dependabot/Renovate, lockfile committed, review transitive additions. (This repo: 0 vulnerabilities.)</li>
        <li><strong>Secrets</strong>: anything in <code>VITE_*</code> ships to the browser. No private keys in frontend env.</li>
        <li><strong>Don't trust the client</strong>: every validation/authorization must be re-checked server-side. Frontend checks are UX, not security.</li>
      </ul>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Vue auto-escapes text and attribute bindings → XSS is mostly a <code>v-html</code> / raw-DOM problem. Audit every <code>v-html</code>.</li>
        <li>Token storage is a real trade-off question: httpOnly cookie (XSS-safe, needs CSRF handling) vs localStorage (XSS-readable, no CSRF). Be able to argue both.</li>
        <li>CSP is your safety net when an XSS slips through.</li>
        <li>CORS ≠ security control; server-side authz is the only real gate.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-3) 0 var(--space-2);
}
.cmp {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--space-3);
}
.cmp td {
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  vertical-align: top;
  font-size: 0.85rem;
}
.cmp .out {
  background: var(--color-surface-2);
}
</style>

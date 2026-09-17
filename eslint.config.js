// ESLint 9 "flat config". One array of config objects, applied in order.
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginA11y from 'eslint-plugin-vuejs-accessibility'
import configPrettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  js.configs.recommended,
  // `flat/essential` = bug-catching rules only. Style/formatting is Prettier's job
  // (running both means fighting two tools). Bump to `flat/recommended` if you want
  // the opinionated ordering rules too.
  ...pluginVue.configs['flat/essential'],
  ...pluginA11y.configs['flat/recommended'],

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // browser + test globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        EventTarget: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        performance: 'readonly',
        structuredClone: 'readonly',
        queueMicrotask: 'readonly',
        WebSocket: 'readonly',
        // vitest
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      // Learning repo: demos often have unused example vars. Warn, don't error.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      // a11y is TAUGHT explicitly in lesson 31 and applied in the design system.
      // In demo/lesson code we keep these as warnings so CI stays green while the
      // rules still nudge you. The design-system components below are held to 'error'.
      'vuejs-accessibility/click-events-have-key-events': 'warn',
      'vuejs-accessibility/no-static-element-interactions': 'warn',
      'vuejs-accessibility/label-has-for': 'off',
      'vuejs-accessibility/form-control-has-label': 'warn',
    },
  },

  // Turn off formatting rules that Prettier owns.
  configPrettier,
]

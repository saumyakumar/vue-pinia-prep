// Barrel + Vue plugin for the design system.
//
// `app.use(designSystem)` registers every Base* component GLOBALLY, so lesson
// files can use <BaseButton> without importing it each time. In a real product you
// might prefer explicit imports (better tree-shaking, clearer dependencies) — this
// global style is a deliberate convenience for a learning repo. Lesson 30 discusses
// the trade-off.
import BaseButton from './BaseButton.vue'
import BaseCard from './BaseCard.vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseBadge from './BaseBadge.vue'
import BaseSpinner from './BaseSpinner.vue'
import BaseModal from './BaseModal.vue'
import BaseTabs from './BaseTabs.vue'
import ToastHost from './ToastHost.vue'

export {
  BaseButton,
  BaseCard,
  BaseInput,
  BaseSelect,
  BaseBadge,
  BaseSpinner,
  BaseModal,
  BaseTabs,
  ToastHost,
}
export { useToast } from './useToast'

const components = {
  BaseButton,
  BaseCard,
  BaseInput,
  BaseSelect,
  BaseBadge,
  BaseSpinner,
  BaseModal,
  BaseTabs,
  ToastHost,
}

export default {
  install(app) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}

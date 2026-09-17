// OPTION STORE style — looks like the Options API: state / getters / actions.
// Good when you like the structure and the mental model of "this is my data,
// these are computed views, these are the things that change it".
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // state MUST be a function returning an object (so each app/test gets a fresh one).
  state: () => ({
    count: 0,
    history: [],
  }),

  getters: {
    // like computed: cached, re-runs when dependencies change.
    double: (state) => state.count * 2,
    // a getter that returns a function => "getter with an argument".
    isMultipleOf: (state) => (n) => state.count % n === 0,
  },

  actions: {
    // `this` is the store. Actions can be async.
    increment(by = 1) {
      this.count += by
      this.history.push(this.count)
    },
    reset() {
      // $reset() only exists on OPTION stores (it knows the initial state()).
      this.$reset()
    },
  },
})

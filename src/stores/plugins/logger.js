// A hand-written Pinia plugin. A plugin is just a function that receives a context
// ({ store, app, pinia, options }) once per store, and can:
//   - add properties to every store  (return an object, or assign store.$xxx)
//   - subscribe to state changes     (store.$subscribe)
//   - subscribe to actions           (store.$onAction)
//
// This one logs every action call with its arguments and duration. Lesson 21.
export default function loggerPlugin({ store }) {
  // Give every store a `$log` helper (contrived, but shows property injection).
  store.$log = (...args) => console.log(`[${store.$id}]`, ...args)

  store.$onAction(({ name, args, after, onError }) => {
    const start = performance.now()
    after((result) => {
      const ms = (performance.now() - start).toFixed(1)
      console.log(`[pinia] ${store.$id}.${name}(${args.length} args) ✓ ${ms}ms`, result)
    })
    onError((error) => {
      console.warn(`[pinia] ${store.$id}.${name} threw`, error)
    })
  })
}

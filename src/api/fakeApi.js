// A fake backend used by the Pinia lessons so async actions, loading and error
// states are REAL (artificial latency + a configurable failure rate).
//
// Milestone B replaces/extends this with `http.js` (a real fetch wrapper) and
// `fakeServer.js` (a bigger dataset + pagination) for the REST + dashboard lessons.

const CARRIERS = ['Maersk', 'DHL', 'Kuehne+Nagel', 'DB Schenker', 'Expeditors']

const PRODUCTS = [
  { id: 'p1', name: 'Pallet wrap', price: 24 },
  { id: 'p2', name: 'Shipping label roll', price: 8 },
  { id: 'p3', name: 'Thermal printer', price: 210 },
  { id: 'p4', name: 'Barcode scanner', price: 95 },
  { id: 'p5', name: 'Load bar', price: 40 },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Toggle from a lesson to see error handling kick in.
export const config = { latency: 500, failureRate: 0 }

async function simulate() {
  await delay(config.latency + Math.random() * 200)
  if (Math.random() < config.failureRate) {
    const err = new Error('Simulated server error (500)')
    err.status = 500
    throw err
  }
}

export const api = {
  async getProducts() {
    await simulate()
    return structuredClone(PRODUCTS)
  },

  async getShipments({ page = 1, pageSize = 10 } = {}) {
    await simulate()
    const total = 87
    const start = (page - 1) * pageSize
    const rows = Array.from({ length: Math.min(pageSize, total - start) }, (_, i) => {
      const n = start + i + 1
      return {
        id: `SHP-${1000 + n}`,
        carrier: CARRIERS[n % CARRIERS.length],
        origin: ['Shanghai', 'Rotterdam', 'LA', 'Hamburg'][n % 4],
        destination: ['Chicago', 'Munich', 'Singapore', 'Dubai'][n % 4],
        onTime: n % 3 !== 0,
        etaDays: 3 + (n % 12),
      }
    })
    return { rows, total, page, pageSize }
  },

  async login({ email, password }) {
    await simulate()
    if (!email || !password) {
      const err = new Error('Missing credentials')
      err.status = 400
      throw err
    }
    return { token: 'fake-jwt-token', user: { email, name: email.split('@')[0] } }
  },
}

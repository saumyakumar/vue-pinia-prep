// ─────────────────────────────────────────────────────────────────────────────
// MOCK BACKEND
// Installs a fetch interceptor for `/api/*` so the whole app runs with no server.
// Everything else passes through to the real network. This is the same idea as
// MSW (mswjs.io) — in a real project you'd use MSW for exactly this (dev + tests).
//
// `http.js` stays 100% real: it calls fetch(), gets a Response, parses JSON,
// handles status codes. Only the transport underneath is faked.
// ─────────────────────────────────────────────────────────────────────────────
import { makeShipments, KPI_SERIES } from './dataset'

const LATENCY = [120, 480] // ms range
// Bump from the REST lesson to see retry/backoff + error UI.
export const mockConfig = { failRate: 0, offline: false }

const shipments = makeShipments(50000) // big, for the virtual-scroll lesson

const routes = [
  {
    method: 'GET',
    match: /^\/api\/shipments$/,
    handler: (url) => {
      const page = Number(url.searchParams.get('page') ?? 1)
      const pageSize = Number(url.searchParams.get('pageSize') ?? 25)
      const q = (url.searchParams.get('q') ?? '').toLowerCase()
      const carrier = url.searchParams.get('carrier')
      const sort = url.searchParams.get('sort') ?? 'id'
      const dir = url.searchParams.get('dir') ?? 'asc'

      let rows = shipments
      if (q) rows = rows.filter((r) => r.id.toLowerCase().includes(q) || r.lane.toLowerCase().includes(q))
      if (carrier && carrier !== 'all') rows = rows.filter((r) => r.carrier === carrier)
      rows = [...rows].sort((a, b) => {
        const av = a[sort]
        const bv = b[sort]
        const c = av < bv ? -1 : av > bv ? 1 : 0
        return dir === 'asc' ? c : -c
      })

      const total = rows.length
      const start = (page - 1) * pageSize
      return { rows: rows.slice(start, start + pageSize), total, page, pageSize }
    },
  },
  {
    method: 'GET',
    match: /^\/api\/shipments\/([^/]+)$/,
    handler: (url, _body, [id]) => {
      const row = shipments.find((r) => r.id === id)
      if (!row) return { __status: 404, message: `No shipment ${id}` }
      return { ...row, notes: '', events: sampleEvents(row) }
    },
  },
  {
    method: 'GET',
    match: /^\/api\/kpis$/,
    handler: (url) => {
      const range = url.searchParams.get('range') ?? '30d'
      const points = range === '7d' ? 7 : range === '90d' ? 90 : 30
      return {
        range,
        cards: [
          kpiCard('on_time_pct', 'On-time %', 94.2, 0.021, '%'),
          kpiCard('avg_dwell_days', 'Avg dwell', 1.24, -0.08, 'd'),
          kpiCard('cost_per_shipment', 'Cost / shipment', 312, 0.043, '$'),
          kpiCard('exceptions', 'Open exceptions', 37, 0.12, ''),
        ],
        series: KPI_SERIES(points),
      }
    },
  },
  {
    method: 'PATCH',
    match: /^\/api\/shipments\/([^/]+)$/,
    handler: (url, body, [id]) => {
      const row = shipments.find((r) => r.id === id)
      if (!row) return { __status: 404, message: 'not found' }
      Object.assign(row, body)
      return { ...row }
    },
  },
]

function kpiCard(id, label, value, delta, unit) {
  return { id, label, value, delta, unit }
}

function sampleEvents(row) {
  const base = Date.now() - 1000 * 60 * 60 * 24 * 3
  return ['Booked', 'Picked up', 'In transit', row.onTime ? 'On schedule' : 'Delay reported'].map(
    (label, i) => ({ at: base + i * 3600_000 * 8, label }),
  )
}

const rand = (min, max) => min + Math.random() * (max - min)

let installed = false
export function installMockBackend() {
  if (installed) return
  installed = true
  const realFetch = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    // `input` may be a string, a URL object, or a Request.
    const href =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input?.url ?? String(input))
    const url = new URL(href, window.location.origin)
    if (!url.pathname.startsWith('/api/')) return realFetch(input, init)

    const method = (init.method ?? 'GET').toUpperCase()
    await new Promise((r) => setTimeout(r, rand(...LATENCY)))

    if (mockConfig.offline) return Promise.reject(new TypeError('Failed to fetch'))
    if (Math.random() < mockConfig.failRate) {
      return jsonResponse({ message: 'Simulated upstream failure', code: 'upstream' }, 503)
    }

    const route = routes.find((r) => r.method === method && r.match.test(url.pathname))
    if (!route) return jsonResponse({ message: `No mock for ${method} ${url.pathname}` }, 404)

    const params = url.pathname.match(route.match).slice(1)
    const body = init.body ? JSON.parse(init.body) : undefined
    const result = route.handler(url, body, params)
    const status = result?.__status ?? 200
    return jsonResponse(result, status)
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

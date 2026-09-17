// Deterministic-ish fake logistics data. Kept separate so both the mock backend
// and tests can import it.

const CARRIERS = ['Maersk', 'DHL', 'Kuehne+Nagel', 'DB Schenker', 'Expeditors', 'DSV']
const CITIES = ['Shanghai', 'Rotterdam', 'Los Angeles', 'Hamburg', 'Singapore', 'Dubai', 'Chicago', 'Antwerp']
const MODES = ['Ocean', 'Air', 'Rail', 'Road']
const STATUSES = ['Booked', 'In transit', 'Customs', 'Out for delivery', 'Delivered', 'Exception']

// tiny seeded PRNG so the 50k rows are stable across reloads
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeShipments(count) {
  const rnd = mulberry32(42)
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
  const rows = new Array(count)
  for (let i = 0; i < count; i++) {
    const origin = pick(CITIES)
    let dest = pick(CITIES)
    if (dest === origin) dest = CITIES[(CITIES.indexOf(dest) + 1) % CITIES.length]
    const etaDays = 2 + Math.floor(rnd() * 40)
    rows[i] = {
      id: `SHP-${100000 + i}`,
      carrier: pick(CARRIERS),
      mode: pick(MODES),
      lane: `${origin} → ${dest}`,
      origin,
      destination: dest,
      status: pick(STATUSES),
      onTime: rnd() > 0.18,
      etaDays,
      costUsd: Math.round(400 + rnd() * 8000),
      weightKg: Math.round(50 + rnd() * 24000),
      updatedAt: Date.now() - Math.floor(rnd() * 1000 * 60 * 60 * 72),
    }
  }
  return rows
}

// KPI time series for charts
export function KPI_SERIES(points) {
  const rnd = mulberry32(7)
  const out = { onTimePct: [], costPerShipment: [], volume: [] }
  let onTime = 92
  let cost = 320
  let vol = 1200
  const start = Date.now() - points * 86400000
  for (let i = 0; i < points; i++) {
    onTime = clamp(onTime + (rnd() - 0.5) * 3, 80, 99)
    cost = clamp(cost + (rnd() - 0.5) * 25, 220, 460)
    vol = clamp(vol + (rnd() - 0.5) * 180, 600, 2000)
    const t = start + i * 86400000
    out.onTimePct.push([t, round1(onTime)])
    out.costPerShipment.push([t, Math.round(cost)])
    out.volume.push([t, Math.round(vol)])
  }
  return out
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const round1 = (n) => Math.round(n * 10) / 10

export { CARRIERS, CITIES, MODES, STATUSES }

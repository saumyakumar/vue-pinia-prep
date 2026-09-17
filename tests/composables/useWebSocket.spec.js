import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withSetup } from '../helpers/withSetup'

// Replace the mock socket with a hand-controlled fake so tests are deterministic.
let sockets = []
class FakeSocket extends EventTarget {
  constructor(url) {
    super()
    this.url = url
    this.readyState = 0
    this.sent = []
    sockets.push(this)
  }
  send(d) {
    this.sent.push(d)
  }
  close() {
    this.readyState = 3
    this.dispatchEvent(new Event('close'))
  }
  // test helpers
  _open() {
    this.readyState = 1
    this.dispatchEvent(new Event('open'))
  }
  _message(obj) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(obj) }))
  }
  _drop() {
    this.readyState = 3
    this.dispatchEvent(new Event('error'))
    this.dispatchEvent(new Event('close'))
  }
}

vi.mock('@/api/ws', () => ({
  MockWebSocket: class {
    constructor(url) {
      return new FakeSocket(url)
    }
  },
  simulateOutage: () => {},
}))

beforeEach(() => {
  sockets = []
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

async function mountWs(opts) {
  const { useWebSocket } = await import('@/composables/useWebSocket')
  return withSetup(() => useWebSocket('wss://x', { pauseWhenHidden: false, ...opts }))
}

describe('useWebSocket', () => {
  it('connects, buffers messages, and queues sends until open', async () => {
    const [ws, app] = await mountWs()
    const sock = sockets[0]

    ws.send({ a: 1 }) // before open -> queued
    expect(sock.sent).toHaveLength(0)

    sock._open()
    expect(sock.sent).toHaveLength(1) // flushed
    expect(ws.status.value).toBe('open')

    sock._message({ type: 'kpi', value: 3 })
    expect(ws.lastMessage.value).toEqual({ type: 'kpi', value: 3 })
    expect(ws.buffer.value).toHaveLength(1)
    app.unmount()
  })

  it('reconnects with backoff on an abnormal close, then gives up after maxRetries', async () => {
    const [ws, app] = await mountWs({ maxRetries: 2 })
    sockets[0]._open()
    sockets[0]._drop()
    expect(ws.status.value).toBe('reconnecting')

    vi.advanceTimersByTime(60000) // let backoff timer fire -> new socket
    expect(sockets.length).toBe(2)
    sockets[1]._drop()
    vi.advanceTimersByTime(60000)
    expect(sockets.length).toBe(3)
    sockets[2]._drop()
    vi.advanceTimersByTime(60000)

    expect(ws.status.value).toBe('failed')
    expect(ws.retries.value).toBe(2)
    app.unmount()
  })

  it('enforces a bounded buffer (backpressure)', async () => {
    const [ws, app] = await mountWs({ maxBufferSize: 3 })
    sockets[0]._open()
    for (let i = 0; i < 10; i++) sockets[0]._message({ n: i })
    expect(ws.buffer.value).toHaveLength(3)
    expect(ws.buffer.value.at(-1)).toEqual({ n: 9 })
    app.unmount()
  })
})

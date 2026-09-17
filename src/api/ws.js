// A mock WebSocket server. Exposes the SAME interface as the browser's WebSocket
// (addEventListener 'open'|'message'|'close'|'error', send, close, readyState) so
// useWebSocket.js and the capstone talk to it exactly like a real socket.
//
// It emits KPI ticks + shipment events on an interval, and can be told to "drop"
// so you can watch the reconnect/backoff logic work (lesson 25).

const OPEN = 1
const CLOSED = 3

let serverShouldDrop = false
export function simulateOutage(ms = 4000) {
  serverShouldDrop = true
  setTimeout(() => (serverShouldDrop = false), ms)
}

export class MockWebSocket extends EventTarget {
  constructor(url) {
    super()
    this.url = url
    this.readyState = 0
    this._timer = null

    // connect after a short delay
    setTimeout(() => {
      if (serverShouldDrop) {
        this._fail()
        return
      }
      this.readyState = OPEN
      this.dispatchEvent(new Event('open'))
      this._startStream()
    }, 150)
  }

  _startStream() {
    const tick = () => {
      if (this.readyState !== OPEN) return
      if (serverShouldDrop) {
        this._fail()
        return
      }
      this.dispatchEvent(
        new MessageEvent('message', { data: JSON.stringify(makeTick()) }),
      )
      // variable cadence — sometimes bursts, to exercise batching/backpressure
      this._timer = setTimeout(tick, 200 + Math.random() * 900)
    }
    this._timer = setTimeout(tick, 300)
  }

  _fail() {
    clearTimeout(this._timer)
    this.readyState = CLOSED
    this.dispatchEvent(new Event('error'))
    this.dispatchEvent(new CloseEvent('close', { code: 1006, reason: 'connection lost' }))
  }

  send(data) {
    // echo a synthetic ack so send() is observable in the demo
    if (this.readyState === OPEN) {
      setTimeout(
        () => this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'ack', echo: data }) })),
        50,
      )
    }
  }

  close() {
    clearTimeout(this._timer)
    this.readyState = CLOSED
    this.dispatchEvent(new CloseEvent('close', { code: 1000, reason: 'client closed' }))
  }
}

const CARRIERS = ['Maersk', 'DHL', 'DB Schenker', 'DSV', 'Expeditors']
function makeTick() {
  const r = Math.random()
  if (r < 0.4) {
    return {
      type: 'kpi',
      metric: 'on_time_pct',
      value: +(90 + Math.random() * 8).toFixed(2),
      at: Date.now(),
    }
  }
  return {
    type: 'shipment_event',
    id: `SHP-${100000 + Math.floor(Math.random() * 50000)}`,
    carrier: CARRIERS[Math.floor(Math.random() * CARRIERS.length)],
    event: ['departed', 'arrived', 'customs cleared', 'exception', 'delivered'][
      Math.floor(Math.random() * 5)
    ],
    at: Date.now(),
  }
}

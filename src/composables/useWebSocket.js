// Production-grade WebSocket composable. The things interviewers probe for:
//   - automatic reconnect with EXPONENTIAL BACKOFF + jitter + a cap
//   - stop reconnecting after N attempts (and expose status so UI can show it)
//   - pause the stream when the tab is hidden (Page Visibility) to save work
//   - a bounded message buffer so a burst can't blow up memory (backpressure)
//   - clean teardown on unmount (no zombie sockets, no reconnect after unmount)
//   - send() queues messages until the socket is open
import { ref, shallowRef, onScopeDispose, readonly } from 'vue'
import { MockWebSocket } from '@/api/ws'

// swap for `window.WebSocket` against a real server
const SocketImpl = MockWebSocket

export function useWebSocket(url, options = {}) {
  const {
    maxRetries = 6,
    maxBufferSize = 500,
    pauseWhenHidden = true,
    onMessage,
  } = options

  const status = ref('closed') // 'connecting' | 'open' | 'closed' | 'reconnecting' | 'failed'
  const lastMessage = shallowRef(null)
  const buffer = shallowRef([])
  const retries = ref(0)

  let ws = null
  let reconnectTimer = null
  let manualClose = false
  const sendQueue = []

  function connect() {
    manualClose = false
    status.value = retries.value === 0 ? 'connecting' : 'reconnecting'
    ws = new SocketImpl(url)

    ws.addEventListener('open', () => {
      status.value = 'open'
      retries.value = 0
      while (sendQueue.length) ws.send(sendQueue.shift())
    })

    ws.addEventListener('message', (e) => {
      let payload
      try {
        payload = JSON.parse(e.data)
      } catch {
        payload = e.data
      }
      lastMessage.value = payload
      // bounded buffer — drop oldest on overflow
      const next = buffer.value.length >= maxBufferSize ? buffer.value.slice(1) : buffer.value.slice()
      next.push(payload)
      buffer.value = next
      onMessage?.(payload)
    })

    ws.addEventListener('close', () => {
      if (manualClose) {
        status.value = 'closed'
        return
      }
      scheduleReconnect()
    })
    ws.addEventListener('error', () => {
      /* 'close' handles reconnect */
    })
  }

  function scheduleReconnect() {
    if (retries.value >= maxRetries) {
      status.value = 'failed'
      return
    }
    status.value = 'reconnecting'
    retries.value++
    const delay = Math.min(30000, (2 ** retries.value) * 250 + Math.random() * 250)
    reconnectTimer = setTimeout(connect, delay)
  }

  function send(data) {
    const msg = typeof data === 'string' ? data : JSON.stringify(data)
    if (ws && ws.readyState === 1) ws.send(msg)
    else sendQueue.push(msg)
  }

  function close() {
    manualClose = true
    clearTimeout(reconnectTimer)
    ws?.close()
  }

  function open() {
    retries.value = 0
    close()
    manualClose = false
    connect()
  }

  // Page Visibility: disconnect when hidden, reconnect when visible.
  function onVisibility() {
    if (!pauseWhenHidden) return
    if (document.hidden) {
      manualClose = true
      clearTimeout(reconnectTimer)
      ws?.close()
    } else if (status.value === 'closed') {
      open()
    }
  }
  if (pauseWhenHidden && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility)
  }

  connect()

  onScopeDispose(() => {
    close()
    document.removeEventListener?.('visibilitychange', onVisibility)
  })

  return {
    status: readonly(status),
    lastMessage,
    buffer,
    retries: readonly(retries),
    send,
    open,
    close,
    clear: () => (buffer.value = []),
  }
}

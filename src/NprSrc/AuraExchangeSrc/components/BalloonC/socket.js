import { io } from 'socket.io-client'
import { getBackendUrl } from './api'

function makeRequestId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch {
    // Fallback below
  }
  return `balloon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

class BalloonGameSocket {
  constructor() {
    this.socket = null
    this.listeners = new Map()
    this.isConnected = false
    this.currentToken = null
  }

  connect(sessionToken = 'demo_session') {
    const token = sessionToken || 'demo_session'
    const backendUrl = getBackendUrl()
    const namespaceUrl = `${backendUrl}/balloon`

    if (this.socket && this.currentToken === token && this.socket.connected) {
      this.isConnected = true
      this.emitLocal('connection_status', { connected: true })
      return this.socket
    }

    this.disconnect()
    this.currentToken = token

    this.socket = io(namespaceUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.emitLocal('connection_status', { connected: true })
    })

    this.socket.on('connect_error', (err) => {
      this.isConnected = false
      this.emitLocal('connection_status', { connected: false, error: err?.message })
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      this.emitLocal('connection_status', { connected: false, reason })
    })

    const forwardedEvents = [
      'game:snapshot',
      'round:waiting',
      'round:countdown',
      'round:started',
      'round:tick',
      'round:crashed',
      'bet:accepted',
      'bet:updated',
      'bet:rejected',
      'wallet:updated',
      'wallet:statement',
      'bets:all',
      'bets:new',
      'bets:settled',
      'bets:cancelled',
      'bets:clear',
    ]

    forwardedEvents.forEach((eventName) => {
      this.socket.on(eventName, (payload) => {
        this.emitLocal(eventName, payload)
      })
    })

    return this.socket
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    if (event === 'connection_status') {
      callback({ connected: this.isConnected })
    }
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data)
        } catch (e) {
          console.error(`[Balloon WS] Listener error for ${event}:`, e)
        }
      })
    }
  }

  emitWithAck(event, payload, timeoutMs = 7000) {
    if (!this.socket || !this.isConnected) {
      return Promise.reject(new Error('Balloon server is not connected. Please retry.'))
    }

    return new Promise((resolve, reject) => {
      let settled = false
      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        reject(new Error(`Balloon request timed out (${event}).`))
      }, timeoutMs)

      this.socket.emit(event, payload, (response) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        resolve(response)
      })
    })
  }

  placeBet({ amount, slot = 1, autoCashout = null } = {}) {
    return this.emitWithAck('bet:place', {
      amount: Number(amount),
      slot: Number(slot),
      autoCashout: autoCashout ? Number.parseFloat(autoCashout) : null,
      requestId: makeRequestId(),
    })
  }

  cashOut(betId) {
    return this.emitWithAck('bet:cashout', { betId })
  }

  cancelBet(betId) {
    return this.emitWithAck('bet:cancel', { betId })
  }

  sendHeat() {
    if (this.socket && this.isConnected) {
      this.socket.emit('balloon:heat', {})
    }
  }

  requestResync() {
    if (this.socket && this.isConnected) {
      this.socket.emit('game:resync')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.currentToken = null
  }
}

export const gameSocket = new BalloonGameSocket()

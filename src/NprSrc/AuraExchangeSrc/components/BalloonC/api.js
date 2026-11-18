import {
  getBackendUrl,
  getAsianExchangeApiBaseUrl,
} from '../../services/apiService'

export { getBackendUrl, getAsianExchangeApiBaseUrl }

const trimSlash = (value) => String(value || '').trim().replace(/\/+$/, '')

function parseTokenFromLaunchUrl(launchUrl) {
  if (!launchUrl) return null
  try {
    const parsed = new URL(
      launchUrl,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    )
    const hash = parsed.hash.replace(/^#/, '')
    const hashParams = new URLSearchParams(hash)
    return hashParams.get('token') || parsed.searchParams.get('token')
  } catch {
    const match = String(launchUrl).match(/[?#&]token=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }
}

function readTokenValue(value) {
  if (!value) return null
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return null
    if (text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text)
        return readTokenValue(
          parsed.accessToken ||
            parsed.access_token ||
            parsed.token ||
            parsed.jwt ||
            parsed.authToken ||
            parsed.user?.accessToken ||
            parsed.user?.token ||
            parsed.auth?.accessToken ||
            parsed.auth?.token ||
            parsed.data?.accessToken ||
            parsed.data?.token
        )
      } catch {
        return text
      }
    }
    return text.replace(/^Bearer\s+/i, '')
  }
  if (typeof value === 'object') {
    return readTokenValue(
      value.accessToken ||
        value.access_token ||
        value.token ||
        value.jwt ||
        value.authToken ||
        value.user?.accessToken ||
        value.user?.token ||
        value.auth?.accessToken ||
        value.auth?.token ||
        value.data?.accessToken ||
        value.data?.token
    )
  }
  return null
}

function getStoredAsianExchangeToken(explicitToken = null) {
  const direct = readTokenValue(explicitToken)
  if (direct) return direct
  if (typeof window === 'undefined') return null

  const keys = [
    'token',
    'accessToken',
    'access_token',
    'authToken',
    'jwt',
    'userToken',
    'jwtToken',
    'asianexchange_token',
    'user',
    'auth',
  ]

  for (const key of keys) {
    try {
      const token = readTokenValue(window.localStorage.getItem(key))
      if (token) return token
    } catch {
      // Ignore storage access failures in private/restricted browsers.
    }
  }
  return null
}

function getLaunchTokenFromUrl() {
  if (typeof window === 'undefined') return null
  const queryParams = new URLSearchParams(window.location.search)
  const queryToken = queryParams.get('token')
  if (queryToken) return queryToken
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return hashParams.get('token')
}

async function requestBalloonLaunchToken(bearerToken) {
  const apiBase = getAsianExchangeApiBaseUrl()
  if (!apiBase) {
    throw new Error('AsianExchange API URL is not configured.')
  }
  const response = await fetch(`${apiBase}/api/v1/vimaan/launch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      x_panel_type: 'user',
    },
    credentials: 'include',
    body: JSON.stringify({ gameId: 'balloon' }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error || `Balloon launch failed (${response.status})`
    )
  }
  const data = result.data || {}
  const launchToken = data.launchToken || parseTokenFromLaunchUrl(data.launchUrl)
  if (!launchToken) {
    throw new Error('Launch response did not contain a session token.')
  }
  return launchToken
}

let activeSessionToken = null

export function setActiveBalloonSessionToken(token) {
  activeSessionToken = token || null
}

export function getActiveBalloonSessionToken() {
  return activeSessionToken
}

function makeDemoSession() {
  activeSessionToken = 'demo_session'
  return {
    sessionToken: 'demo_session',
    sessionId: 'demo_session',
    playerId: 'Demo',
    isDemo: true,
    wallet: { displayBalance: 2000, rawBalance: 200000, currency: 'INR' },
    player: { id: 'Demo', username: 'Democlient', avatar: '1', isDemo: true },
  }
}

/**
 * Initialize a Balloon session via the Vimaan backend service.
 * Logged-out or demo viewers fall back to `demo_session` spectator mode.
 */
export async function initBalloonSession({ isLoggedIn = false, isDemoUser = false, authToken = null } = {}) {
  const backendUrl = getBackendUrl()
  const urlLaunchToken = getLaunchTokenFromUrl()

  if (!urlLaunchToken && (!isLoggedIn || isDemoUser)) {
    return makeDemoSession()
  }

  try {
    const bearerToken = getStoredAsianExchangeToken(authToken)
    if (!urlLaunchToken && !bearerToken) {
      return makeDemoSession()
    }

    const launchToken = urlLaunchToken || (await requestBalloonLaunchToken(bearerToken))
    if (String(launchToken).startsWith('demo_')) {
      return makeDemoSession()
    }

    const response = await fetch(`${backendUrl}/api/v1/integration/session/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
      body: JSON.stringify({ token: launchToken }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.success || !result?.data?.sessionToken) {
      throw new Error(
        result?.message || result?.error || `Session exchange failed (${response.status})`
      )
    }

    activeSessionToken = result.data.sessionToken

    if (typeof window !== 'undefined' && urlLaunchToken) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const backendFromLaunch = hashParams.get('backend') || hashParams.get('server')
      if (backendFromLaunch) {
        window.__VIMAAN_BACKEND_URL__ = trimSlash(backendFromLaunch)
      }
      const cleanUrl = `${window.location.pathname}${window.location.search}`
      window.history.replaceState(null, document.title, cleanUrl)
    }

    return result.data
  } catch (err) {
    console.warn('[Balloon API] Session init fallback:', err?.message || err)
    if (isDemoUser || !isLoggedIn) {
      return makeDemoSession()
    }
    return null
  }
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (activeSessionToken) {
    headers.Authorization = `Bearer ${activeSessionToken}`
  }
  return headers
}

export async function fetchGameStatus(token = activeSessionToken) {
  try {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/api/v1/balloon/game/snapshot`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!res.ok) throw new Error('Snapshot fetch failed')
    const json = await res.json()
    return json?.data || json
  } catch (err) {
    console.warn('[Balloon API] Could not fetch snapshot:', err.message)
    return null
  }
}

export async function fetchHistory() {
  try {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/api/v1/balloon/game/history`)
    if (!res.ok) throw new Error('History fetch failed')
    const json = await res.json()
    return json?.data || []
  } catch (err) {
    console.warn('[Balloon API] Could not fetch history:', err.message)
    return null
  }
}

export async function placeBetApi({ amount = 100, autoCashoutMult = null, slot = 1, requestId = null }) {
  try {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/api/v1/balloon/bets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        amount: Number(amount),
        slot: Number(slot),
        ...(autoCashoutMult ? { autoCashout: Number(autoCashoutMult) } : {}),
        ...(requestId ? { requestId } : {}),
      }),
    })
    return await res.json()
  } catch (err) {
    console.warn('[Balloon API] Place bet error:', err.message)
    return { success: false, message: err.message }
  }
}

export async function cashoutApi(betId) {
  try {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/api/v1/balloon/bets/${encodeURIComponent(betId)}/cashout`, {
      method: 'POST',
      headers: authHeaders(),
    })
    return await res.json()
  } catch (err) {
    console.warn('[Balloon API] Cashout error:', err.message)
    return { success: false, message: err.message }
  }
}

export async function cancelBetApi(betId) {
  try {
    const backendUrl = getBackendUrl()
    const res = await fetch(`${backendUrl}/api/v1/balloon/bets/${encodeURIComponent(betId)}/cancel`, {
      method: 'POST',
      headers: authHeaders(),
    })
    return await res.json()
  } catch (err) {
    console.warn('[Balloon API] Cancel bet error:', err.message)
    return { success: false, message: err.message }
  }
}

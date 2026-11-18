import { io } from 'socket.io-client';

const trimSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

/**
 * Vimaan's own HTTP/WebSocket origin. Set VITE_BACKEND_URL to the public
 * HTTPS URL/reverse-proxy origin for the separately-running Vimaan service.
 * In local development it defaults to localhost:6100 (Vimaan's default port).
 */
export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryBackend = params.get('backend') || params.get('server');
    if (queryBackend) return trimSlash(queryBackend);

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hashBackend = hashParams.get('backend') || hashParams.get('server');
    if (hashBackend) return trimSlash(hashBackend);

    if (window.__VIMAAN_BACKEND_URL__) return trimSlash(window.__VIMAAN_BACKEND_URL__);
  }

  const configured = import.meta.env?.VITE_BACKEND_URL;
  if (configured) return trimSlash(configured);
  if (import.meta.env?.DEV) return 'http://localhost:6100';
  if (typeof window !== 'undefined') return trimSlash(window.location.origin);
  return '';
}

/**
 * AsianExchange's authenticated API origin. This is NOT VIMAAN_BACKEND_URL.
 * VITE_API_BASE_URL should normally be the API origin without a path, for
 * example https://api.example.com. Same-origin reverse proxies also work.
 */
export function getAsianExchangeApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__ASIANEXCHANGE_API_URL__) {
    return trimSlash(window.__ASIANEXCHANGE_API_URL__).replace(/\/api$/i, '');
  }

  const configured =
    import.meta.env?.VITE_ASIANEXCHANGE_API_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_BASE_URL;

  if (configured) return trimSlash(configured).replace(/\/api$/i, '');
  if (typeof window !== 'undefined') return trimSlash(window.location.origin);
  return '';
}

function parseTokenFromLaunchUrl(launchUrl) {
  if (!launchUrl) return null;
  try {
    const parsed = new URL(launchUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const hash = parsed.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);
    return hashParams.get('token') || parsed.searchParams.get('token');
  } catch {
    const match = String(launchUrl).match(/[?#&]token=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

function readTokenValue(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return null;
    // Some apps save a JSON auth object in a localStorage key.
    if (text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        return readTokenValue(
          parsed.accessToken || parsed.access_token || parsed.token || parsed.jwt || parsed.authToken ||
          parsed.user?.accessToken || parsed.user?.token || parsed.auth?.accessToken || parsed.auth?.token ||
          parsed.data?.accessToken || parsed.data?.token,
        );
      } catch {
        return text;
      }
    }
    return text.replace(/^Bearer\s+/i, '');
  }
  if (typeof value === 'object') {
    return readTokenValue(
      value.accessToken || value.access_token || value.token || value.jwt || value.authToken ||
      value.user?.accessToken || value.user?.token || value.auth?.accessToken || value.auth?.token ||
      value.data?.accessToken || value.data?.token,
    );
  }
  return null;
}

function getStoredAsianExchangeToken(explicitToken = null) {
  const direct = readTokenValue(explicitToken);
  if (direct) return direct;
  if (typeof window === 'undefined') return null;

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
  ];

  for (const key of keys) {
    try {
      const token = readTokenValue(window.localStorage.getItem(key));
      if (token) return token;
    } catch {
      // Local storage can be blocked in privacy/incognito contexts.
    }
  }
  return null;
}

function makeRequestId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // Fall through to a non-cryptographic correlation ID; it is not an auth secret.
  }
  return `vimaan-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

class ApiService {
  constructor() {
    this.socket = null;
    this.session = null;
    this.isConnected = false;
    this.backendUrl = getBackendUrl();
    this.lastError = null;
  }

  getBackendUrl() {
    this.backendUrl = getBackendUrl();
    return this.backendUrl;
  }

  getLaunchTokenFromUrl() {
    if (typeof window === 'undefined') return null;

    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get('token');
    if (queryToken) return queryToken;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return hashParams.get('token');
  }

  hasLaunchTokenInUrl() {
    return Boolean(this.getLaunchTokenFromUrl());
  }

  /**
   * Obtain an authenticated, single-use launch token through AsianExchange's
   * POST /api/vimaan/launch proxy. Never sign the partner HMAC in the browser;
   * VIMAAN_TENANT_SECRET must remain server-side in AsianExchange's .env.
   */
  async requestLaunchToken(authToken = null) {
    const apiBase = getAsianExchangeApiBaseUrl();
    const token = getStoredAsianExchangeToken(authToken);
    const isDemo = token === 'demo_token' || (authToken && String(authToken).includes('demo'));

    if (!apiBase) {
      if (isDemo) return `demo_launch_${Date.now()}`;
      throw new Error('AsianExchange API URL is not configured. Set VITE_API_BASE_URL.');
    }
    if (!token) {
      if (isDemo) return `demo_launch_${Date.now()}`;
      throw new Error(
        'AsianExchange login token was not found. Ensure the logged-in JWT is passed to GameProvider or stored in the app auth storage.',
      );
    }

    try {
      const response = await fetch(`${apiBase}/api/v1/vimaan/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          x_panel_type: 'user',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success) {
        if (isDemo) return `demo_launch_${Date.now()}`;
        throw new Error(
          result?.message || result?.error || `AsianExchange Vimaan launch failed (${response.status})`,
        );
      }

      const data = result.data || {};
      const launchToken = data.launchToken || parseTokenFromLaunchUrl(data.launchUrl);
      if (!launchToken) {
        if (isDemo) return `demo_launch_${Date.now()}`;
        throw new Error('AsianExchange launch response did not contain a Vimaan token.');
      }
      return launchToken;
    } catch (err) {
      if (isDemo) return `demo_launch_${Date.now()}`;
      throw err;
    }
  }

  /**
   * Initialize a session from either a one-time launch token in the URL or the
   * authenticated AsianExchange launch proxy. customPlayerId/credits are kept
   * for call-site compatibility; production wallet identity/balance are taken
   * from the verified AsianExchange JWT and MongoDB, never from browser values.
   */

async initSession(_customPlayerId = null, _customInitialCredits = null, authToken = "") {

  
  this.lastError = null;
  this.backendUrl = getBackendUrl();

  try {
    if (!this.backendUrl) {
      throw new Error(
        'Vimaan backend URL is not configured. Set VITE_BACKEND_URL.'
      );
    }

    // Get AsianExchange JWT from the argument or your existing auth storage.
    let bearerToken = authToken

  

    // Remove "Bearer " prefix if already present.
    if (bearerToken) {
      bearerToken = bearerToken.replace(/^Bearer\s+/i, '').trim();
    }

    if (!bearerToken) {
      throw new Error('AsianExchange authentication token is missing.');
    }

    // Get one-time Vimaan launch token, or request one using the AsianExchange JWT.
    let launchToken = this.getLaunchTokenFromUrl();

    if (!launchToken) {
      launchToken = await this.requestLaunchToken(bearerToken);
    }

    const isDemo =
      _customPlayerId === 'Demo' ||
      bearerToken === 'demo_token' ||
      (launchToken && String(launchToken).startsWith('demo_'));

    let response;
    let result;
    try {
      response = await fetch(
        `${this.backendUrl}/api/v1/integration/session/exchange`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ token: launchToken }),
        }
      );
      result = await response.json().catch(() => ({}));
    } catch (fetchErr) {
      if (isDemo) {
        this.session = {
          sessionToken: 'demo_session',
          sessionId: 'demo_session',
          playerId: 'Demo',
          isDemo: true,
          wallet: { displayBalance: 2000, rawBalance: 200000, currency: 'INR' },
          player: { id: 'Demo', username: 'Democlient', avatar: '1', isDemo: true },
        };
        return this.session;
      }
      throw fetchErr;
    }

    if (
      !response?.ok ||
      !result?.success ||
      !result?.data?.sessionToken
    ) {
      if (isDemo) {
        this.session = {
          sessionToken: 'demo_session',
          sessionId: 'demo_session',
          playerId: 'Demo',
          isDemo: true,
          wallet: { displayBalance: 2000, rawBalance: 200000, currency: 'INR' },
          player: { id: 'Demo', username: 'Democlient', avatar: '1', isDemo: true },
        };
        return this.session;
      }
      throw new Error(
        result?.message ||
          result?.error ||
          `Vimaan session exchange failed (${response?.status || 'network error'})`
      );
    }

    this.session = result.data;

    // Remove one-time launch token from the address bar after exchange.
    if (
      typeof window !== 'undefined' &&
      this.getLaunchTokenFromUrl()
    ) {
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, '')
      );

      const backendFromLaunch =
        hashParams.get('backend') ||
        hashParams.get('server');

      if (backendFromLaunch) {
        window.__VIMAAN_BACKEND_URL__ = trimSlash(backendFromLaunch);
      }

      const cleanUrl =
        `${window.location.pathname}${window.location.search}`;

      window.history.replaceState(null, document.title, cleanUrl);
    }

    return this.session;
  } catch (error) {
    this.lastError =
      error?.message || 'Unable to initialize Vimaan session.';

    console.error(
      'Vimaan session initialization failed:',
      this.lastError
    );

    return null;
  }
}

  getLastError() {
    return this.lastError;
  }

  connectSocket(onEvents = {}) {
    if (!this.session?.sessionToken) {
      this.lastError = 'Vimaan session is missing. Launch the game from the authenticated AsianExchange page.';
      onEvents.onConnectError?.(new Error(this.lastError));
      return null;
    }

    this.disconnectSocket();
    this.backendUrl = getBackendUrl();

    this.socket = io(this.backendUrl, {
      auth: { token: this.session.sessionToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      onEvents.onConnect?.();
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      onEvents.onConnectError?.(error);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      onEvents.onDisconnect?.(reason);
    });

    const bind = (event, handler) => {
      if (typeof handler === 'function') this.socket.on(event, handler);
    };

    bind('round:countdown', onEvents.onCountdown);
    bind('round:started', onEvents.onStarted);
    bind('round:tick', onEvents.onTick);
    bind('round:crashed', onEvents.onCrashed);
    bind('bet:accepted', onEvents.onBetAccepted);
    bind('bet:updated', onEvents.onBetUpdated);
    bind('bet:rejected', onEvents.onBetRejected);
    bind('wallet:updated', onEvents.onWalletUpdated);
    bind('game:snapshot', onEvents.onSnapshot);
    bind('bets:new', onEvents.onBetsNew);
    bind('bets:settled', onEvents.onBetsSettled);
    bind('bets:clear', onEvents.onBetsClear);
    bind('bets:all', onEvents.onBetsAll);

    // The backend emits both wallet:statement and bet:statement for the same
    // operation. Listen to just one event to prevent a duplicate balance delta.
    bind('wallet:statement', onEvents.onStatement);

    return this.socket;
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  emitWithAck(event, payload, timeoutMs = 7000) {
    if (!this.socket || !this.isConnected) {
      return Promise.reject(new Error('Vimaan server is not connected. Please retry.'));
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error(`Vimaan request timed out (${event}).`));
      }, timeoutMs);

      this.socket.emit(event, payload, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  placeBet(amount, slot, autoCashout = null) {
    return this.emitWithAck('bet:place', {
      amount: Number(amount),
      slot: Number(slot),
      autoCashout: autoCashout ? Number.parseFloat(autoCashout) : null,
      requestId: makeRequestId(),
    });
  }

  cashOut(betId) {
    return this.emitWithAck('bet:cashout', { betId });
  }

  cancelBet(betId) {
    return this.emitWithAck('bet:cancel', { betId });
  }

  requestResync() {
    if (this.socket && this.isConnected) this.socket.emit('game:resync');
  }
}

export const apiService = new ApiService();

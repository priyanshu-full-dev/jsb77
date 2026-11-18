// Audio Service utilizing official Aviator MP3 audio tracks
class AudioService {
  constructor() {
    this.isMuted = true;
    this.hasUserInteracted = false;

    // Audio elements
    this.bgMusic = null;
    this.startPlaneAudio = null;
    this.flyPlaneAudio = null; // Used for Crash / Flew Away sound
    this.cashoutAudio = null;
    this.buttonPressedAudio = null;

    this.initAudioElements();
  }

  initAudioElements() {
    try {
      // Background Music (Looping ambient track)
      this.bgMusic = new Audio('/sounds/bg_music.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.22;

      // Start Plane (Takeoff sound)
      this.startPlaneAudio = new Audio('/sounds/start_plane.mp3');
      this.startPlaneAudio.volume = 0.65;

      // Fly Plane (Used when plane crashes / flies away)
      this.flyPlaneAudio = new Audio('/sounds/flyPlane.mp3');
      this.flyPlaneAudio.volume = 0.70;

      // Cashout sound
      this.cashoutAudio = new Audio('/sounds/cashout.mp3');
      this.cashoutAudio.volume = 0.75;

      // Button click sound
      this.buttonPressedAudio = new Audio('/sounds/button-pressed.mp3');
      this.buttonPressedAudio.volume = 0.45;
    } catch (e) {
      console.warn('Audio elements initialization error:', e);
    }
  }

  handleUserGesture() {
    if (this.hasUserInteracted) return;
    this.hasUserInteracted = true;

    if (!this.isMuted && this.bgMusic) {
      this.bgMusic.play().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);

    if (this.isMuted) {
      if (this.bgMusic) this.bgMusic.pause();
      if (this.flyPlaneAudio) this.flyPlaneAudio.pause();
      if (this.startPlaneAudio) this.startPlaneAudio.pause();
      if (this.cashoutAudio) this.cashoutAudio.pause();
      if (this.buttonPressedAudio) this.buttonPressedAudio.pause();
    } else {
      if (this.bgMusic && this.hasUserInteracted) {
        this.bgMusic.play().catch(() => {});
      }
    }
  }

  toggleMute() {
    this.handleUserGesture();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Stop ALL sounds immediately when leaving Vimaan route
  stopAll() {
    try {
      if (this.bgMusic) {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
      }
      if (this.startPlaneAudio) {
        this.startPlaneAudio.pause();
        this.startPlaneAudio.currentTime = 0;
      }
      if (this.flyPlaneAudio) {
        this.flyPlaneAudio.pause();
        this.flyPlaneAudio.currentTime = 0;
      }
      if (this.cashoutAudio) {
        this.cashoutAudio.pause();
        this.cashoutAudio.currentTime = 0;
      }
      if (this.buttonPressedAudio) {
        this.buttonPressedAudio.pause();
        this.buttonPressedAudio.currentTime = 0;
      }
      this.hasUserInteracted = false;
    } catch (e) {
      console.warn("stopAll error:", e);
    }
  }

  // 1. Takeoff sound (When plane starts flying)
  playTakeoff() {
    this.handleUserGesture();
    if (this.isMuted) return;

    try {
      // Stop any previous crash flyPlane sound
      if (this.flyPlaneAudio) {
        this.flyPlaneAudio.pause();
        this.flyPlaneAudio.currentTime = 0;
      }
      if (this.startPlaneAudio) {
        this.startPlaneAudio.currentTime = 0;
        this.startPlaneAudio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Takeoff sound error:', e);
    }
  }

  // Multiplier update (safe no-op or pitch adjuster)
  updateFlightMultiplier(multiplier) {
    // Kept safe for frame loop
  }

  // 2. Crash sound: Play flyPlane.mp3 when plane crashes / flies away!
  playCrashFlyAway() {
    this.handleUserGesture();
    if (this.isMuted) return;

    try {
      if (this.startPlaneAudio) {
        this.startPlaneAudio.pause();
        this.startPlaneAudio.currentTime = 0;
      }
      if (this.flyPlaneAudio) {
        this.flyPlaneAudio.currentTime = 0;
        this.flyPlaneAudio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Crash flyPlane sound error:', e);
    }
  }

  // Stop crash flight sound
  stopFlight() {
    try {
      if (this.flyPlaneAudio) {
        this.flyPlaneAudio.pause();
        this.flyPlaneAudio.currentTime = 0;
      }
      if (this.startPlaneAudio) {
        this.startPlaneAudio.pause();
        this.startPlaneAudio.currentTime = 0;
      }
    } catch {}
  }

  // 3. Cashout sound (debounced so it only plays once per cashout)
  playCashout() {
    this.handleUserGesture();
    if (this.isMuted) return;

    const now = Date.now();
    if (this.lastCashoutTime && now - this.lastCashoutTime < 800) {
      return;
    }
    this.lastCashoutTime = now;

    try {
      const snd = this.cashoutAudio ? this.cashoutAudio.cloneNode() : new Audio('/sounds/cashout.mp3');
      snd.volume = 0.75;
      snd.play().catch(() => {});
    } catch (e) {
      console.warn('Cashout audio error:', e);
    }
  }

  // 4. Button click sound
  playClick() {
    this.handleUserGesture();
    if (this.isMuted) return;

    try {
      if (this.buttonPressedAudio) {
        this.buttonPressedAudio.currentTime = 0;
        this.buttonPressedAudio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Click audio error:', e);
    }
  }

  playTick() {
    this.playClick();
  }
}

export const audioService = new AudioService();

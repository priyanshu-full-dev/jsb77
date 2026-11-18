import React from 'react'
import { LOCATION_BACKGROUNDS } from './gameConfig'

export default function GameStage({
  locationBgRefs,
  currentLocationIdx,
  darkeningRef,
  starsRef,
  cloudsRef,
  airplaneRef,
  multiplierDisplayRef,
  gameState,
  flameBoost,
  countdown,
  multiplier,
  getCountdownColor,
  circumference,
  strokeOffset,
}) {
  return (
    <>
      {/* Location Background Scenery Layers with seamless infinite sky extension */}
      {LOCATION_BACKGROUNDS.map((bgSrc, index) => (
        <div
          key={bgSrc}
          ref={(el) => {
            if (locationBgRefs.current) {
              locationBgRefs.current[index] = el
            }
          }}
          className={`location-bg-track ${
            index === currentLocationIdx ? 'active' : ''
          }`}
        >
          <div className="location-sky-ext" />
          <img
            src={bgSrc}
            alt="Location Scenery"
            className="location-bg-img"
          />
        </div>
      ))}

      {/* ================= Stage 3: Sky Darkening Overlay ================= */}
      <div
        ref={darkeningRef}
        className="stage3-darkening-overlay"
        style={{ opacity: 0 }}
      />

      {/* ================= Stage 3: Stars Layer (Infinite seamless scroll, never ends) ================= */}
      <div
        ref={starsRef}
        className="stage3-stars-layer"
        style={{ opacity: 0 }}
      />

      {/* ================= Stage 2: Authentic Animated Clouds (Shows Only One Time) ================= */}
      <div
        ref={cloudsRef}
        className="stage2-clouds-track"
        style={{ opacity: 0.85 }}
      >
        <div className="clouds-single-cluster">
          <img
            src="/images/clouds.png"
            alt="Peach Clouds"
            className="stage2-clouds-image"
          />
        </div>
      </div>

      {/* ================= Authentic Red Propeller Airplane Fly-by ================= */}
      <div
        ref={airplaneRef}
        className="red-airplane-flyby"
        style={{ display: 'none' }}
      >
        <div className="airplane-vapor-trail">
          <img
            src="/images/wind-streak.png"
            alt="Vapor trail"
            className="airplane-trail-image"
          />
        </div>
        <img
          src="/images/airplane.png"
          alt="Airplane"
          className="airplane-sprite-img"
        />
      </div>

      {/* ================= Hot Air Balloon / Fly-away ================= */}
      <div
        className={`balloon-wrapper ${
          gameState === 'FLYING_AWAY'
            ? 'fly-away-top'
            : gameState === 'WAITING'
            ? 'waiting'
            : ''
        }`}
      >
        <img
          src="/images/airballoon-red.png"
          alt="Hot Air Balloon"
          className="balloon-image"
        />

        {/* Burner flame on top of basket nozzle */}
        <div
          className={`burner-flame-container ${
            flameBoost || gameState === 'FLYING' || gameState === 'FLYING_AWAY'
              ? 'boost'
              : ''
          }`}
        >
          <div className="flame-glow"></div>
          <div className="flame-core"></div>
        </div>

        {/* Waiting Phase: Countdown Overlay */}
        {gameState === 'WAITING' && (
          <div className="waiting-round-overlay">
            <div className="waiting-title with-timer">
              Waiting For Next Round
            </div>
            {countdown !== null && (
              <div className="countdown-ring-container">
                <svg className="countdown-svg" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="27"
                    className="countdown-track"
                    style={{
                      stroke: getCountdownColor(countdown),
                      strokeOpacity: 0.25,
                    }}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="27"
                    className="countdown-indicator"
                    style={{
                      stroke: getCountdownColor(countdown),
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeOffset,
                      strokeOpacity: 0.95,
                    }}
                  />
                </svg>
                <span className="countdown-number">{countdown}</span>
              </div>
            )}
          </div>
        )}

        {/* Active Flight: Multiplier inside the balloon */}
        {gameState === 'FLYING' && (
          <div
            ref={multiplierDisplayRef}
            className="balloon-multiplier"
            id="balloon-multiplier-display"
          >
            {multiplier.toFixed(2)}x
          </div>
        )}
      </div>

      {/* Bold Black Crash Multiplier in center of sky when balloon flies off */}
      {gameState === 'FLYING_AWAY' && (
        <div className="flyaway-center-multiplier">
          {multiplier.toFixed(2)}x
        </div>
      )}
    </>
  )
}


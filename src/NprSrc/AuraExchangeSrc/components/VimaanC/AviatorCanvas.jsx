import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../context/GameContext";
import { Volume2, VolumeX, X } from "lucide-react";

export default function AviatorCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    gameState,
    multiplier,
    waitingCountdown,
    flightStartTime,
    isMuted,
    toggleSound,
    cashoutAlert,
    setCashoutAlert,
    stakeError,
    setStakeError,
  } = useGame();

  const gameStateRef = useRef(gameState);
  const multiplierRef = useRef(multiplier);
  const flightStartTimeRef = useRef(flightStartTime);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);
  useEffect(() => {
    flightStartTimeRef.current = flightStartTime;
  }, [flightStartTime]);

  // Automatically fade out and dismiss cashout banner after 4.5 seconds
  useEffect(() => {
    if (!cashoutAlert) return;
    const timer = setTimeout(() => {
      setCashoutAlert(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [cashoutAlert, setCashoutAlert]);

  // Automatically fade out and dismiss stake error toast after 3.8 seconds
  useEffect(() => {
    if (!stakeError) return;
    const timer = setTimeout(() => {
      setStakeError(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [stakeError, setStakeError]);

  const progressBarRef = useRef(null);
  const countdownSyncRef = useRef({
    targetEndTime: 0,
    totalDuration: 7000,
  });

  // Keep targetEndTime continuously synchronized with authoritative socket countdown
  useEffect(() => {
    if (gameState === "WAITING" && waitingCountdown > 0) {
      const now = performance.now();
      countdownSyncRef.current.targetEndTime = now + waitingCountdown * 1000;
      if (!countdownSyncRef.current.totalDuration || waitingCountdown > 6.0) {
        countdownSyncRef.current.totalDuration = Math.max(
          7000,
          waitingCountdown * 1000,
        );
      }
    }
  }, [gameState, waitingCountdown]);

  // Butter-smooth 60/120 FPS continuous linear progress animation without stepping/breaks
  useEffect(() => {
    if (gameState !== "WAITING") {
      if (progressBarRef.current) {
        progressBarRef.current.style.width = "0%";
      }
      return;
    }

    let rAfId;
    const updateProgress = () => {
      if (
        progressBarRef.current &&
        countdownSyncRef.current.targetEndTime > 0
      ) {
        const now = performance.now();
        const remaining = Math.max(
          0,
          countdownSyncRef.current.targetEndTime - now,
        );
        const total = countdownSyncRef.current.totalDuration || 7000;
        const fraction = Math.max(0, Math.min(1, remaining / total));
        progressBarRef.current.style.width = `${(fraction * 100).toFixed(2)}%`;
      } else if (progressBarRef.current) {
        progressBarRef.current.style.width = "0%";
      }
      rAfId = requestAnimationFrame(updateProgress);
    };

    rAfId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rAfId);
  }, [gameState]);

  const animRef = useRef({
    time: 0,
    sunburstAngle: 0,
    flewAwayProgress: 0,
    glowProgress: 0, // 0 = Blue (Image 1, < 2.0x), 1 = Purple (Image 2, >= 2.0x)
    glowOpacity: 0, // Fades in cleanly on flight start
    // Flowing axis dots offsets for >= 2.0x
    bottomDotsOffset: 0,
    leftDotsOffset: 0,
    // Preloaded plane frames
    planeFrames: [],
    planesLoaded: false,
    circleImg: null,
    circleLoaded: false,
    cruiseCycle: 0,
    flightStartTime: 0,
    lastState: "WAITING",
    lastPlaneX: 0,
    lastPlaneY: 0,
    lastPlaneAngle: 0,
    lastCpX: 0,
    lastCpY: 0,
    arcStartX: 0,
    arcStartY: 0,
    crashTime: 0,
  });

  // Preload clean plane frames and circle animation
  useEffect(() => {
    let loadedCount = 0;
    const frameSources = ["/plane_f0.png", "/plane_f1.png", "/plane_f2.png"];
    const frames = frameSources.map((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameSources.length) {
          animRef.current.planeFrames = frames;
          animRef.current.planesLoaded = true;
        }
      };
      return img;
    });

    const circle = new Image();
    circle.src = "/circleanimation.svg";
    circle.onload = () => {
      animRef.current.circleImg = circle;
      animRef.current.circleLoaded = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 1. Draw Sunburst Fan Rays: Originates at bottom-left corner (0, height) as in Image 2
    const drawSunburstBackground = (width, height) => {
      ctx.save();
      const circleImg = animRef.current.circleImg;
      const cornerX = 0;
      const cornerY = height;

      if (animRef.current.circleLoaded && circleImg) {
        ctx.save();
        ctx.translate(cornerX, cornerY);
        ctx.rotate(animRef.current.sunburstAngle);

        const drawRadius = Math.max(width, height) * 2.5;
        ctx.drawImage(
          circleImg,
          -drawRadius,
          -drawRadius,
          drawRadius * 2,
          drawRadius * 2,
        );
        ctx.restore();
      } else {
        const rayCount = 36;
        const radius = Math.max(width, height) * 2.5;
        const baseAngle = animRef.current.sunburstAngle;

        for (let i = 0; i < rayCount; i++) {
          const angle1 = baseAngle + (i * Math.PI) / (rayCount * 1.05);
          const angle2 = baseAngle + ((i + 0.5) * Math.PI) / (rayCount * 1.05);

          ctx.beginPath();
          ctx.moveTo(cornerX, cornerY);
          ctx.lineTo(
            cornerX + Math.cos(angle1) * radius,
            cornerY - Math.sin(angle1) * radius,
          );
          ctx.lineTo(
            cornerX + Math.cos(angle2) * radius,
            cornerY - Math.sin(angle2) * radius,
          );
          ctx.closePath();

          ctx.fillStyle =
            i % 2 === 0 ? "rgba(28, 29, 34, 0.98)" : "rgba(10, 11, 13, 0.99)";
          ctx.fill();
        }
      }
      // Uniform, seamless black opacity over the ENTIRE canvas box (no gaps or seams anywhere)
      ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    // 2. Draw Atmospheric Glowing Background (Exact match to user Image 1 & Image 2)
    // Starts with Electric Blue Glow (< 2.0x, Image 1), then smoothly morphs to Royal Purple Glow (>= 2.0x, Image 2)
    const drawAtmosphericNebula = (width, height) => {
      const state = gameStateRef.current;
      const currentMult = Number(multiplierRef.current) || 1.0;

      // Safe guards against HMR uninitialized ref values
      if (
        typeof animRef.current.glowProgress !== "number" ||
        isNaN(animRef.current.glowProgress)
      ) {
        animRef.current.glowProgress = 0;
      }
      if (
        typeof animRef.current.glowOpacity !== "number" ||
        isNaN(animRef.current.glowOpacity)
      ) {
        animRef.current.glowOpacity = 0;
      }

      if (state !== "FLYING") {
        animRef.current.glowProgress = 0;
        animRef.current.glowOpacity = 0;
        return;
      }

      // Smoothly fade in glow upon takeoff
      if (animRef.current.glowOpacity < 1.0) {
        animRef.current.glowOpacity = Math.min(
          1.0,
          animRef.current.glowOpacity + 0.06,
        );
      }

      // Requirement:
      // "jab start hota hai to first image jaese jaes 2x tak then 2x ke bad image 2 vala glowing bg"
      // Target: 0.0 for Blue (< 2.0x), 1.0 for Purple (>= 2.0x)
      const targetGlow = currentMult >= 2.0 ? 1.0 : 0.0;
      animRef.current.glowProgress +=
        (targetGlow - animRef.current.glowProgress) * 0.09;

      const p = Number.isFinite(animRef.current.glowProgress)
        ? Math.max(0, Math.min(1, animRef.current.glowProgress))
        : 0;
      const opacity = Number.isFinite(animRef.current.glowOpacity)
        ? Math.max(0, Math.min(1, animRef.current.glowOpacity))
        : 0;

      ctx.save();
      // Center glow right behind the multiplier text (Image 1 & Image 2)
      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const radius = Math.max(width, height) * 0.65;

      // Color interpolation:
      // Image 1: Electric Atmospheric Blue (stops: 0.0, 0.32, 0.65, 1.0)
      // Image 2: Deep Royal Violet-Purple (stops: 0.0, 0.32, 0.65, 1.0)
      const r0 = Math.round(18 + (125 - 18) * p);
      const g0 = Math.round(105 + (26 - 105) * p);
      const b0 = Math.round(185 + (175 - 185) * p);
      const a0 = Math.max(0, Math.min(1, (0.76 + (0.78 - 0.76) * p) * opacity));

      const r1 = Math.round(12 + (84 - 12) * p);
      const g1 = Math.round(62 + (15 - 62) * p);
      const b1 = Math.round(125 + (124 - 125) * p);
      const a1 = Math.max(0, Math.min(1, (0.5 + (0.52 - 0.5) * p) * opacity));

      const r2 = Math.round(8 + (42 - 8) * p);
      const g2 = Math.round(35 + (8 - 35) * p);
      const b2 = Math.round(75 + (68 - 75) * p);
      const a2 = Math.max(0, Math.min(1, (0.2 + (0.22 - 0.2) * p) * opacity));

      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        radius,
      );
      grad.addColorStop(0, `rgba(${r0}, ${g0}, ${b0}, ${a0.toFixed(3)})`);
      grad.addColorStop(0.32, `rgba(${r1}, ${g1}, ${b1}, ${a1.toFixed(3)})`);
      grad.addColorStop(0.65, `rgba(${r2}, ${g2}, ${b2}, ${a2.toFixed(3)})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // 3. Draw Coordinate Axes and Gentle Slow Moving Dots when >= 2.0x (Exact L-shape)
    const drawAxesAndDots = (width, height, originX, originY) => {
      ctx.save();

      // Clean razor-thin L-shaped Coordinate Axes (exact color (65, 47, 51) from Image 4)
      // Half-pixel offset ensures a razor-thin 1px crisp hairline
      ctx.strokeStyle = "rgba(65, 47, 51, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Left vertical line: touches top outer edge (y = 0) all the way down to originY
      ctx.moveTo(originX + 0.5, 0);
      ctx.lineTo(originX + 0.5, originY + 0.5);
      // Bottom horizontal line: touches right outer edge (width)
      ctx.lineTo(width, originY + 0.5);
      ctx.stroke();

      const currentMult = multiplierRef.current;
      const currentState = gameStateRef.current;
      // Requirement: "dots ONLY 2x ke baad hi animate karenge, round khatam to band, fir next round me 2x aane par hi animate karenge"
      const shouldAnimateDots = currentState === "FLYING" && currentMult >= 2.0;

      // Animate speed (0.22 px/frame)
      const slowDotSpeed = 0.22;

      // --- Left Vertical Axis (EXACTLY 10 Blue Dots, topmost dot touching near upper border) ---
      const topY = 12; // "ek dot thoda touch rhega uper"
      const vTotalHeight = originY - topY - 4;
      const vDotCount = 10; // Exactly 10 dots
      const vSpacing = vTotalHeight / (vDotCount - 1);

      if (shouldAnimateDots) {
        animRef.current.leftDotsOffset =
          (animRef.current.leftDotsOffset + slowDotSpeed) % vSpacing;
      } else {
        animRef.current.leftDotsOffset = 0;
      }

      ctx.fillStyle = "#34b4ff";
      ctx.shadowColor = "#34b4ff";
      ctx.shadowBlur = 3;

      for (let i = 0; i < vDotCount; i++) {
        let curY;
        if (shouldAnimateDots) {
          curY =
            topY +
            ((i * vSpacing + animRef.current.leftDotsOffset) %
              (vTotalHeight + 0.001));
        } else {
          curY = topY + i * vSpacing;
        }

        ctx.beginPath();
        // Dot thoda aur chhota (radius 1.8px)
        ctx.arc(originX - 15, curY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Bottom Horizontal Axis (EXACTLY 9 White Dots) ---
      const startX = originX + 24;
      const hTotalWidth = width - 24 - startX;
      const hDotCount = 9; // Exactly 9 dots
      const hSpacing = hTotalWidth / (hDotCount - 1);

      if (shouldAnimateDots) {
        animRef.current.bottomDotsOffset -= slowDotSpeed;
        if (animRef.current.bottomDotsOffset < 0) {
          animRef.current.bottomDotsOffset += hSpacing;
        }
      } else {
        animRef.current.bottomDotsOffset = 0;
      }

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 3;

      for (let i = 0; i < hDotCount; i++) {
        let curX;
        if (shouldAnimateDots) {
          const rawPos =
            (i * hSpacing + animRef.current.bottomDotsOffset) %
            (hTotalWidth + 0.001);
          curX = startX + rawPos;
        } else {
          curX = startX + i * hSpacing;
        }

        ctx.beginPath();
        // Dot thoda aur chhota (radius 1.8px)
        ctx.arc(curX, originY + 16, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // 4. Draw Airplane (Rock-solid stabilized body, propeller spin, scale and alpha support)
    const drawCleanPlane = (
      x,
      y,
      angle,
      isFlying = true,
      scale = 1.0,
      alpha = 1.0,
    ) => {
      ctx.save();
      if (alpha < 1.0) ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(angle);
      if (scale !== 1.0) ctx.scale(scale, scale);

      const frames = animRef.current.planeFrames;

      if (animRef.current.planesLoaded && frames.length === 3) {
        // Propeller spin: cycles frames 0, 1, 2 at 16 FPS while body remains 100% static
        const frameIndex = isFlying
          ? Math.floor((animRef.current.time * 16) % 3)
          : 0;
        const currentFrame = frames[frameIndex];

        const destW = 94;
        const destH = Math.round(destW * (76 / 148)); // ~48px

        ctx.shadowColor = "rgba(229, 5, 57, 0.75)";
        ctx.shadowBlur = 12;

        ctx.drawImage(
          currentFrame,
          -Math.round(destW / 2),
          -Math.round(destH / 2),
          destW,
          destH,
        );
      }
      ctx.restore();
    };

    // Main 60fps Render Loop
    const render = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const originX = 33;
      const originY = height - 28;
      const state = gameStateRef.current;
      const mult = multiplierRef.current;

      animRef.current.time += 0.05;

      // Rotation ONLY happens when airplane is flying!
      // CONSTANT speed: does NOT speed up at 10x!
      if (state === "FLYING") {
        const CONSTANT_SUNBURST_SPEED = 0.002;
        animRef.current.sunburstAngle += CONSTANT_SUNBURST_SPEED;
      }

      // 1. Draw Background Sunburst (Always present, originates at bottom-left corner (0, height))
      drawSunburstBackground(width, height);

      if (state === "FLYING") {
        // Track flight start timestamp for ultra-smooth 60/120fps hardware vsync animation
        if (animRef.current.lastState !== "FLYING") {
          animRef.current.lastState = "FLYING";
          const nowMs = performance.now();
          if (flightStartTimeRef.current > 0) {
            const wallElapsedMs = Math.max(
              0,
              Date.now() - flightStartTimeRef.current,
            );
            animRef.current.flightStartTime = nowMs - wallElapsedMs;
          } else {
            animRef.current.flightStartTime = nowMs;
          }
          animRef.current.cruiseCycle = 0;
        }

        // 2. Draw Dynamic Nebula (Fly phase)
        drawAtmosphericNebula(width, height);

        // 3. Draw Axes & Slow Smooth Dots
        drawAxesAndDots(width, height, originX, originY);

        animRef.current.flewAwayProgress = 0;

        // Continuous hardware-timed high-resolution flight time (ZERO steps, 60/120fps buttery smooth)
        const elapsedFlight =
          (performance.now() - animRef.current.flightStartTime) / 1000;
        // Exactly matches the ~3.5s duration it takes for the multiplier to hit 1.50x
        const climbProgress = Math.min(elapsedFlight / 3.5, 1.0);

        // Soft smooth easing: slow takeoff, gentle arc, and soft deceleration at 1.50x peak
        const easedX = 1 - Math.pow(1 - climbProgress, 2.2);
        const easedY = 1 - Math.pow(1 - climbProgress, 1.8);

        // Plane starts EXACTLY where it was parked in waiting (originX + 47)
        // Tail touches vertical border line (originX) - NEVER goes behind!
        const startFlightX = originX + 47;
        const startFlightY = originY - 22;

        const cruiseX = width * 0.74;
        const peakY = height * 0.17; // Reaches near top border first ("touch type ka hota hai")
        const troughY = height * 0.52; // Glides down to Image 2 position
        const midY = (peakY + troughY) / 2;
        const ampY = (troughY - peakY) / 2;

        let planeX, planeY, planeAngle;

        if (climbProgress < 1.0) {
          // Takeoff ascent: moves smoothly, gently and slowly forward and upward until 1.50x
          planeX = startFlightX + (cruiseX - startFlightX) * easedX;
          planeY = startFlightY - (startFlightY - peakY) * easedY;
          planeAngle = -0.12 * (1.0 - climbProgress);
        } else {
          // Cruising wave: starts once 1.50x is reached
          // Slow, calm, majestic speed (0.009 rad/frame)
          animRef.current.cruiseCycle += 0.009;
          const cycle = animRef.current.cruiseCycle;

          planeX = cruiseX;
          // Mathematical cosine wave: starts at peakY, dips to troughY, climbs to peakY
          planeY = midY - ampY * Math.cos(cycle);

          // Gentle aerodynamic tilt: tilts down slightly when descending, tilts up slightly when climbing
          planeAngle = Math.sin(cycle) * 0.04;
        }

        const arcStartX = originX;
        const arcStartY = originY;
        const cpX = arcStartX + (planeX - arcStartX) * 0.45;
        const cpY = arcStartY;

        // 4. Draw Translucent Red Gradient Curtain (Vertical drop straight down from plane)
        const fillGrad = ctx.createLinearGradient(0, planeY, 0, arcStartY);
        fillGrad.addColorStop(0, "rgba(229, 5, 57, 0.42)");
        fillGrad.addColorStop(0.5, "rgba(185, 0, 38, 0.25)");
        fillGrad.addColorStop(1, "rgba(120, 0, 20, 0.08)");

        ctx.beginPath();
        ctx.moveTo(arcStartX, arcStartY);
        ctx.quadraticCurveTo(cpX, cpY, planeX, planeY);
        ctx.lineTo(planeX, arcStartY); // Straight vertical drop
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // 5. Draw Straight Vertical Red Line
        ctx.beginPath();
        ctx.moveTo(planeX, planeY);
        ctx.lineTo(planeX, arcStartY);
        ctx.strokeStyle = "rgba(229, 5, 57, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 6. Draw Glowing Neon Red Flight Path Arc
        ctx.beginPath();
        ctx.moveTo(arcStartX, arcStartY);
        ctx.quadraticCurveTo(cpX, cpY, planeX, planeY);
        ctx.strokeStyle = "#e50539";
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "#e50539";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Save coordinates for instant crash fly-away zoom into the end
        animRef.current.lastPlaneX = planeX;
        animRef.current.lastPlaneY = planeY;
        animRef.current.lastPlaneAngle = planeAngle;
        animRef.current.lastCpX = cpX;
        animRef.current.lastCpY = cpY;
        animRef.current.arcStartX = arcStartX;
        animRef.current.arcStartY = arcStartY;

        // Draw Clean Stabilized Plane
        drawCleanPlane(planeX, planeY, planeAngle, true);
      } else if (state === "CRASHED") {
        if (animRef.current.lastState !== "CRASHED") {
          animRef.current.lastState = "CRASHED";
          animRef.current.crashTime = performance.now();
          animRef.current.glowProgress = 0;
          animRef.current.glowOpacity = 0;
        }

        const crashElapsed =
          (performance.now() - animRef.current.crashTime) / 1000;
        const startX = animRef.current.lastPlaneX;
        const startY = animRef.current.lastPlaneY;

        // Exact match to Screen Recording:
        // 1. Red curve and under-plane fill disappear INSTANTLY on crash.
        // 2. Axes and dots are clear.
        // 3. Plane zooms diagonally up-right and into the top-right end within ~0.24s (240ms).
        const DURATION = 0.24;
        if (crashElapsed < DURATION && startX > 0 && startY > 0) {
          const progress = Math.min(crashElapsed / DURATION, 1.0);
          // Smooth forward acceleration
          const eased = Math.pow(progress, 1.15);

          // Fly straight into the top-right end/corner of the canvas
          const targetX = width + 90;
          const targetY = Math.max(-50, startY - (targetX - startX) * 0.42);

          const currentX = startX + (targetX - startX) * eased;
          const currentY = startY + (targetY - startY) * eased;
          const currentAngle = -0.16; // Aerodynamic climb angle towards top right

          // Draw clean plane rocketing into the end (no red line, no flare, exact video match)
          drawCleanPlane(currentX, currentY, currentAngle, true, 1.0, 1.0);
        }
      } else if (state === "WAITING") {
        animRef.current.lastState = "WAITING";
        animRef.current.glowProgress = 0;
        animRef.current.glowOpacity = 0;
        // Waiting state: Axes and dots visible, plane parked touching L-border exactly (Image 4)
        drawAxesAndDots(width, height, originX, originY);
        // Plane tail touches vertical line at originX, belly rests on bottom horizontal line
        drawCleanPlane(originX + 47, originY - 22, 0, false);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Runs once in uninterrupted 60/120fps hardware RAF loop

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] s412:h-[350px] md:h-[390px] lg:h-[460px] bg-[#0c0d0e] border border-[#2a2b2e] rounded-[20px] overflow-hidden select-none shadow-2xl"
    >
      {/* Sound Mute/Unmute Button (Just beside the vertical border at originX = 33) */}
      <div className="absolute top-0 left-[38px] z-20">
        <button
          type="button"
          onClick={toggleSound}
          className="p-1.5 rounded-full text-[#d2d2d2] hover:text-white hover:border-[#6c757d] transition-all"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white/80" />
          ) : (
            <Volume2 className="w-6 h-6 text-white/80" />
          )}
        </button>
      </div>

      {/* CASHOUT NOTIFICATION BANNER (Exact Replica of Image 2 - Centered in Middle) */}
      <AnimatePresence>
        {cashoutAlert && (
          <div className="absolute top-[13%] s412:top-[15%] md:top-[17%] inset-x-0 flex justify-center items-center pointer-events-none z-30">
            <motion.div
              key={`cashout-banner-${cashoutAlert.id}`}
              initial={{ y: -14, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{
                y: -10,
                opacity: 0,
                scale: 0.97,
                transition: { duration: 0.22, ease: "easeIn" },
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center bg-[#0d2708] border border-[#28a909] rounded-full pl-3.5 pr-2 py-1 shadow-[0_4px_25px_rgba(0,0,0,0.6)] select-none whitespace-nowrap shrink-0 transform-gpu will-change-transform"
            >
              {/* Left section: "You have cashed out!" + Multiplier */}
              <div className="flex flex-col items-center justify-center text-center mr-2.5 pl-1 shrink-0">
                <span className="text-[10px] md:text-[10.5px] text-[#93d285] font-normal leading-tight mb-0.5">
                  You have cashed out!
                </span>
                <span className="text-[17px] md:text-[19px] font-bold text-white leading-none tracking-tight">
                  {cashoutAlert.multiplier.toFixed(2)}x
                </span>
              </div>

              {/* Middle Badge: Green Horizontal Pill with "Win INR" + Won Amount */}
              <div className="relative bg-[#3eb615] border border-[#64d436]/40 rounded-full px-3.5 md:px-4 py-0.5 flex flex-col items-center justify-center text-center overflow-hidden shrink-0 shadow-inner">
                {/* Star watermark outlines */}
                <svg
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-black/15 fill-black/10 pointer-events-none"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-black/15 fill-black/10 pointer-events-none"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[10px] md:text-[10.5px] text-white font-bold leading-tight drop-shadow-sm">
                  Win INR
                </span>
                <span className="text-[16px] md:text-[18px] text-white font-extrabold leading-tight drop-shadow-sm">
                  {cashoutAlert.winAmount.toFixed(2)}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setCashoutAlert(null)}
                className="ml-1.5 p-1 text-white/70 hover:text-white transition-colors cursor-pointer rounded-full shrink-0"
                title="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RED STAKE ERROR TOAST (Exact Image 1) */}
      <AnimatePresence>
        {stakeError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto bg-[#a6131b] shadow-[0_4px_24px_rgba(0,0,0,0.8)] rounded-[8px] px-4 py-2 flex items-center gap-3 border border-[#ff3e48]/30 max-w-[90vw]"
            >
              <span className="text-white text-[14px] md:text-[15px] font-[500] tracking-wide select-none">
                {stakeError}
              </span>
              <button
                type="button"
                onClick={() => setStakeError(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5 ml-0.5 shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HTML5 Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* CENTER OVERLAYS WITH FRAMER-MOTION SMOOTH TRANSITIONS */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <AnimatePresence mode="wait">
          {/* State 1: IN FLIGHT MULTIPLIER (Bold White) */}
          {gameState === "FLYING" && (
            <motion.div
              key="flying-mult"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            >
              <span className="text-white text-5xl s412:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-['Inter']">
                {multiplier.toFixed(2)}x
              </span>
            </motion.div>
          )}

          {/* State 2: CRASH / FLEW AWAY (Instant appearance matching video) */}
          {gameState === "CRASHED" && (
            <motion.div
              key="crashed-flew"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.04 }}
              className="text-center"
            >
              <div className="text-white text-[17px] s412:text-[19px] font-[500] tracking-wider uppercase mb-3 font-['Inter']">
                FLEW AWAY!
              </div>
              <div className="text-[#e50539] text-5xl s412:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-['Inter']">
                {(Number(multiplier) || 1.0).toFixed(2)}x
              </div>
            </motion.div>
          )}

          {/* State 3: WAITING FOR NEXT ROUND */}
          {gameState === "WAITING" && (
            <motion.div
              key="waiting-round"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center justify-center text-center max-w-[340px] px-4"
            >
              {/* Spinning Official Loading Icon */}
              <div className="relative mb-3.5">
                <img
                  src="/loading-animation.svg"
                  alt="Loading"
                  className="w-16 h-16 propeller-spin drop-shadow-[0_0_15px_rgba(229,5,57,0.7)]"
                />
              </div>

              {/* Title */}
              <h2 className="text-white text-[17px] s412:text-[19px] font-[500] tracking-wider uppercase mb-3 font-['Inter']">
                WAITING FOR NEXT ROUND
              </h2>

              {/* Smooth Red Progress Bar matching exact image width (100px) */}
              <div className="w-[100px] h-[4px] bg-[#252830] rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-[#ec0326] rounded-full will-change-[width]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (waitingCountdown / 7.0) * 100))}%`,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

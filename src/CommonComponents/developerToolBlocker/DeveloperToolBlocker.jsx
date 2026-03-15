import React from "react";

export function useDevtoolsDetect(options) {
  const {
    widthThreshold = 120,       // slightly lower for Safari docks
    heightThreshold = 120,
    pollingMs = 800,
    debuggerThresholdMs = 120,  // lower threshold; Safari pauses are shorter
    stallThresholdMs = 80,      // heavy loop stall threshold
  } = options || {};

  const [isOpen, setIsOpen] = React.useState(false);
  const flagged = React.useRef(false);

  // Track multiple viewport metrics; Safari differs from Chromium
  const last = React.useRef({
    iw: typeof window !== "undefined" ? window.innerWidth : 0,
    ih: typeof window !== "undefined" ? window.innerHeight : 0,
    ow: typeof window !== "undefined" ? window.outerWidth : 0,
    oh: typeof window !== "undefined" ? window.outerHeight : 0,
    vwW: typeof window !== "undefined" && window.visualViewport ? window.visualViewport.width : 0,
    vwH: typeof window !== "undefined" && window.visualViewport ? window.visualViewport.height : 0,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    function markOpen() {
      if (flagged.current) return;
      flagged.current = true;
      setIsOpen(true);
    }

    // Heuristic 1: multi-metric resize deltas (inner/outer/visualViewport)
    function checkResizeDelta() {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const ow = window.outerWidth;
      const oh = window.outerHeight;
      const vwW = window.visualViewport ? window.visualViewport.width : iw;
      const vwH = window.visualViewport ? window.visualViewport.height : ih;

      const dIw = Math.abs(iw - last.current.iw);
      const dIh = Math.abs(ih - last.current.ih);
      const dOw = Math.abs(ow - last.current.ow);
      const dOh = Math.abs(oh - last.current.oh);
      const dVw = Math.abs(vwW - last.current.vwW);
      const dVh = Math.abs(vwH - last.current.vwH);

      last.current = { iw, ih, ow, oh, vwW, vwH };

      // Any of these jumping by a dock width/height is suspicious
      if (
        dIw > widthThreshold || dIh > heightThreshold ||
        dOw > widthThreshold || dOh > heightThreshold ||
        dVw > widthThreshold || dVh > heightThreshold
      ) {
        markOpen();
      }
    }

    // Heuristic 2: debugger pause timing; run inside rAF to reduce optimizations
    function checkDebuggerPause() {
      requestAnimationFrame(() => {
        const t0 = performance.now();
        try { (0, eval)("debugger"); } catch (e) {}
        const dt = performance.now() - t0;
        if (dt > debuggerThresholdMs) {
          markOpen();
        }
      });
    }

    // Heuristic 3: synchronous heavy-loop stall detector
    function checkSynchronousStall() {
      const t0 = performance.now();
      // small CPU loop; if paused by DevTools, observed dt gets large
      let x = 0;
      for (let i = 0; i < 2e6; i++) { x += i; }
      const dt = performance.now() - t0;
      if (dt > stallThresholdMs) {
        markOpen();
      }
    }

    // Heuristic 4: hotkeys (Safari respects different combos)
    function onKeyDown(e) {
      const isMac = navigator.platform && navigator.platform.indexOf("Mac") >= 0;
      const k = (e.key || "").toLowerCase();
      // Cmd+Opt+I is common on Safari; F12 may not open DevTools by default
      if ((isMac && e.metaKey && e.altKey && k === "i") || e.key === "F12") {
        markOpen();
      }
    }

    // Heuristic 5: contextmenu + subsequent viewport delta (right-click Inspect)
    let contextMenuTime = 0;
    function onContextMenu() {
      contextMenuTime = performance.now();
      // after a short delay, see if viewport changed as DevTools opened
      setTimeout(() => {
        const iw = window.innerWidth;
        const ih = window.innerHeight;
        const vwW = window.visualViewport ? window.visualViewport.width : iw;
        const vwH = window.visualViewport ? window.visualViewport.height : ih;
        const dIw = Math.abs(iw - last.current.iw);
        const dIh = Math.abs(ih - last.current.ih);
        const dVw = Math.abs(vwW - last.current.vwW);
        const dVh = Math.abs(vwH - last.current.vwH);
        if (performance.now() - contextMenuTime < 1500 &&
            (dIw > widthThreshold || dIh > heightThreshold || dVw > widthThreshold || dVh > heightThreshold)) {
          markOpen();
        }
      }, 400);
    }

    // Listeners
    const vv = window.visualViewport;
    function onVVResize() { checkResizeDelta(); }

    window.addEventListener("resize", checkResizeDelta, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: true });
    window.addEventListener("contextmenu", onContextMenu, { passive: true });
    if (vv) vv.addEventListener("resize", onVVResize, { passive: true });

    // Poller: combine checks
    const interval = window.setInterval(() => {
      checkResizeDelta();
      checkDebuggerPause();
      checkSynchronousStall();
    }, pollingMs);

    // Initial run
    checkResizeDelta();
    checkDebuggerPause();
    checkSynchronousStall();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", checkResizeDelta);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("contextmenu", onContextMenu);
      if (vv) vv.removeEventListener("resize", onVVResize);
    };
  }, [widthThreshold, heightThreshold, pollingMs, debuggerThresholdMs, stallThresholdMs]);

  return isOpen;
}

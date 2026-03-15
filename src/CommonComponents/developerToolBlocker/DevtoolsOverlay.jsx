import React from "react";
import PropTypes from "prop-types";

export function DevtoolsOverlay({ show, onClose }) {
  if (!show) return null;

  const handleReload = (e) => {
    e.stopPropagation();
    window.location.reload();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    if (typeof onClose === "function") onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Developer tools warning"
      tabIndex={-1}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          background: "#111827",
          borderRadius: 12,
          padding: "24px 20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Developer tools detected</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>
          To continue, please close Inspect/Developer Tools and reload the page.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={handleReload}
            style={{
              background: "#10b981",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

DevtoolsOverlay.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

DevtoolsOverlay.defaultProps = {
  onClose: undefined,
};

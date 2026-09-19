import React from "react";
import "./loader.css";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="gugo-loader-overlay">
      <div className="gugo-loader-wrapper">
        <div className="gugo-loader"></div>
        {text && <p className="gugo-loader-text">{text}</p>}
      </div>
    </div>
  );
}

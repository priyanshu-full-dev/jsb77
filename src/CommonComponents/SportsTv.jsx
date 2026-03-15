import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function SportsTv() {
  const [searchParams] = useSearchParams();
  const [error, setError]= useState(false);
  const [showIgambli, setShowIgambli]= useState(false);

  const sportId = searchParams.get("sportId");
  const eventId = searchParams.get("eventId");

  return (
    <div
      id="full-market-live-tv"
      className="w-full h-screen bg-[#141435] flex justify-center items-center overflow-hidden"
    >
      <div className="relative w-full max-w-[1920px] aspect-video">
        {/* Iframe */}
        <iframe
          src={`https://dpmatka.in/dtv.php?id=${eventId}&sportid=${sportId}&muted`}
          allow="autoplay; picture-in-picture"
          className="absolute top-0 left-0 w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          onError={()=>{setShowIgambli(false)}}
          onLoad={()=>{if(!error){setShowIgambli(true)}}}
        />

        {/* Transparent Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ backgroundColor: "transparent" }}
        >
          {/* Image at top-left corner */}
          <img
            src="/aura/igambli-logo.gif" // Replace with your actual image path
            alt="Overlay"
            className="absolute left-[6px] h-[34px]"
            style={{ pointerEvents: "auto" }} // Allows interaction with the image
          />
        </div>
      </div>
    </div>
  );
}

export default SportsTv;

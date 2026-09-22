import React from "react";

export default function KuberScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #161824 0%, #0c0d14 50%, #06070a 100%)",
      }}
    >
      {/* Background ambient luxury glow orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-[#c10931]/15 blur-[90px] pointer-events-none -top-10" />
      <div className="absolute w-64 h-64 rounded-full bg-[#f5b300]/10 blur-[80px] pointer-events-none -bottom-10" />

      {/* Main Brand Card */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-6">
        {/* Glowing Logo */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Subtle pulse aura */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#c10931]/20 to-[#f5b300]/20 blur-xl animate-pulse" />

          {/* Logo Image */}
          <img
            src="https://imagedelivery.net/_oGMRGIDYQYkAb8XFE2QBQ/logos-248cabe4-07dc-44d3-b487-7898a1cb62c2.png/public"
            alt="Kuberbook666"
            className="relative w-44 md:w-52 h-auto object-contain drop-shadow-[0_4px_24px_rgba(193,9,49,0.5)] transition-transform duration-700"
          />
        </div>

        {/* Ultra-luxury laser track */}
        <div className="relative w-36 md:w-44 h-[2.5px] bg-white/[0.08] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              width: "45%",
              background:
                "linear-gradient(90deg, transparent 0%, #c10931 40%, #f5b300 70%, #ffffff 100%)",
              boxShadow: "0 0 12px #c10931, 0 0 6px #f5b300",
              animation: "kuberLaser 1.2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
            }}
          />
        </div>

        {/* Luxury Micro-Dots */}
        <div className="flex items-center gap-1.5 mt-3 opacity-60">
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#c10931]"
            style={{ animation: "kuberDot 1.2s infinite ease-in-out 0s" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#f5b300]"
            style={{ animation: "kuberDot 1.2s infinite ease-in-out 0.2s" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#c10931]"
            style={{ animation: "kuberDot 1.2s infinite ease-in-out 0.4s" }}
          />
        </div>
      </div>

      {/* Keyframe styles injected inline so no external CSS dependency is needed */}
      <style>{`
        @keyframes kuberLaser {
          0% {
            left: -50%;
          }
          50% {
            left: 55%;
          }
          100% {
            left: 110%;
          }
        }
        @keyframes kuberDot {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
            filter: drop-shadow(0 0 4px #c10931);
          }
        }
      `}</style>
    </div>
  );
}

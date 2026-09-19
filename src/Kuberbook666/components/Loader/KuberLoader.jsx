import React from "react";

export default function KuberLoader({ size = "default" }) {
  if (size === "small") {
    return (
      <div className="flex items-center justify-center p-2 w-full">
        <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#c10931] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[2.5px] border-white/10 border-t-[#c10931] animate-spin" />
        <div className="absolute w-5 h-5 rounded-full border-2 border-white/10 border-b-[#f5b300] animate-[spin_0.8s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}

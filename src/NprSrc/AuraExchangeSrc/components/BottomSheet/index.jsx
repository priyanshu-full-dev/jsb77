import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const BottomSheet = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {

      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 w-full transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ marginBottom: "55px", zIndex: 1000 }}
    >
      <div className="relative bg-white shadow-lg rounded-t-[8px] overflow-hidden">
  
        <button
          onClick={onClose}
          className="absolute top-0.5 right-1.5 z-50 bg-black/70 text-[red] rounded-full p-2 hover:bg-black"
        >
          <X size={20} />
        </button>

    
        <iframe
          id="miniCasinoIframe"
          height="220"
          width="100%"
          style={{
            border: "none",
            pointerEvents: "auto",
            overflow: "hidden",
          }}
          src="https://minicasino.ludoexchange.com/auth/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbmNyeXB0ZWRUb2tlbiI6IlUyRnNkR1ZrWDE5ZG82bTZibEY1aG1ZWWV3V2hQbGJWWGtkQUhOUnlHbXNFbm9pdG5xMisyN09uWUZZVGdXTTVuK3d1cjlsR0ZEdnFCVE9NNnJPTlZlQThqeVdFbHExc0M5UmkrNEhuR2tqTVNJOG9KQWdwODJvQXZqeWtUOWhJVFFmbkxwaTlVekJqYS9CWVpSL0poL2w4bGJGeXYyQ29KNDBBLzc4bU5HaGt0ajZjWGxFamdBRHFlSlhmQ3ZiaXRGNi82Z01vSGVGSm9XODdaZ3o4eDJWNjROb0ZSYVZ5ZkN4UHVqTUJyd0lGZmUxdGVZQTN0WENxZ3FiNS9pVDY0WnVpcFFOWlNiQXRBWldzSzJ4dnJCVWZwd3VocDREMFV1NHBRNDgvYWNRQ09MZzNRY2tGODVpT3hmejJ0MzZZUGdQSkFISlp1cEhuU3ZFL2FjSTZoUT09IiwiaWF0IjoxNzU2OTYyOTEyLCJleHAiOjE3NTY5ODA5MTJ9.fCLgA8c692ZRQV6TE75NriDraaYJumUEwp8ct8hnFNI"
          title="Mini Casino"
        ></iframe>
      </div>
    </div>
  );
};

export default BottomSheet;

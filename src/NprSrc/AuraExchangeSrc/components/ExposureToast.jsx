import React from "react";
import { FaCheck } from "react-icons/fa6";

const typeConfig = {
  error: {
    icon: (
      <img
        src="/error.png"
        alt="Error"
        className="w-6 h-6 object-contain"
      />
    ),
    titleColor: "#ffe5e5",
    subColor: "#ffd6d6",
  },
  warning: {
    icon: <FaCheck size={24} />,
    titleColor: "#fff4d2",
    subColor: "#ffedb0",
  },
  success: {
    icon: <FaCheck size={24} />,
    titleColor: "#e3ffe5",
    subColor: "#c8ffd0",
  },
};

export default function ExposureToast({
  type = "error",
  title = "",
  subtitle = "No Markets are active",
  icon,
}) {
  const config = typeConfig[type] || typeConfig.error;

  return (
    <div className="flex items-center">
      <div className="exposure-toast-icon">
        {icon || config.icon}
      </div>

      <div>
        {title && (
          <div
            className="exposure-toast-title"
            style={{ color: config.titleColor }}
          >
            {title}
          </div>
        )}

        <div
          className="exposure-toast-sub"
          style={{ color: config.subColor }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
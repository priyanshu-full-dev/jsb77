import React from "react";

const PageSkeleton = () => {
  return (
    <div className="w-full min-h-screen bg-[#071126] text-white flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-sm font-medium tracking-wide">Loading...</p>
    </div>
  );
};

export default PageSkeleton;

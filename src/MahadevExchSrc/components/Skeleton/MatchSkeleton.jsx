import React from 'react';

const MatchSkeleton = () => {
  return (
    <div className="w-full">
      {/* Skeleton for 6 rows of matches */}
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex w-full sm:items-start items-start gap-1 flex-col sm:flex-row justify-between py-1 border-b border-gray animate-pulse"
        >
          {/* Left side: Match time, teams, and LIVE NOW */}
          <div className="flex-1 w-full">
            {/* Time and Teams */}
            <div className="flex items-center space-x-2 w-full ">
              <div className="h-4 bg-[#6277856b] rounded w-[50%] sm:w-[40%]"></div>
              <div className="h-4 bg-[#6277856b] rounded w-[50px]"></div>
            </div>
            {/* LIVE NOW placeholder */}
            
          </div>

          {/* Right side: TV icon and Betting odds (6 columns) */}
          <div className="flex  space-x-2 sm:w-[50%] w-full">


            {/* Odds placeholders */}
            <div className="flex space-x-1 flex justify-end w-full">
              {/* First odds column (blue background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
              {/* Second odds column (pink background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
              {/* Third odds column (blue background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
              {/* Fourth odds column (no background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
              {/* Fifth odds column (blue background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
              {/* Sixth odds column (no background) */}
              <div className="h-[24px] sm:w-[80px] w-[100%] bg-[#6277856b] rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchSkeleton;
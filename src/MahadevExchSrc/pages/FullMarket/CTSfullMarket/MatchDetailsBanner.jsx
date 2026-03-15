import { useState } from "react";
import { MdLiveTv, MdOutlineScoreboard } from "react-icons/md";

export const sportsMapping = {
  4: "Cricket",
  1: "Soccer",
  2: "Tennis",
};

function MatchDetailsBanner({ sportId, eventId, eventName }) {
  const [liveTv, setLiveTv] = useState(false);

  const handleToggle = () => {
    setLiveTv((prev) => !prev);
  };

  return (
    <div className="w-full bg-[#0f0f1a]">
      {/* HEADER */}
      <div
        className="w-full flex bg-[#2b2b2b] justify-between items-center px-3 py-1"
        style={{ boxShadow: "0 0 4px #0000006e" }}
      >
        <p className="text-white text-[13px] font-semibold truncate">
          {sportsMapping[sportId]} / {eventName}
        </p>

        {/* SINGLE TOGGLE ICON */}
        <div role="button" onClick={handleToggle}>
          {liveTv ? (
            <MdOutlineScoreboard size={22} color="lime" />
          ) : (
            <MdLiveTv size={22} color="white" />
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-[#141435] border-t border-[#2c2c44]">
        {liveTv ? (
          <div className="w-full bg-black flex justify-center">
            <div className="w-full max-w-[720px] aspect-video relative">
              <iframe
                src={`https://asianexchange.club/live-tv?sportId=${sportId}&eventId=${eventId}`}
                
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="autoplay; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <iframe
            src={`https://tv.tresting.com/lnt.php?eventid=${eventId}`}
            width="100%"
            height="180px"
            allow="autoplay; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        )}
      </div>
    </div>
  );
}

export default MatchDetailsBanner;
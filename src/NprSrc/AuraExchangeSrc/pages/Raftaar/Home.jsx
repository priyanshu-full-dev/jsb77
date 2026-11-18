import React, {
  useState,
  useEffect,
  Fragment,
  useMemo,
  useCallback,
} from "react";
import { ChevronRight, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Header from "../../components/Raftaar/Header";
import { FaChevronRight } from "react-icons/fa6";
import { FaRupeeSign, FaAward, FaChessKing, FaCrown } from "react-icons/fa";

import { RiLiveLine } from "react-icons/ri";

import BottomNav from "../../components/Raftaar/Bottomnav";
import Footer from "./Footer";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setMarketName,
  setMarketOddsData,
  setRunningData,
} from "../../../../redux/slices/fullmarketSlice";
import { isSignupUser } from "../../../../utils/helper/commonSelectors";
import { toast } from "react-toastify";
import {
  getGameSections,
  launcherUrl,
  updateCasinoBalance,
} from "../../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../../redux/slices/userSlice";
import {
  generatePresignedUrl,
  formatS3PathStyle,
} from "../../../../utils/helper/generatePresignedUrl";

const banner = ["/raftaar/b1.png", "/raftaar/b1.png", "/raftaar/b1.png"];

// ---- Recently Played hardcoded hi rahega, chahe admin kuch v bheje isse koi farak nahi padta ----
const defaultRecent = [
  {
    title: "AVIATOR",
    image:
      "https://client.qtlauncher.com/images/?id=SPB-aviator_en_US&type=banner&version=1717639255542",
    gameId: "SPB-aviator",
    provider: "Spribe",
  },
  {
    title: "MINES",
    image:
      "https://client.qtlauncher.com/images/?id=SPB-mines_en_US&type=banner&version=1637301832150",
    gameId: "SPB-mines",
    provider: "Spribe",
  },
  {
    title: "BALLOON",
    image:
      "https://client.qtlauncher.com/images/?id=SPB-balloon_en_US&type=banner&version=1773695788236",
    gameId: "SPB-balloon",
    provider: "Spribe",
  },
];

const FIXED_TITLES = ["Top Games"];

// gameId se "-" hatakar title banane ke liye helper
const formatTitle = (gameId = "") => gameId.replace(/-/g, " ").toUpperCase();

// ---- Sport icon per sportName ----
function SportIcon({ sportName }) {
  const name = (sportName || "").toLowerCase();

  if (name === "cricket") {
    return (
      <img
        src="/aura/cricket.png"
        alt="Cricket"
        className="w-[20px] h-[20px] object-contain"
      />
    );
  }
  if (name === "tennis") {
    return (
      <img
        src="/aura/tennis.png"
        alt="Tennis"
        className="w-[20px] h-[20px] object-contain"
      />
    );
  }
  if (name === "soccer" || name === "football") {
    return (
      <img
        src="/aura/football.png"
        alt="Football"
        className="w-[20px] h-[20px] object-contain"
      />
    );
  }
  return <RiLiveLine size={20} className="text-[#e2e1e1]" />;
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <span className="bg-[#3ee06a] text-[#04101f] font-sans text-[9px] font-bold px-1.5 py-[1px] rounded-[3px]">
        LIVE
      </span>
    </div>
  );
}

function CircleBtn({ label }) {
  return (
    <div className="w-5 h-5 font-sans rounded-full bg-[#132a4d] flex items-center justify-center text-white font-bold text-[9px]">
      {label}
    </div>
  );
}

function OddsPill({ left, right }) {
  return (
    <div className="flex rounded-[12px] overflow-hidden flex-1">
      <div className="flex-1 bg-[#122a4f] text-center py-1 px-1.5">
        <p className="text-white font-bold text-[10px] font-sans leading-tight">
          {left.odd || "0"}
        </p>
        <p className="text-[#7d93b3] text-[8px]  font-sans">
          {left.vol || "0"}
        </p>
      </div>
      <div className="flex-1 bg-[#1c3a68] text-center py-1 px-1.5">
        <p className="text-white font-bold text-[10px] font-sans leading-tight">
          {right.odd || "0"}
        </p>
        <p className="text-[#8ea2c0] text-[8px]  font-sans">
          {right.vol || "0"}
        </p>
      </div>
    </div>
  );
}

function SectionIcon({ icon, fallback }) {
  if (icon && typeof icon === "string") {
    return (
      <img
        src={formatS3PathStyle(icon)}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-[22px] h-[22px] object-contain flex-shrink-0"
      />
    );
  }
  return fallback || null;
}

function TopGamesSection({ title, icon, data, onGameClick, onViewAll }) {
  const scrollRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const isPausedRef = React.useRef(false);

  const games = Array.isArray(data) ? data : [];

  // Duplicate games for seamless infinite loop
  const loopGames = [...games, ...games, ...games];

  React.useEffect(() => {
    const container = scrollRef.current;

    if (!container || games.length < 2) return;

    let lastTime = 0;

    const speed = 0.035;

    const animate = (time) => {
      if (!lastTime) lastTime = time;

      const delta = time - lastTime;
      lastTime = time;

      if (!isPausedRef.current) {
        container.scrollLeft += delta * speed;

        // Reset after first copy
        const oneSetWidth = container.scrollWidth / 3;

        if (container.scrollLeft >= oneSetWidth) {
          container.scrollLeft -= oneSetWidth;
        }

        if (container.scrollLeft <= 0) {
          container.scrollLeft += oneSetWidth;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [games.length]);

  if (!games.length) return null;

  return (
    <div
      className="
        mt-2
        mx-1.5
        rounded-[16px]
        bg-[#081426]
        border
        border-white/[0.07]
        overflow-hidden
        py-3
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 mb-3">
        <button
          type="button"
          onClick={onViewAll}
          className="
            flex
            items-center
            gap-2
            font-sans
            active:scale-[0.97]
            transition-transform
          "
        >
          <span
            className="
              flex
              items-center
              justify-center
              w-[30px]
              h-[30px]
              rounded-[9px]
              bg-[#141e30]
              border
              border-white/[0.07]
            "
          >
            <SectionIcon
              icon={icon}
              fallback={<FaCrown size={15} className="text-[#f5c94b]" />}
            />
          </span>

          <div className="flex flex-col items-start">
            <h2
              className="
                text-[#f1f2f4]
                text-[16px]
                font-bold
                font-sans
                leading-[18px]
              "
            >
              {title || "Top Games"}
            </h2>

            <span
              className="
                mt-[3px]
                w-[18px]
                h-[2px]
                rounded-full
                bg-[#f5c94b]
              "
            />
          </div>
        </button>

        <button
          type="button"
          onClick={onViewAll}
          className="
            flex
            items-center
            gap-0.5
            text-[#858d99]
            hover:text-white
            text-[11px]
            font-bold
            font-sans
            active:scale-95
            transition-all
          "
        >
          View All
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>

      {/* INFINITE SCROLLER */}
      <div
        ref={scrollRef}
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={() => {
          isPausedRef.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isPausedRef.current = false;
          }, 1200);
        }}
        className="
          flex
          items-start
          gap-2.5
          overflow-x-auto
          px-3
          pb-1
          select-none
          cursor-grab
          active:cursor-grabbing
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loopGames.map((item, i) => {
          const gameId = item.gameId || item.id || i;
          const gameName = item.title || item.gameName || item.name || "Game";

          return (
            <div
              key={`${gameId}-${i}`}
              onClick={() => onGameClick && onGameClick(item.gameId || item.id)}
              className="
                group
                relative
                flex-shrink-0
  
                cursor-pointer
                active:scale-[0.94]
                transition-transform
                duration-200
              "
            >
              {/* CARD */}
              <div
                className="
                relative
                w-[58px]
                h-[60px]
                rounded-full
                overflow-hidden
                bg-[#0b1728]
                border
                border-white
                shadow-[0_4px_12px_rgba(0,0,0,0.35)]
                transition-all
                duration-300
                group-hover:border-white/[0.15]
                group-hover:-translate-y-0.5
                group-hover:shadow-[0_7px_16px_rgba(0,0,0,0.45)]
              "
              >
                {/* IMAGE */}
                {item.image ? (
                  <img
                    src={formatS3PathStyle(item.image)}
                    alt={gameName}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="
        absolute
        inset-0
        w-full
        h-full
        object-contain
        p-[8px]
        transition-transform
        duration-400
        ease-out
        group-hover:scale-[1.04]
      "
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#10233d] animate-pulse" />
                )}

                {/* VERY LIGHT OVERLAY */}
                <div
                  className="
      absolute
      inset-0
      bg-gradient-to-t
      from-black/65
      via-transparent
      to-transparent
      pointer-events-none
    "
                />

                {/* PLAY BUTTON */}
                <span
                  className="
      absolute
      left-1/2
      top-1/2
      -translate-x-1/2
      -translate-y-1/2
      flex
      items-center
      justify-center
      w-[30px]
      h-[30px]
      rounded-full
      bg-black/50
      backdrop-blur-sm
      border
      border-white/[0.20]
      opacity-0
      scale-75
      group-hover:opacity-100
      group-hover:scale-100
      transition-all
      duration-200
      pointer-events-none
    "
                >
                  <span
                    className="
        ml-[2px]
        w-0
        h-0
        border-t-[5px]
        border-t-transparent
        border-b-[5px]
        border-b-transparent
        border-l-[8px]
        border-l-white
      "
                  />
                </span>

                {/* GAME NAME */}
                <div
                  className="
      absolute
      left-0
      right-0
      bottom-0
      px-1.5
      pb-1.5
      pointer-events-none
    "
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

const Section = ({
  title,
  data,
  icon,
  onGameClick,
  onViewAll,
  favorites = [],
  onToggleFavorite,
  totalGames = 0,
}) => (
  <div className="mt-2 mx-1.5">
    {/* SECTION HEADER */}
    <div className="flex items-center justify-between mb-3.5 px-1">
      {/* LEFT — SECTION TITLE */}
      <button
        type="button"
        onClick={onViewAll}
        className="
      group
      flex
      items-center
      gap-2.5
      min-w-0
      font-sans
      cursor-pointer
      active:scale-[0.97]
      transition-transform
      duration-200
    "
      >
        {/* ICON */}
        <span
          className="
        relative
        flex
        items-center
        justify-center
        w-[34px]
        h-[34px]
        shrink-0
        rounded-[11px]
        bg-gradient-to-br
        from-[#18263b]
        to-[#0c1728]
        border
        border-white/[0.08]
        shadow-[0_4px_14px_rgba(0,0,0,0.28)]
        overflow-hidden
      "
        >
          {/* subtle shine */}
          <span
            className="
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.06]
          via-transparent
          to-transparent
          pointer-events-none
        "
          />

          <SectionIcon
            icon={icon}
            fallback={
              <RiLiveLine size={19} className="relative z-10 text-[#f1f2f4]" />
            }
          />
        </span>

        {/* TITLE */}
        <div className="flex flex-col items-start min-w-0">
          <h2
            className="
          text-[#f3f4f6]
          text-[17px]
          font-bold
          font-sans
          leading-[20px]
          tracking-[-0.25px]
          whitespace-nowrap
        "
          >
            {title}
          </h2>

          {/* small accent line */}
          <span
            className="
          mt-[4px]
          h-[2px]
          w-[18px]
          rounded-full
          bg-[#e5e4e4]
          opacity-70
          transition-all
          duration-200
          group-hover:w-[26px]
        "
          />
        </div>
      </button>

      {/* RIGHT — GAME COUNT */}
      {title !== "Recently Played" && (
        <button
          type="button"
          onClick={onViewAll}
          className="
        group
        flex
        items-center
        gap-1.5
        shrink-0
        font-sans
        cursor-pointer
        active:scale-[0.94]
        transition-all
        duration-200
      "
        >
          <span
            className="
          text-[#8f96a1]
          text-[12px]
          font-bold
          font-sans
          tracking-[-0.1px]
          transition-colors
          duration-200
          group-hover:text-[#d8dbe0]
        "
          >
            {totalGames} Games
          </span>

          <span
            className="
          flex
          items-center
          justify-center
          w-[24px]
          h-[24px]
          rounded-full
          bg-white/[0.045]
          border
          border-white/[0.06]
          transition-all
          duration-200
          group-hover:bg-white/[0.08]
          group-hover:border-white/[0.10]
        "
          >
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="
            text-[#8b919b]
            group-hover:text-[#e5e7eb]
            group-hover:translate-x-[1px]
            transition-all
            duration-200
          "
            />
          </span>
        </button>
      )}
    </div>

    {/* HORIZONTAL GAME SCROLL */}
    <div
      className="
        flex
        
        overflow-x-auto
        pb-1
        snap-x
        snap-mandatory
      "
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`
        .game-section-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {(data || []).map((item, i) => {
        const gameId = item.gameId || item._id;
        const isFav = favorites.includes(gameId);

        return (
          <div
            key={gameId || i}
            className="
            flex
            flex-col
            items-center
            flex-shrink-0
            w-[120px]
            snap-start
          "
          >
            {/* GAME CARD */}
            <div
              onClick={() => onGameClick && onGameClick(item.gameId)}
              className="
    group
    relative
    w-[115px]
    overflow-hidden
    rounded-[14px]
    bg-[#0b192d]
    border
    border-white/[0.08]
    shadow-[0_6px_18px_rgba(0,0,0,0.45)]
    cursor-pointer
    select-none
    transition-all
    duration-300
    ease-out
    hover:-translate-y-1
    hover:shadow-[0_10px_25px_rgba(0,0,0,0.55)]
    active:scale-[0.94]
    active:translate-y-0
  "
            >
              <div
                className={`relative w-full overflow-hidden ${
                  title === "Recently Played" ? "h-[120px]" : "h-[150px]"
                }`}
              >
                {/* IMAGE */}
                {item.image ? (
                  <img
                    src={formatS3PathStyle(item.image)}
                    loading="lazy"
                    decoding="async"
                    alt={item.title}
                    className="
          w-full
          h-full
          object-cover
          transition-all
          duration-500
          ease-out
          group-hover:scale-[1.08]
          group-active:scale-[1.03]
        "
                  />
                ) : (
                  <div className="w-full h-full bg-[#0f2544] animate-pulse" />
                )}

                {/* DARK GRADIENT */}
                <div
                  className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/75
        via-black/10
        to-black/20
        pointer-events-none
      "
                />

                {/* HOVER GLOW */}
                <div
                  className="
        absolute
        inset-0
        bg-white/[0.03]
        opacity-0
        group-hover:opacity-100
        transition-opacity
        duration-300
        pointer-events-none
      "
                />

                {/* SHINE ANIMATION */}
                <div
                  className="
        absolute
        inset-y-0
        -left-[80%]
        w-[45%]
        rotate-[18deg]
        bg-gradient-to-r
        from-transparent
        via-white/[0.18]
        to-transparent
        pointer-events-none
        group-hover:left-[130%]
        transition-all
        duration-700
        ease-out
      "
                />

                {/* PLAY BUTTON */}
                <div
                  className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
      "
                >
                  <span
                    className="
          flex
          items-center
          justify-center
          w-[43px]
          h-[43px]
          rounded-full
          bg-black/45
          backdrop-blur-md
          border
          border-white/[0.18]
          shadow-[0_5px_18px_rgba(0,0,0,0.45)]
          opacity-0
          scale-75
          group-hover:opacity-100
          group-hover:scale-100
          group-active:scale-90
          transition-all
          duration-300
          ease-out
        "
                  >
                    {/* PLAY TRIANGLE */}
                    <span
                      className="
            ml-[3px]
            w-0
            h-0
            border-t-[7px]
            border-t-transparent
            border-b-[7px]
            border-b-transparent
            border-l-[11px]
            border-l-white
          "
                    />
                  </span>
                </div>

                {/* FAVORITE */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (onToggleFavorite) {
                      onToggleFavorite(gameId, e);
                    }
                  }}
                  className="
        absolute
        top-2
        right-2
        z-20
        flex
        items-center
        justify-center
        w-[28px]
        h-[28px]
        rounded-full
        bg-black/45
        backdrop-blur-md
        border
        border-white/[0.12]
        shadow-[0_3px_10px_rgba(0,0,0,0.35)]
        active:scale-75
        hover:bg-black/65
        transition-all
        duration-200
      "
                >
                  <Heart
                    size={14}
                    strokeWidth={2}
                    className={
                      isFav ? "text-red-500 fill-red-500" : "text-white/90"
                    }
                    fill={isFav ? "currentColor" : "none"}
                  />
                </button>

                {/* PLAY LABEL */}
                <div
                  className="
        absolute
        bottom-2
        left-0
        right-0
        flex
        justify-center
        pointer-events-none
        opacity-0
        translate-y-2
        group-hover:opacity-100
        group-hover:translate-y-0
        transition-all
        duration-300
      "
                >
                  <span
                    className="
          px-2.5
          py-1
          rounded-full
          bg-black/50
          backdrop-blur-md
          border
          border-white/[0.10]
          text-white
          text-[9px]
          font-bold
          font-sans
          tracking-wide
        "
                  >
                    PLAY NOW
                  </span>
                </div>
              </div>
            </div>

            <p
              className="
                mt-1.5
                w-[115px]
                px-1
                text-center
                text-[#d7dce4]
                text-[10px]
                font-bold
                font-sans
                leading-tight
                truncate
              "
            >
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

// ---- helpers for formatting odds/time ----
const formatPrice = (price) => (price && price > 0 ? price : "-");

const formatVolume = (size) => {
  if (!size || size <= 0) return "0";
  if (size >= 100000) return (size / 100000).toFixed(1) + "L";
  if (size >= 1000) return (size / 1000).toFixed(1) + "K";
  return Math.round(size).toString();
};

const formatMatchTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `Today ${timeStr}`;
  return (
    date.toLocaleDateString([], { day: "2-digit", month: "short" }) +
    " " +
    timeStr
  );
};

const transformMatch = (rawMatch) => {
  if (!rawMatch) return null;

  const moOdds = (rawMatch.matchOdds || []).find(
    (m) => m.marketId === rawMatch.marketId,
  );

  if (!moOdds) return null;

  const runners = (rawMatch.matchRunners || []).map((r) => {
    const liveRunner = (moOdds.runners || []).find(
      (x) => x.selectionId === r.selectionId,
    );
    const back = liveRunner?.ex?.availableToBack?.[0];
    const lay = liveRunner?.ex?.availableToLay?.[0];

    return {
      selectionId: r.selectionId,
      runnerName: r.runnerName,
      backPrice: back?.price || 0,
      backSize: back?.size || 0,
      layPrice: lay?.price || 0,
      laySize: lay?.size || 0,
    };
  });

  return {
    _id: rawMatch.eventId,
    exEventId: rawMatch.eventId,
    sportId: rawMatch.sportId,
    sportID: rawMatch.sportId,
    sportName: rawMatch.sportName,
    tournamentName: rawMatch.competitionName,
    competitionId: rawMatch.competitionId,
    eventName: rawMatch.eventName,
    eventTime: rawMatch.openDate,
    openDate: rawMatch.openDate,
    marketId: rawMatch.marketId,
    marketName: rawMatch.marketName,
    joinedMarketIds: rawMatch.joinedMarketIds || rawMatch.marketId,
    isBookmakers: rawMatch.bm,
    isFancy: rawMatch.fancy,
    isSportsbook: rawMatch.pc,
    tv: rawMatch.tv,
    inPlay: moOdds.inplay === true,
    runners,
    runnersData: rawMatch.matchRunners,
    oddsData: moOdds,
  };
};

const getInPlayMatches = (rawMatches) => {
  if (!Array.isArray(rawMatches)) return [];
  return rawMatches.map(transformMatch).filter((m) => m && m.inPlay === true);
};

// ---- Match card for live sports ----
function MatchCard({ match }) {
  const runners = match.runners || [];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setRunningData(match.runnersData));
    dispatch(setMarketName(match.marketName));
    dispatch(
      setMarketOddsData({
        data: { data: match.oddsData },
        sport: match.sportName,
      }),
    );

    const params = new URLSearchParams({
      eventType: match.sportId || match.sportID || "",
      eventId: match.exEventId || "",
      marketId: match.marketId || "",
      joinedMarketIds: match.joinedMarketIds || match.marketId || "",
      competitionId: match.competitionId || "",
      bm: String(!!match.isBookmakers),
      fancy: String(!!match.isFancy),
      pc: String(!!match.isSportsbook),
      eventName: match.eventName || "",
    });

    navigate(`/full-market-2?${params.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#050f24] rounded-[8px] border border-[#0f2544] p-2.5 w-[240px] flex-shrink-0 snap-start cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 min-w-0">
          <SportIcon sportName={match.sportName} />
          <span className="text-[#e2e1e1] font-sans font-bold text-[11px] tracking-wide truncate">
            {(match.sportName || "").toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <CircleBtn label="MO" />
          {match.isBookmakers && <CircleBtn label="BM" />}
          {match.isFancy && <CircleBtn label="F" />}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-[#9baabf] font-sans text-[9.5px] truncate">
          {match.tournamentName}
        </p>

        <div className="flex justify-between items-start gap-1.5">
          <h2 className="text-[#e2e1e1] tracking-wide truncate font-sans mt-0.5 font-bold text-[12px] leading-snug line-clamp-2">
            {match.eventName}
          </h2>
          {match.inPlay && <LiveBadge />}
        </div>

        <p className="text-[#9baabf] text-[9.5px] font-sans mt-0.5">
          {formatMatchTime(match.eventTime)}
        </p>
      </div>

      <div className="flex flex-row w-full gap-1 mt-2">
        {runners.map((runner) => (
          <div
            key={runner.selectionId}
            className="flex items-center w-full gap-1.5"
          >
            <OddsPill
              left={{
                odd: formatPrice(runner.backPrice),
                vol: formatVolume(runner.backSize),
              }}
              right={{
                odd: formatPrice(runner.layPrice),
                vol: formatVolume(runner.laySize),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const S3_HOST = "storag-igambli.com.s3.ap-southeast-1.amazonaws.com";
const GAME_SECTIONS_CACHE_KEY = "raftaar_game_sections_cache_v1";
const GAME_SECTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isS3Image = (url = "") => {
  return (
    typeof url === "string" &&
    (url.includes(S3_HOST) ||
      url.includes("storag-igambli") ||
      url.includes("amazonaws.com"))
  );
};

// Cache the already-resolved sections so route navigation does not make
// the user wait for the API + S3 presigning again.
let gameSectionsMemoryCache = null;
let gameSectionsPromise = null;

const readGameSectionsCache = () => {
  try {
    const raw = localStorage.getItem(GAME_SECTIONS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.data || !Array.isArray(parsed.data)) {
      localStorage.removeItem(GAME_SECTIONS_CACHE_KEY);
      return null;
    }

    parsed.data = parsed.data.map((section) => ({
      ...section,
      icon: formatS3PathStyle(section?.icon),
      games: Array.isArray(section?.games)
        ? section.games.map((g) => ({
            ...g,
            image: formatS3PathStyle(g?.image),
          }))
        : section?.games,
    }));

    // Even if stale, return it for instant UI. A background refresh can update it.
    return parsed;
  } catch (error) {
    console.error("Failed to read game sections cache:", error);
    return null;
  }
};

const writeGameSectionsCache = (data) => {
  try {
    localStorage.setItem(
      GAME_SECTIONS_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch (error) {
    console.error("Failed to write game sections cache:", error);
  }
};

const resolveGameSections = async (rawSections) => {
  return Promise.all(
    rawSections.map(async (section) => {
      let resolvedIcon = section.icon || null;

      // Only S3 needs signing. Aura/CDN/QT/etc. stay untouched.
      if (resolvedIcon && isS3Image(resolvedIcon)) {
        try {
          resolvedIcon = await generatePresignedUrl(resolvedIcon);
        } catch (error) {
          console.error("section icon presign error", section.title, error);
          resolvedIcon = section.icon;
        }
      }

      const games = await Promise.all(
        (section.games || []).map(async (game) => {
          let resolvedImage = game.image || null;

          if (resolvedImage && isS3Image(resolvedImage)) {
            try {
              resolvedImage = await generatePresignedUrl(resolvedImage);
            } catch (error) {
              console.error("game image presign error", game.gameId, error);
              resolvedImage = game.image;
            }
          }

          return {
            gameId: game.gameId,
            title: formatTitle(game.gameId),
            image: resolvedImage,
          };
        }),
      );

      return {
        _id: section._id,
        title: section.title,
        icon: resolvedIcon,
        games,
      };
    }),
  );
};

const fetchGameSectionsCached = async ({ background = false } = {}) => {
  // If another request is already running, share the same Promise.
  if (gameSectionsPromise) {
    return gameSectionsPromise;
  }

  gameSectionsPromise = (async () => {
    const res = await getGameSections();
    const rawSections = res?.data?.data || [];

    const resolvedSections = await resolveGameSections(rawSections);

    // Keep memory + localStorage cache updated.
    gameSectionsMemoryCache = {
      timestamp: Date.now(),
      data: resolvedSections,
    };

    writeGameSectionsCache(resolvedSections);

    return resolvedSections;
  })();

  try {
    return await gameSectionsPromise;
  } finally {
    gameSectionsPromise = null;
  }
};

const Home = () => {
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const loginType = useSelector((state) => state.user.loggedInType);

  const userData = useSelector((state) => state?.user?.userData);
  const siteCasinoData = useSelector((state) => state.siteCasino);
  const dispatch = useDispatch();

  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  const storageKey = useMemo(() => {
    return userData?._id
      ? `raftaar_fav_${userData._id}`
      : "raftaar_favorite_games";
  }, [userData?._id]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, [storageKey]);

  const toggleFavorite = useCallback(
    (gameId, e) => {
      if (e) e.stopPropagation();
      if (!gameId) return;
      setFavorites((prev) => {
        const updated = prev.includes(gameId)
          ? prev.filter((id) => id !== gameId)
          : [...prev, gameId];
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {
          console.error("Failed to save favorites", err);
        }
        return updated;
      });
    },
    [storageKey],
  );

  const [sections, setSections] = useState([]);

  const recentStorageKey = useMemo(() => {
    return userData?._id
      ? `raftaar_recent_${userData._id}`
      : "raftaar_recent_played";
  }, [userData?._id]);

  const [recentPlayed, setRecentPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem(recentStorageKey);
      return saved ? JSON.parse(saved) : defaultRecent;
    } catch {
      return defaultRecent;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(recentStorageKey);
      setRecentPlayed(saved ? JSON.parse(saved) : defaultRecent);
    } catch {
      setRecentPlayed(defaultRecent);
    }
  }, [recentStorageKey]);

  const findGameById = useCallback(
    (gameId) => {
      let found = recentPlayed.find((g) => g.gameId === gameId);
      if (found) return found;

      found = defaultRecent.find((g) => g.gameId === gameId);
      if (found) return found;

      for (const section of sections) {
        found = (section.games || []).find((g) => g.gameId === gameId);
        if (found) return found;
      }
      return null;
    },
    [recentPlayed, sections],
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const signupUser = useSelector(isSignupUser());

  const cricketMatches = useSelector(
    (state) => state.matches.cricket.matches.data,
  );
  const tennisMatches = useSelector(
    (state) => state.matches.tennis.matches.data,
  );
  const soccerMatches = useSelector(
    (state) => state.matches.soccer.matches.data,
  );

  const liveMatches = [
    ...getInPlayMatches(cricketMatches),
    ...getInPlayMatches(tennisMatches),
    ...getInPlayMatches(soccerMatches),
  ];

  const handlePlayClick = async (gameId) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (loginType === "") {
      navigate(`/login`);
      setIsProcessing(false);
      return;
    } else if (loginType === "demo") {
      toast.error("login with real id");
      setIsProcessing(false);
      return;
    }

    let amount = userData?.availableBalance - userData?.exposure || 0;
    let siteCasinoBalance = siteCasinoData?.casinoBalance || 0;
    let finalAmountToDeduct = Math.min(amount, siteCasinoBalance);

    if (
      finalAmountToDeduct === 0 &&
      (!userData?.casinoBalance || userData?.casinoBalance <= 0)
    ) {
      toast.warning("Insufficient balance");
      setIsProcessing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await updateCasinoBalance({
        CasinoBalance: finalAmountToDeduct,
      });
      const gameInfo = findGameById(gameId);
      if (gameInfo) {
        setRecentPlayed((prev) => {
          const filtered = prev.filter((g) => g.gameId !== gameId);
          const updated = [gameInfo, ...filtered];
          try {
            localStorage.setItem(recentStorageKey, JSON.stringify(updated));
          } catch (err) {
            console.error("Failed to save recently played", err);
          }
          return updated;
        });
      }
      dispatch(updateAvailableBalance(response.data.user.availableBalance));
      dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
    } catch (error) {
      console.error("error", error.response?.data?.message);
    } finally {
      setLoading(false);
    }

    const data = {
      gameId: gameId,
      playerId: userData?._id || "",
      displayName: userData?.casinoDisplayName || "",
      currency: "INR",
      country: "IN",
      gender: "M",
      birthDate: "1996-10-12",
      mode: isLoggedIn ? "real" : "demo",
      device: isMobile ? "mobile" : "desktop",
      returnUrl: window.location.href,
      walletSessionId: userData?.sessionToken || "",
    };

    try {
      const res = await launcherUrl(data);
      if (res?.success && res?.data?.url) {
        const gameUrl = encodeURIComponent(res.data.url);
        navigate(`/game-lobby?gameId=${gameUrl}`);
      } else {
        console.error("Launcher URL request failed", res);
      }
    } catch (error) {
      console.error(
        "Error launching Aviator:",
        error?.response?.data?.message || error.message,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const [stakes, setStakes] = useState([
    { id: 1, buttonValue: "100" },
    { id: 2, buttonValue: "500" },
    { id: 3, buttonValue: "1000" },
    { id: 4, buttonValue: "5000" },
    { id: 5, buttonValue: "10000" },
    { id: 6, buttonValue: "50000" },
  ]);

  useEffect(() => {
    const savedStakes = localStorage.getItem("stakes");
    if (savedStakes) {
      setStakes(JSON.parse(savedStakes));
    } else {
      localStorage.setItem("stakes", JSON.stringify(stakes));
    }
  }, []);

  const fetchSections = useCallback(async () => {
    // ------------------------------------
    // 1. MEMORY CACHE -> INSTANT RENDER
    // ------------------------------------
    if (gameSectionsMemoryCache?.data?.length) {
      setSections(gameSectionsMemoryCache.data);

      // Refresh in background only when cache is stale.
      const age = Date.now() - (gameSectionsMemoryCache.timestamp || 0);

      if (age < GAME_SECTIONS_CACHE_TTL) {
        return;
      }

      try {
        const freshSections = await fetchGameSectionsCached({
          background: true,
        });

        if (freshSections) {
          setSections(freshSections);
        }
      } catch (error) {
        console.error("background game sections refresh error:", error);
      }

      return;
    }

    // ------------------------------------
    // 2. LOCAL STORAGE CACHE -> INSTANT UI
    // ------------------------------------
    const cached = readGameSectionsCache();

    if (cached?.data?.length) {
      gameSectionsMemoryCache = cached;
      setSections(cached.data);

      // Do NOT block the page for API/presigned URLs.
      // Refresh in background if cache is old.
      const age = Date.now() - (cached.timestamp || 0);

      if (age < GAME_SECTIONS_CACHE_TTL) {
        return;
      }

      try {
        const freshSections = await fetchGameSectionsCached({
          background: true,
        });

        if (freshSections) {
          setSections(freshSections);
        }
      } catch (error) {
        console.error("background game sections refresh error:", error);
      }

      return;
    }

    // ------------------------------------
    // 3. FIRST EVER LOAD
    // ------------------------------------
    setLoading(true);

    try {
      const freshSections = await fetchGameSectionsCached();

      if (freshSections) {
        setSections(freshSections);
      }
    } catch (err) {
      console.error("getGameSections error:", err);

      toast.error(err?.response?.data?.message || "Failed to load sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await fetchSections();

        // Guard against setting state after unmount/navigation.
        if (cancelled) return;
      } catch (error) {
        if (!cancelled) {
          console.error("fetchSections error:", error);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchSections]);

  const topGamesSection = sections.find((s) => FIXED_TITLES.includes(s.title));
  const dynamicSections = sections.filter(
    (s) => !FIXED_TITLES.includes(s.title),
  );

  return (
    <div className="min-h-screen bg-[#04101f] pb-[80px] -mb-[100px]">
      <Header />
      <div className="h-[52px]" />

      {signupUser && (
        <div className="relative w-full h-[36px] overflow-hidden  shadow-md">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 36"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="green" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#008d42" />
                <stop offset="100%" stopColor="#11c862" />
              </linearGradient>
              <linearGradient id="red" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d90000" />
                <stop offset="100%" stopColor="#ff2626" />
              </linearGradient>
              <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <polygon points="0,0 516,0 500,36 0,36" fill="url(#green)" />
            <circle
              cx="70"
              cy="35"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="8"
            />
            <circle
              cx="220"
              cy="-10"
              r="100"
              fill="none"
              stroke="rgba(255,255,255,.06)"
              strokeWidth="8"
            />
            <path
              d="M0 30 Q120 8 250 25 T520 18"
              fill="none"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="2"
            />
            <polygon points="500,0 1000,0 1000,36 484,36" fill="url(#red)" />
            <circle
              cx="820"
              cy="-10"
              r="100"
              fill="none"
              stroke="rgba(255,255,255,.06)"
              strokeWidth="8"
            />
            <circle
              cx="970"
              cy="35"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="8"
            />
            <path
              d="M520 15 Q700 28 860 12 T1000 22"
              fill="none"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="2"
            />
            <rect x="0" y="0" width="1000" height="16" fill="url(#gloss)" />
            <polygon points="499,0 501,0 486,36 484,36" fill="#fff" />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />

          <div className="relative z-10 flex h-full">
            <button
              onClick={() => navigate("/deposit")}
              className="flex-1 flex items-center justify-between px-3 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-green-600 flex items-center justify-center shadow">
                  <FaRupeeSign className="text-green-600" size={15} />
                </div>
                <div className="w-px h-5 bg-white/30" />
                <span className="text-[11px] font-sans font-bold tracking-wide">
                  Deposit
                </span>
              </div>
              <FaChevronRight size={12} />
            </button>

            <button
              onClick={() => navigate("/withdraw")}
              className="flex-1 flex items-center justify-between px-3 pl-6 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-red-600 flex items-center justify-center shadow">
                  <FaRupeeSign className="text-red-600" size={15} />
                </div>
                <div className="w-px h-5 bg-white/30" />
                <span className="text-[11px] font-sans font-bold tracking-wide">
                  Withdrawal
                </span>
              </div>
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="px-1.5 mt-1.5">
        <div className="rounded-[16px] overflow-hidden border border-[#1c2c4a] shadow-md relative banner-swiper">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2500 }}
            pagination={{ clickable: true }}
            loop
          >
            {banner.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} className="w-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        .banner-swiper .swiper-pagination { bottom: 8px !important; }
        .banner-swiper .swiper-pagination-bullet {
          width: 6px; height: 6px; background: rgba(255, 255, 255, 0.5); opacity: 1;
        }
        .banner-swiper .swiper-pagination-bullet-active {
          width: 16px; border-radius: 4px; background: #3ee06a;
        }
      `}</style>

      <div>
        <TopGamesSection
          title={topGamesSection?.title || "Top Games"}
          icon={topGamesSection?.icon}
          data={topGamesSection?.games || []}
          onGameClick={handlePlayClick}
          onViewAll={() => navigate(`/int-casino`)}
        />

        <Section
          title="Recently Played"
          data={recentPlayed}
          icon={<FaAward size={22} className="text-[#e5e4e4]" />}
          onGameClick={handlePlayClick}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          isScrollable={true}
        />

        <div
          className="bg-[#000a1e] p-2 mt-1 border-t border-[#165b80] flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {liveMatches.length > 0 ? (
            liveMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))
          ) : (
            <div className="text-[#7d93b3] font-sans text-[13px] py-6 px-2">
              No live matches right now
            </div>
          )}
        </div>

        {dynamicSections.map((section) => {
          const totalGames = section.games?.length || 0;

          return (
            <Section
              key={section._id}
              title={section.title}
              data={section.games || []}
              icon={section.icon}
              totalGames={totalGames}
              onGameClick={handlePlayClick}
              onViewAll={() =>
                navigate(
                  `/casino-section/${encodeURIComponent(section.title)}`,
                )
              }
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          );
        })}

        {/* Footer */}
        <Footer />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav active="home" />
      </div>
    </div>
  );
};

export default Home;

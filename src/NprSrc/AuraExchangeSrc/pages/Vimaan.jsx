
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import CasinoHeader from "../components/Header/CasinoHeader";
import MobileBottomNavbar from "../components/Header/MobileBottomNavbar";
import HistoryBar from "../components/VimaanC/HistoryBar";
import AviatorCanvas from "../components/VimaanC/AviatorCanvas";
import BettingPanel from "../components/VimaanC/BettingPanel";
import LiveBetsList from "../components/VimaanC/LiveBetsList";
import { selectSiteHeaderColor } from "../../../utils/helper/commonSelectors";
import { audioService } from "../services/audioService";
import { GameProvider } from "../context/GameContext";
import "../index.css";

export default function Vimaan() {
  const [initialLoading, setInitialLoading] = useState(true);
  const headerColor = useSelector(selectSiteHeaderColor());
  const topSectionRef = useRef(null);
  const [topHeight, setTopHeight] = useState(420);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    return () => {
      clearTimeout(timer);
      audioService?.stopAll?.();
    };
  }, []);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (topSectionRef.current) {
        setTopHeight(topSectionRef.current.offsetHeight);
      }
    };
    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });
    if (topSectionRef.current) {
      ro.observe(topSectionRef.current);
    }
    window.addEventListener("resize", updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <GameProvider>
      {/* Exact Universe Casino Full Screen Loader matching Image 1 */}
      {initialLoading && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black w-screen h-screen">
          <img
            src="/casino/universe.gif"
            alt="universe"
            className="h-[220px] w-[220px] object-contain"
          />
        </div>
      )}
      <div className="vimaan-root h-screen h-[100dvh] bg-[#0e0e0e] text-[#bbbfc5] font-['Inter',sans-serif] overflow-hidden">
        {/* Top Fixed Section: Header + HistoryBar + AviatorCanvas (Image 1 - Position Fixed, Never Scrolls) */}
        <div
          ref={topSectionRef}
          className="w-full fixed top-0 left-0 right-0 z-40 bg-[#0e0e0e]"
        >
          {/* Aura Casino Header with Rules, GAMING LOBBY, Live Balance & Exposure */}
          <CasinoHeader headerColor={headerColor} />
          {/* Spacer for 56px fixed CasinoHeader so HistoryBar is placed right below it */}
          <div className="h-[56px] w-full shrink-0" />

          {/* Canvas Section */}
          <div className="w-full max-w-[1600px] mx-auto px-2 md:px-3 pt-1">
            <HistoryBar />
            <AviatorCanvas />
          </div>
        </div>

        {/* Bottom Scrollable Section: BettingPanel + LiveBetsList (Image 2 - Independent scroller, white scrollbar) */}
        <div
          className="fixed left-0 right-0 overflow-y-scroll vimaan-bottom-scroller bg-[#0e0e0e]"
          style={{
            top: topHeight > 0 ? `${topHeight}px` : "420px",
            bottom: "56px",
          }}
        >
          <div className="w-full max-w-[1600px] mx-auto px-2 md:px-3 pt-2 pb-6">
            <div className="flex flex-col lg:flex-row gap-3 font-['Inter']">
              {/* Double Betting Controls Panel */}
              <div id="marketScroll" className="flex-1 flex flex-col order-1 lg:order-2 min-w-0">
                <BettingPanel />
              </div>

              {/* Live Online Bets */}
              <div className="w-full lg:w-[320px] min-[1280px]:w-[380px] shrink-0 order-2 lg:order-1">
                <LiveBetsList />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Footer (MobileBottomNavbar) matching user screenshot */}
        <div className="w-full fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNavbar />
        </div>
      </div>
    </GameProvider>
  );
}

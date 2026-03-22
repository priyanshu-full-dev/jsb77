import React, { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector } from "react-redux";

const OpenBets = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [expandedMarket, setExpandedMarket] = useState(null);

  const { bets } = useSelector((state) => state.bets);

  /* ---------------- LOADER ---------------- */
  const isLoading = !bets;

  /* ---------------- UNIQUE MARKETS (Match Odds First) ---------------- */
  const uniqueMarkets = [...new Set(bets?.map((b) => b.market))].sort(
    (a, b) => {
      if (a?.toLowerCase() === "match odds") return -1;
      if (b?.toLowerCase() === "match odds") return 1;
      return a.localeCompare(b);
    },
  );

  /* ---------------- DEFAULT TAB ---------------- */
  useEffect(() => {
    if (uniqueMarkets.length && !activeTab) {
      const matchOdds =
        uniqueMarkets.find((m) => m?.toLowerCase() === "match odds") ||
        uniqueMarkets[0];

      setActiveTab(matchOdds);
    }
  }, [bets]);

  /* ---------------- GROUP ---------------- */
  const groupBetsByEventAndMarket = (bets) => {
    const grouped = {};

    bets?.forEach((bet) => {
      if (!grouped[bet.eventId]) {
        grouped[bet.eventId] = {
          event: bet.event,
          markets: {},
        };
      }

      if (!grouped[bet.eventId].markets[bet.market]) {
        grouped[bet.eventId].markets[bet.market] = [];
      }

      grouped[bet.eventId].markets[bet.market].push(bet);
    });

    return grouped;
  };

  /* ---------------- FILTER ---------------- */
  const filteredBets = bets?.filter((b) => b.market === activeTab);
  const groupedBets = groupBetsByEventAndMarket(filteredBets);

  /* ---------------- TOGGLES ---------------- */
  const toggleEvent = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
    setExpandedMarket(null);
  };

  const toggleMarket = (key) => {
    setExpandedMarket(expandedMarket === key ? null : key);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-end px-2">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="relative z-[2] w-full md:w-[420px]">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute text-[13px] right-0 top-[-118px] h-[50px] bg-[#2c2c2c] text-white px-4  rounded-lg flex items-center gap-1 shadow-lg"
        >
          <p className="flex items-center gap-1 -mt-5">
            {" "}
            CLOSE <IoCloseSharp size={18} />
          </p>
        </button>

        {/* BOX */}
        <div className="relative bottom-[90px] bg-[#1a1a1a] pt-3 rounded-xl overflow-hidden shadow-2xl">
          <div className="h-[400px] bg-white">
            {/* HEADER */}
            <h2 className="text-center font-extrabold text-[22px] py-3  e">
              MATCHED BETS
            </h2>
          <div className="flex mx-3 mt-2 rounded overflow-x-auto text-[12px] font-bold border">
  {uniqueMarkets.map((market, index) => (
    <button
      key={market}
      onClick={() => setActiveTab(market)}
      className={`px-4 py-2 uppercase whitespace-nowrap flex-shrink-0 transition
        ${
          activeTab === market
            ? "bg-green-700 text-white"
            : "bg-white text-black"
        }
        ${index !== uniqueMarkets.length - 1 ? "border-r border-gray-300" : ""}
      `}
    >
      {market}
    </button>
  ))}
</div>
            {/* LIST */}
            <div className="h-[320px] overflow-y-auto px-3 mt-2 pb-8 space-y-2">
              {/* LOADER */}
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                </div>
              ) : Object.keys(groupedBets).length === 0 ? (
                <p className="text-center mt-10 text-gray-500">No Bets Found</p>
              ) : (
                Object.entries(groupedBets).map(
                  ([eventId, { event, markets }]) => (
                    <div
                      key={eventId}
                      className=" overflow-hidden border shadow-sm"
                    >
                      {/* EVENT */}
                      <div
                        onClick={() => toggleEvent(eventId)}
                        className="bg-[#111] text-white px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                      >
                        <span className="text-[13px] font-semibold truncate">
                          {event}
                        </span>
                        <span className="text-xs">
                          {expandedEventId === eventId ? "▲" : "▼"}
                        </span>
                      </div>

                      {/* MARKETS */}
                      {expandedEventId === eventId &&
                        Object.entries(markets).map(([market, marketBets]) => {
                          const key = `${eventId}-${market}`;

                          return (
                            <div key={market}>
                              {/* MARKET */}
                              <div
                                onClick={() => toggleMarket(key)}
                                className="bg-gray-100 px-3 py-1 flex justify-between text-[12px] cursor-pointer border-t hover:bg-gray-200"
                              >
                                <span className="font-semibold">{market}</span>
                                <span>
                                  {expandedMarket === key ? "▲" : "▼"}
                                </span>
                              </div>

                              {/* BETS */}
                              {expandedMarket === key &&
                                marketBets.map((bet) => (
                                  <div
                                    key={bet._id}
                                    className="px-3 py-2 border-t text-[12px]"
                                    style={{
                                      backgroundColor:
                                        bet.type === "Lay"
                                          ? "#ffa0d0"
                                          : "#8ec5fe",
                                    }}
                                  >
                                    {/* ROW 1 */}
                                    <div className="flex justify-between">
                                      <span className="font-bold truncate">
                                        {bet.selection}
                                      </span>
                                      <span className="font-bold">
                                        {bet.type}
                                      </span>
                                    </div>

                                    {/* ROW 2 */}
                                    <div className="flex justify-between mt-1">
                                      <span>Odds: {bet.price}</span>
                                      <span>Stake: ₹{bet.againstMargin}</span>
                                    </div>

                                    {/* ROW 3 */}
                                    <div className="flex justify-between mt-1">
                                      <span>P/L:</span>
                                      <span className="font-bold text-green-700">
                                        {bet.favourMargin}
                                      </span>
                                    </div>

                                    {/* TIME */}
                                    <div className="text-[10px] mt-1 text-black/70">
                                      {new Date(
                                        bet.placeTime,
                                      ).toLocaleTimeString()}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </div>

        {/* POINTER */}
        <div className="absolute bottom-[63px] right-[16%]">
          <img src="/dwonAR.png" alt="" className="w-[90px]" />
        </div>
      </div>
    </div>
  );
};

export default OpenBets;

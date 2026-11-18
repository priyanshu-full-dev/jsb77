import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { useDispatch, useSelector } from "react-redux";

import { useGradientColor } from "../../hooks/useThemeColors";
import { subscribeToJoinMyBets } from "../../../../socketClient";

const OpenBets = ({ openSide, closeBets }) => {

  const [expandedEventId, setExpandedEventId] = useState(null); // Track expanded event by eventId
  const { bets } = useSelector((state) => state.bets);

  const gradiantcolor = useGradientColor();

  // Group bets by eventId and then by market
  const groupBetsByEventAndMarket = (bets) => {
    const grouped = bets.reduce((acc, bet) => {
      const { eventId, market } = bet;
      if (!acc[eventId]) {
        acc[eventId] = { event: bet.event, markets: {} };
      }
      if (!acc[eventId].markets[market]) {
        acc[eventId].markets[market] = [];
      }
      acc[eventId].markets[market].push(bet);
      return acc;
    }, {});
    return grouped;
  };

  const groupedBets = groupBetsByEventAndMarket(bets);

  const handleEventClick = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    subscribeToJoinMyBets();
    return () => {};
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-[9999999] overflow-y-auto transition-all duration-100 ${
        openSide === "bets" ? "w-full" : "w-0"
      } bg-light-bg dark:bg-dark-bg text-light-bg dark:text-dark-bg`}
    >
      <div
        className="w-full h-[35px] flex items-center justify-between pl-[5px]"
        style={{
          background: gradiantcolor,
        }}
      >
        <div className="flex items-center gap-[0px]">
          {/* <CircleDollarSign className="mr-1 text-white" size={18} /> */}
          <h4 className="font-sans font-bold text-[16px] text-white">
            Open Bets
          </h4>
        </div>
        <div
          className="border-l-2 border-[#ffb200]/30 h-[35px] w-[35px] flex items-center justify-center"
          onClick={closeBets}
        >
          <IoMdClose className="text-[18px] text-white" />
        </div>
      </div>

      <ul>
        {Object.keys(groupedBets).length > 0 ? (
          Object.entries(groupedBets).map(([eventId, { event, markets }]) => (
            <div key={eventId}>
              <li
                onClick={() => handleEventClick(eventId)}
                className={`bg-light-bg dark:bg-dark-bg text-[#2789ce] text-[12px] font-bold leading-[1.6] py-[2.1333333333vw] px-[2.6666666667vw] pl-[23px] font-helvetica border-b border-[#536f83] relative flex items-center before:content-[''] before:absolute before:w-[2.6666666667vw] before:h-[2.6666666667vw] before:rounded-full before:bg-[#c5d0d8] before:border before:border-[#333333]/40 before:mr-[1.3333333333vw] before:left-[7px] w-full cursor-pointer ${
                  expandedEventId === eventId ? "bg-gray-100" : ""
                }`}
              >
                {event}
                <div className="w-7 h-7 border-2 border-gray-950 dark:border-light-bg rounded-sm flex items-center justify-center absolute right-2">
                  <svg
                    className="w-4 h-4 text-gray-950 dark:text-light-bg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        expandedEventId === eventId
                          ? "M19 9l-7 7-7-7"
                          : "M9 5l7 7-7 7"
                      }
                    />
                  </svg>
                </div>
              </li>
              {expandedEventId === eventId && (
                <div className="OpenBets-sub bg-gray-100 px-2 py-2">
                  {Object.entries(markets).map(([market, marketBets]) => (
                    <div key={market}>
                      <div className="bg-gradient-to-t from-[#243a48] to-[#2e4b5e] text-[2.7333333333vw] text-white leading-[2.2] pl-[5px] font-bold">
                        <p>
                          {market === "Premium Cricket"
                            ? "Sports Book"
                            : market}
                        </p>
                      </div>
                      {marketBets.map((bet, index) => (
                        <div
                          key={bet._id}
                          className="w-full rounded-[6px] font-arial text-black"
                        >
                          <div className="flex">
                            <div
                              className={`flex w-[45%] text-[#3b5160] gap-[20px] text-[12px] p-[2px_5px] ${
                                bet.type === "Lay"
                                  ? "bg-[#f7e7eb]"
                                  : "bg-[#d2e7f7]"
                              }`}
                            >
                              {/* <p>Ref: {bet.matchId}</p> */}
                              <p>{formatDate(bet.placeTime)}</p>
                            </div>
                            <div
                              className={`w-[55%]  ${
                                bet.type === "Lay"
                                  ? "bg-[#f7e7eb]"
                                  : "bg-[#d2e7f7]"
                              }`}
                            >
                              <div className="flex  text-[12px] font-bold text-[#333] justify-between">
                                <span className="px-1 min-w-[45px]">Odds</span>
                                <span className="px-1 min-w-[40px]">Stake</span>
                                <span className="px-1">{`Profit (Liability)`}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`flex justify-between bg-[#beddf4] border-b border-[#7da7c6] py-[5px] ${
                              bet.type === "Lay"
                                ? "bg-[#f3dce2] border-b-[#d38e9c]"
                                : ""
                            }`}
                          >
                            <div className="flex gap-[10px] items-center w-[45%]">
                              <button
                                className={`text-black text-[12px] border-none w-[11vw] leading-[6.5vw] ml-1 rounded-[1.0666666667vw] cursor-pointer ${
                                  bet.type === "Lay"
                                    ? "bg-[#faa9ba]"
                                    : "bg-[#72bbef]"
                                }`}
                              >
                                {bet.type}
                              </button>
                              <span className="text-[2.5vw] font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                                {bet.selection}
                              </span>
                            </div>

                            <div className="flex w-[55%] justify-between items-center">
                              <span className="text-[12px] px-1 min-w-[45px]">
                                {bet.market === "Fancy"
                                  ? `${bet?.price}/${bet.size}`
                                  : parseFloat(bet?.oddsReq)}
                              </span>
                              <span className="text-[12px] text-center px-1 min-w-[40px]">
                                {parseFloat(bet?.stake)}
                              </span>
                              <span className="text-[12px] px-1 min-w-[104px]">{`${parseFloat(bet?.favourMargin)} (-${parseFloat(bet?.againstMargin)})`}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-[12px] text-black dark:text-white mt-4">
            No bets available
          </div>
        )}
      </ul>
    </div>
  );
};

export default OpenBets;

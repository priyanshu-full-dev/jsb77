import React from "react";

const Card = ({ gameId, data }) => {
  const t2 = Array.isArray(data) ? data : data?.data?.t2 || [];
  if (!t2.length) return null;

  const roundId = t2[0]?.mid;

  const leftOrder = ["0 Runs", "2 Runs", "4 Runs", "Wicket"];
  const rightOrder = ["1 Runs", "3 Runs", "6 Runs", "Extra Runs"];

  const sortByOrder = (list, order) =>
    order
      .map((nation) =>
        list.find(
          (item) => item.nation.toLowerCase() === nation.toLowerCase()
        )
      )
      .filter(Boolean);

  const leftSide = sortByOrder(t2, leftOrder);
  const rightSide = sortByOrder(t2, rightOrder);

  // background per nation
  const getGradient = (nation) => {
    const n = nation.toLowerCase();

    if (n.includes("wicket"))
      return "linear-gradient(to bottom, #d84848, #ff7a7a, #d84848)";
    if (n.includes("4"))
      return "linear-gradient(to bottom, #3fb36b, #6bdc95, #3fb36b)";
    if (n.includes("6"))
      return "linear-gradient(to bottom, #8b97ff, #a8bdff, #7173fc)";

    // Default Yellow (0,1,2,3,Extra Runs)
    return "linear-gradient(to bottom, #c9bf34, #f7eb4c, #c9bf34)";
  };

  return (
    <div
      className="w-full pb-4 mt-2"
      style={{
        background: "linear-gradient(90deg, #c7f1ce 0%, #e1f8ff 100%)",
      }}
    >
      {/* TOP BAR */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background:
            "linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)",
          color: "#FFFFFF",
        }}
      >
        <p className="text-[16px] font-bold">Runs</p>
        <p className="text-[12px]">{roundId}</p>
      </div>

      {/* BACK | BACK */}
      <div className="grid grid-cols-2 text-center bg-[#f2f2f2] border-b border-gray-300">
        <div className="py-2 font-bold border-r border-gray-300">Back</div>
        <div className="py-2 font-bold">Back</div>
      </div>

      {/* MAIN GRID */}
      <div className="relative grid grid-cols-2 gap-x-4 px-3 py-3">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />

        {/* LEFT SIDE */}
        <div className="flex flex-col gap-3 pr-2">
          {leftSide.map((item) => (
            <div
              key={item.sid}
              className="flex shadow-md overflow-hidden px-2"
              style={{
                background: getGradient(item.nation),
                borderRadius: "10px",
                minHeight: "65px",
              }}
            >
              {/* LEFT STATS */}
              <div className="flex flex-col justify-center py-1 min-w-[55px]">
                <span className="font-bold text-[15px]">{item.b1}</span>
                <span className=" text-[11px]">{item.max}</span>
              </div>

              {/* MIDDLE dashed */}
              <div className="self-stretch border-l-4 border-dashed border-black mx-1" />

              {/* LABEL */}
              <div className="flex-1 flex items-center justify-center px-1">
                <span className="font-bold text-[16px] text-center">
                  {item.nation.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-3 pl-2">
          {rightSide.map((item) => (
            <div
              key={item.sid}
              className="flex shadow-md overflow-hidden px-2"
              style={{
                background: getGradient(item.nation),
                borderRadius: "10px",
                minHeight: "65px",
              }}
            >
              <div className="flex flex-col justify-center py-1 min-w-[55px]">
                <span className="font-bold text-[15px]">{item.b1}</span>
                <span className=" text-[11px]">{item.max}</span>
              </div>

              <div className="self-stretch border-l-4 border-dashed border-black mx-1" />

              <div className="flex-1 flex items-center justify-center px-1">
                <span className="font-bold text-[16px] text-center">
                  {item.nation.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Card;

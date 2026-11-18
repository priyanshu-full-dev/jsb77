import React, { useState } from "react";
import TeenpattiContent from "./TeenpattiContent";

const rules = [
  { title: "20-20 TEENPATTI", content: <TeenpattiContent /> },
  { title: "VIMAAN", content: <p className="p-4">No Rules Found!</p> },
  { title: "BALLOON", content: <p className="p-4">No Rules Found!</p> },
  { title: "BACCARAT", content: <img src="/aura/img7.png" alt="BACCARAT" /> },
  { title: "EVOLUTION", content: <p className="p-4">No Rules Found!</p> },
  {
    title: "20-20 DRAGON TIGER",
    content: <img src="/aura/dt20rules.png" alt="20-20 Dragon Tiger" /> ,
  },
  {
    title: "LUCKY 7 - A",
    content: <img src="/aura/img8.png" alt="BACCARAT" />,
  },
  { title: "ANDAR BAHAR - A", content: <p className="p-4">No Rules Found!</p> },
  { title: "32 CARDS - A", content: <p className="p-4">No Rules Found!</p> },
  {
    title: "20-20 DRAGON TIGER LION",
    content: <img src="/aura/dtl20rules.webp" alt="20-20 Dragon Tiger Lion" /> ,
  },
];

const CasinoRules = ({ onClose }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleRule = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-[calc(100vh-56px)] bg-black font-sans overflow-auto">
      {/* Header */}
      <div
        className="flex fixed top-0 left-0 justify-between items-center p-2 h-[40px] sticky top-0 z-10"
        style={{
          background: "linear-gradient(#A4DC60 0%, #4F9F21 100%)",
        }}
      >
        <h2 className="text-black font-bold text-lg">Rules List</h2>
        <button className="text-black font-bold text-[33px]" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Rules List */}
      <div className="flex flex-col gap-2 pt-4">
        {rules.map((rule, index) => (
          <div key={index}>
            {/* Title */}
            <div
              className="w-[94%] mx-auto leading-[1.5] capitalize text-white text-[15px] border-b border-[#dcdcdc] font-[500] transition-all duration-300 rounded-[12px] shadow-[inset_0_0_8px_#ffff28] p-3"
              onClick={() => toggleRule(index)}
            >
              <span>{rule.title}</span>
            </div>

            {/* Content */}
            {openIndex === index && (
              <div className="w-[96%] mx-auto  text-sm bg-white mt-2">
                {rule.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasinoRules;

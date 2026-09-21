import React, { useState } from 'react';
import { X } from 'lucide-react';

const BONUS_RULES_LIST = [
  {
    id: 'general',
    title: 'General',
    content: 'No Rules Found',
  },
  {
    id: 'registration',
    title: 'Registration Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'first_deposit',
    title: 'First Deposit Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'every_deposit',
    title: 'Every Deposit Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'refer_earn',
    title: 'Refer And Earn Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'welcome',
    title: 'Welcome Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'affiliate',
    title: 'Affiliate Bonus',
    content: 'No Rules Found',
  },
  {
    id: 'next_4_refer',
    title: 'Next 4 Refer And Earn Bonus',
    content: 'No Rules Found',
  },
];

export default function BonusRulesModal({ isOpen, onClose }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!isOpen) return null;

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center pt-6 sm:pt-10 px-3 pb-24 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-[6px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-2 flex items-center justify-between border-b border-gray-100 bg-white">
          <h3 className="font-bold text-[20px] text-black tracking-tight">
            Bonus Rules
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
            title="Close"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body - Expandable Accordion List */}
        <div className="p-3.5 flex flex-col gap-2 max-h-[68vh] overflow-y-auto custom-scrollbar bg-white">
          {BONUS_RULES_LIST.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="w-full rounded-[3px] overflow-hidden bg-[#f4f4f4] transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-4 py-2 flex items-center justify-between text-left cursor-pointer hover:bg-[#ebebeb] transition-colors"
                >
                  <span className="font-semibold text-[15.5px] text-black tracking-tight">
                    {item.title}
                  </span>
                  <div className="shrink-0 flex items-center justify-center text-black">
                    {isExpanded ? (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        className="w-[18px] h-[18px]"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M147.6 301.3c-7.5-7.5-7.5-19.8 0-27.3l95.7-95.4c7.3-7.3 19.1-7.5 26.6-.6l94.3 94c3.8 3.8 5.7 8.7 5.7 13.7 0 4.9-1.9 9.9-5.6 13.6-7.5 7.5-19.7 7.6-27.3 0l-81-79.8-81.1 81.9c-7.5 7.5-19.7 7.5-27.3-.1z" />
                        <path d="M256 464c114.9 0 208-93.1 208-208S370.9 48 256 48 48 141.1 48 256s93.1 208 208 208zm0-32c-47 0-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256s18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432z" />
                      </svg>
                    ) : (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        className="w-[18px] h-[18px]"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M147.6 210.7c-7.5 7.5-7.5 19.8 0 27.3l95.7 95.4c7.3 7.3 19.1 7.5 26.6.6l94.3-94c3.8-3.8 5.7-8.7 5.7-13.7 0-4.9-1.9-9.9-5.6-13.6-7.5-7.5-19.7-7.6-27.3 0l-81 79.8-81.1-81.9c-7.5-7.5-19.7-7.5-27.3.1z" />
                        <path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm332.4-124.4C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256s18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-white text-center text-neutral-800 font-medium text-[13.5px] border-t border-gray-200">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState('general');

  if (!isOpen) return null;

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-[10px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Gold Accent Underline */}
        <div className="px-4 py-3 flex items-center justify-between border-b-[1.5px] border-[#cca24b] bg-white">
          <h3 className="font-extrabold text-[18px] text-black tracking-tight">
            Bonus Rules
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Modal Body - Expandable Accordion List */}
        <div className="p-3 sm:p-3.5 flex flex-col gap-2 max-h-[72vh] overflow-y-auto custom-scrollbar bg-white">
          {BONUS_RULES_LIST.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="w-full rounded-[6px] overflow-hidden bg-[#f0f2f5] transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#e4e7eb] transition-colors"
                >
                  <span className="font-bold text-[14px] text-neutral-900 tracking-tight">
                    {item.title}
                  </span>
                  <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-gray-800 shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={14} strokeWidth={2.5} />
                    ) : (
                      <ChevronDown size={14} strokeWidth={2.5} />
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

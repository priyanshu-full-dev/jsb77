import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";

const DepositModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
      setSuccess(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickAmounts = [100, 500, 1000, 5000, 10000, 50000];

  const handleAddAmount = (val) => {
    const current = parseInt(amount, 10) || 0;
    const next = current + val;
    setAmount(next.toString());
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!num || isNaN(num)) {
      setError("Please enter a valid amount");
      return;
    }
    if (num < 100) {
      setError("Minimum deposit amount is ₹100");
      return;
    }
    if (num > 200000) {
      setError("Maximum deposit amount is ₹200,000");
      return;
    }

    setError("");
    setSuccess(true);
    setTimeout(() => {
      alert(`Deposit request for ₹${num} submitted successfully!`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#151822] rounded-xl shadow-2xl border border-red-900/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#6e081d] to-[#c10931] text-white">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="19"
              viewBox="0 0 21 19"
              fill="none"
              stroke="#ffffff"
            >
              <path
                d="M3.62143 4.52979C3.52275 4.52988 3.42507 4.54945 3.33397 4.58737C3.24287 4.62528 3.16014 4.68079 3.09054 4.75074C3.02094 4.82068 2.96584 4.90368 2.92837 4.99496C2.8909 5.08624 2.87181 5.18402 2.8722 5.28269C2.8724 5.48134 2.95139 5.67179 3.09185 5.81225C3.23232 5.95271 3.42278 6.03171 3.62143 6.03191H16.6423C17.4549 6.03191 18.0115 6.5801 18.0115 7.19078V8.50099C18.0111 8.59998 18.0303 8.69805 18.068 8.78958C18.1057 8.8811 18.1612 8.96425 18.2312 9.03424C18.3012 9.10424 18.3843 9.15969 18.4758 9.19739C18.5674 9.23508 18.6654 9.25429 18.7644 9.2539C18.8631 9.2538 18.9608 9.23424 19.0519 9.19632C19.143 9.1584 19.2257 9.10288 19.2953 9.03293C19.3649 8.96299 19.42 8.87999 19.4575 8.78871C19.4949 8.69743 19.514 8.59966 19.5136 8.50099V7.19078C19.5136 5.6859 18.1796 4.52979 16.6423 4.52979H3.62143Z"
                fill="#ffffff"
              ></path>
              <path
                d="M16.6606 7.75177C15.5639 7.75177 14.6603 8.65906 14.6603 9.75583V11.2579C14.6603 12.3547 15.5639 13.262 16.6606 13.262H18.7459C19.8427 13.262 20.75 12.3547 20.75 11.2579V9.75583C20.75 8.65906 19.8427 7.75177 18.7459 7.75177H16.6606ZM16.6606 9.25389H18.7459C19.032 9.25389 19.2478 9.46966 19.2478 9.75583V11.2579C19.2478 11.5441 19.032 11.7599 18.7459 11.7599H16.6606C16.3745 11.7599 16.1587 11.5441 16.1587 11.2579V9.75583C16.1587 9.46966 16.3745 9.25389 16.6606 9.25389Z"
                fill="#ffffff"
              ></path>
            </svg>
            <h3 className="font-lato font-bold text-base tracking-wide uppercase">
              Deposit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 transition-colors text-white"
            aria-label="Close"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Modal Body - User's exact markup */}
        <div className="mx-2 pb-3">
          <div className="w-full mt-2.5 py-[15px] rounded-lg bg-bg_Quaternary px-3">
            <div className="font-lato font-bold text-text_Ternary text-base leading-5">
              <p>
                Amount<span className="text-text_Danger">*</span>
              </p>
            </div>
            <div className="w-full mt-2 py-2 grid grid-cols-12 border rounded-[4px] px-2 items-center justify-center border-ternary3">
              <input
                className="block focus:outline-none bg-transparent col-span-11 w-full h-max font-lato placeholder:font-lato placeholder:font-normal font-bold text-base text-text_Ternary"
                placeholder=" Enter Amount"
                autocomplete="off"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                style={{ background: "transparent" }}
              />
              <span className="font-lato font-bold leading-4 text-ternary text-base col-span-1 text-center">
                ₹
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pl-1 mt-1 text-text_Ternary font-lato">
              <span>
                <span>Min 100</span>
                <span className="text-xs"> - </span>
                <span>Max 200000</span>
              </span>
              {error && (
                <span className="text-red-500 font-medium text-xs">
                  {error}
                </span>
              )}
            </div>

            {/* Quick Amount Chips */}
            <div className="w-full grid grid-cols-3 gap-[10px] mt-[18px]">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => handleAddAmount(val)}
                  className="inline-block relative overflow-hidden transition-all ease-in-out duration-300 active:scale-95 text-white min-h-9 text-base font-lato rounded-md font-[800] leading-4 cursor-pointer hover:brightness-110 shadow"
                  type="button"
                  style={{
                    background:
                      "var(--text-color-brand-primary-but, #c10931)",
                  }}
                >
                  <span>+{val.toLocaleString()}</span>
                </button>
              ))}
            </div>

            <div className="my-2">
              <span className="text-text_Primary text-base font-lato font-[480] leading-4"></span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={success}
              className="relative overflow-hidden transition duration-150 ease-in-out bg-bg_text_brand_primary flex items-center justify-center gap-x-2 w-full text-white h-10 text-base rounded-md font-[500] leading-4 cursor-pointer hover:brightness-110 active:scale-[99%] shadow-md disabled:opacity-50"
              style={{
                background: "var(--text-color-brand-primary-but, #c10931)",
              }}
            >
              {success ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;

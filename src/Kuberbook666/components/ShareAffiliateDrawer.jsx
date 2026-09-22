import React from "react";

export default function ShareAffiliateDrawer({
  isOpen,
  onClose,
  referralUrl,
  copied,
  onCopy,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-slideUp">
        <div className="bg-white w-full max-w-[440px] rounded-t-[24px] p-4 shadow-2xl relative text-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2">
            <h4 className="text-[16px] font-bold text-gray-900 tracking-tight">
              Share Affiliate Link Or Code
            </h4>
            <button
              onClick={onClose}
              type="button"
              className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition cursor-pointer text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Banner Graphic */}
          <div className="w-full mb-3 overflow-hidden rounded-xl bg-black/5 shadow-sm">
            <img
              src="/af-share-img.svg"
              alt="Affiliate and Rewards"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>

          {/* Share Link Input Box */}
          <div className="mb-3">
            <p className="text-[13px] font-semibold text-gray-800 mb-1.5">
              Share Link
            </p>
            <div className="bg-[#f0f2f5] rounded-xl p-1.5 pl-3.5 flex items-center justify-between gap-2 border border-transparent focus-within:border-gray-300">
              <span className="text-xs text-gray-600 truncate font-medium flex-1">
                {referralUrl}
              </span>
              <button
                onClick={onCopy}
                type="button"
                className="bg-[#c10931] hover:bg-[#a00727] active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Share this link via */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <span className="text-[13px] font-semibold text-gray-800">
              Share this link via
            </span>
            <div className="flex items-center gap-2.5">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join now on Kuberbook666 and earn bonuses: ${referralUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#25D366] hover:opacity-90 active:scale-95 flex items-center justify-center text-white shadow-sm transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.274.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-10.416c-4.418 0-8 3.582-8 8 0 1.41.368 2.735 1.011 3.882l-1.074 3.928 4.025-1.055c1.107.603 2.376.945 3.729.945 4.418 0 8-3.582 8-8s-3.582-8-8-8z" />
                </svg>
              </a>

              {/* Instagram / Telegram Button */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  referralUrl
                )}&text=${encodeURIComponent("Join now on Kuberbook666!")}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#E1306C] hover:opacity-90 active:scale-95 flex items-center justify-center text-white shadow-sm transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

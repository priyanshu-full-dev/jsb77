import PropTypes from "prop-types";
import { FaTimes, FaCopy, FaShareAlt, FaGift } from "react-icons/fa";

const InviteModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const referralCode = "JSB77VIP";
  const referralLink = "https://jsb77.live/m/home?ref=JSB77VIP";

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003da5] via-[#005bf8] to-[#003da5] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaGift size={18} className="text-[#ffd700]" />
            <h3 className="font-extrabold text-sm uppercase">Invite & Earn Bonus</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 border-2 border-[#0047ba] flex items-center justify-center text-[#0047ba] shadow-sm">
            <FaShareAlt size={26} />
          </div>

          <div>
            <h4 className="font-extrabold text-base text-gray-900">
              Earn Up to 15% Lifetime Commission
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Invite friends to JSB77 and get instant deposit bonuses + perpetual daily rebates.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Referral Code</span>
              <p className="text-sm font-extrabold text-[#003da5] tracking-widest">{referralCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="bg-[#0047ba] hover:bg-[#003da5] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition"
            >
              <FaCopy size={11} /> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

InviteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InviteModal;


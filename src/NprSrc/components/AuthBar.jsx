import PropTypes from "prop-types";

const AuthBar = ({
  user,
  onOpenLogin,
  onOpenRegister,
  onOpenDeposit,
  onOpenWithdrawal,
}) => {
  return (
    <div className="bg-[#0045b8] px-3.5 h-[56px] flex items-center gap-2.5 shadow-sm select-none">
      {user ? (
        /* ========================================================
           LOGGED IN STATE: [Deposit] (Grey) & [Withdrawal] (Blue)
           Exact Match to Reference Screenshot
           ======================================================== */
        <>
          {/* 1. Deposit Button */}
          <button
            onClick={onOpenDeposit}
            className="flex-1 h-[42px] flex items-center justify-center bg-gradient-to-b from-[#ffffff] via-[#f1f6fe] to-[#cfdef5] hover:from-[#ffffff] hover:to-[#c4d6f0] text-[#072765] font-bold text-[16.5px] rounded-[5px] border-b-[3px] border-b-[#b0b8c6] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition transform active:scale-[0.98] cursor-pointer"
          >
            Deposit
          </button>

          {/* 2. Withdrawal Button */}
          <button
            onClick={onOpenWithdrawal}
            className="flex-1 h-[42px] flex items-center justify-center bg-gradient-to-b from-[#0158ec] via-[#024ecc] to-[#05317f] hover:from-[#0f62ee] hover:to-[#042a6d] text-white font-bold text-[16.5px] rounded-[5px] border-t border-t-[#2a8afc] border-b-[3px] border-b-[#062b6f] shadow-[0_2px_5px_rgba(0,0,0,0.28)] transition transform active:scale-[0.98] cursor-pointer"
          >
            Withdrawal
          </button>
        </>
      ) : (
        /* ========================================================
           LOGGED OUT STATE: [Login] (Grey) & [Register] (Blue)
           ======================================================== */
        <>
          {/* 1. Login Button */}
          <button
            onClick={onOpenLogin}
            className="flex-1 h-[42px] flex items-center justify-center bg-gradient-to-b from-[#ffffff] via-[#f1f6fe] to-[#cfdef5] hover:from-[#ffffff] hover:to-[#c4d6f0] text-[#072765] font-bold text-[16.5px] rounded-[5px] border-b-[3px] border-b-[#b0b8c6] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition transform active:scale-[0.98] cursor-pointer"
          >
            Login
          </button>

          {/* 2. Register Button */}
          <button
            onClick={onOpenRegister}
            className="flex-1 h-[42px] flex items-center justify-center bg-gradient-to-b from-[#0158ec] via-[#024ecc] to-[#05317f] hover:from-[#0f62ee] hover:to-[#042a6d] text-white font-bold text-[16.5px] rounded-[5px] border-t border-t-[#2a8afc] border-b-[3px] border-b-[#062b6f] shadow-[0_2px_5px_rgba(0,0,0,0.28)] transition transform active:scale-[0.98] cursor-pointer"
          >
            Register
          </button>
        </>
      )}
    </div>
  );
};

AuthBar.propTypes = {
  user: PropTypes.object,
  onOpenLogin: PropTypes.func.isRequired,
  onOpenRegister: PropTypes.func.isRequired,
  onOpenDeposit: PropTypes.func,
  onOpenWithdrawal: PropTypes.func,
};

export default AuthBar;

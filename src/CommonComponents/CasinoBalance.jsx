import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  get1chipValue,
  launcherUrl,
  updateCasinoBalance,
} from "../AsianExchangeSrc/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../AsianExchangeSrc/redux/slices/userSlice";
import { selectSite } from "../AsianExchangeSrc/utils/helper/commonSelectors";

const CasinoBalance = ({ onClose, title, gameId, gameName, isLoggedIn }) => {
  const [amount, setAmount] = useState(0);
  const [inputValue, setInputValue] = useState("0");
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state?.user?.userData);
  const siteData = useSelector(selectSite());
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [gameUrl, setGameUrl] = useState("");
  const [oneChipSms, setOneChipSms] = useState("");
  const [oneChipSmsLoading, setOneChipSmsLoading] = useState(false);
  const userCurrentCasinoBalance = userData?.casinoBalance.toFixed(0) || 0;
  const mainBalance =
    Number(userData?.availableBalance?.toFixed(0)) -
    Number(userData?.exposure?.toFixed(0)) +
    Number(userCurrentCasinoBalance);

  const setToMax = () => setAmount(mainBalance);
  const setToZero = () => setAmount(0);

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  const fetch1chipValue = async () => {
    try {
      setOneChipSmsLoading(true);
      const response = await get1chipValue({
        casinoDisplayName: userData?.casinoDisplayName || "",
        currenncy: siteData?.currency || "INR",
      });
      if (response.success) {
        // Assuming the response contains the 1 chip value in response.data.value
        setOneChipSms(response.data.feMessage);
      }
    } catch (error) {
      console.error("Failed to fetch 1 chip value:", error);
    } finally {
      setOneChipSmsLoading(false);
    }
  };

  useEffect(() => {
    fetch1chipValue();
  }, []);
  const handleSubmit = async () => {
    setLoading(true);
    if (amount <= 0 && userCurrentCasinoBalance <= 0) {
      toast.error("Please enter a valid amount to transfer.");
      setLoading(false);
      return;
    }

    try {
      const response = await updateCasinoBalance({ CasinoBalance: amount });

      if (
        response.data.message == "Balance transferred to casino successfully"
      ) {
        // toast.success(response.data.message);
        // toast.warning("Casino is under maintenance!");
        dispatch(
          updateAvailableBalance(response?.data?.updatedUser?.availableBalance)
        );
        dispatch(
          updateUserCasinoBalance(response?.data?.updatedUser?.casinoBalance)
        );
      } else {
        toast.warning(response.data.message);
      }

      const data = {
        gameId: gameId,
        playerId: userData?._id || "",
        displayName: userData?.casinoDisplayName || "",
        currency: "INR",
        country: "IN",
        gender: "M",
        birthDate: "1996-10-12",
        mode: isLoggedIn ? "real" : "demo",
        device: isMobile ? "mobile" : "desktop",
        returnUrl: window.location.href,
        walletSessionId: userData?.sessionToken || "",
      };

      try {
        const res = await launcherUrl(data);
        if (res.success) {
          setGameUrl(res?.data?.url);
          navigate(`/game-lobby?gameId=${encodeURIComponent(res?.data?.url)}`);
        }
      } catch (error) {
        console.error("error", error.response?.data?.message);
      }

      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      // navigate(`/game-lobby?gameId=${encodeURIComponent(gameUrl)}`);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    setInputValue(String(amount));
  }, [amount]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      <style jsx>{`
        input[type="range"].yellow-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background-color: #ffa00c;
          cursor: pointer;
          border: 1px solid #cb8009;
        }
        input[type="range"].yellow-thumb {
          width: 100%;
          height: 12px;
          background: #d1dde5;
          box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.3);
          border-radius: 5px;
        }
      `}</style>

      <div className="bg-white rounded-md w-full max-w-[500px] shadow-lg border relative">
        {/* Header */}
        <div className="w-full flex flex-col justify-center items-center p-4 border-b">
          <div className="w-full flex flex-row justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="text-xl font-bold text-[white] h-[25px] w-[25px] bg-[#243a48] rounded flex justify-center items-center"
            >
              &times;
            </button>
          </div>
          <div className="text-gray-500 text-start text-sm">{gameName}</div>
        </div>

        {/* Balances */}
        <div className="flex justify-between text-center border-b text-sm sm:text-base">
          <div className="flex-1 p-4">
            <div className="text-gray-500 text-start">Main Balance</div>
            <div className="font-bold text-gray-800 text-start">
              {mainBalance}
            </div>
          </div>
          <div className="border-l border-r w-px bg-gray-200" />
          <div className="flex-1 p-4">
            <div className="text-gray-500 text-end">Casino Balance</div>
            <div className="font-bold text-gray-800 text-end">
              {amount ? amount : userData?.casinoBalance?.toFixed(0) || "0.00"}
            </div>
          </div>
        </div>

        {/* Amount Box */}
        <div className="flex justify-center mt-2 relative">
          {/* <div className="absolute -top-4 z-10 transform -translate-y-1/2 bg-white border border-orange-400 rounded w-[150px] sm:w-[200px] py-0.5 font-bold text-lg text-[#2963a7] shadow flex justify-center items-center">
            {amount}
          </div> */}
          <div className="absolute -top-4 z-10 transform -translate-y-1/2 bg-white border border-orange-400 rounded w-[150px] sm:w-[200px] py-0.5 font-bold text-lg text-[#2963a7] shadow flex justify-center items-center">
            <input
              type="number"
              min="0"
              max={Math.floor(mainBalance)}
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setInputValue(val);
                  const numeric = parseInt(val, 10);
                  if (!isNaN(numeric) && numeric <= mainBalance) {
                    setAmount(numeric);
                  }
                }
              }}
              onBlur={() => {
                const numeric = parseInt(inputValue, 10);
                if (isNaN(numeric)) {
                  setAmount(0);
                  setInputValue("0");
                } else if (numeric > mainBalance) {
                  setAmount(Math.floor(mainBalance));
                  setInputValue(String(Math.floor(mainBalance)));
                }
              }}
              className="w-full text-center bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Range Input */}
        <div className="bg-[#cde3f0] px-2 py-2">
          <div
            className="flex items-center h-[50px] justify-between border border-[#bbb] rounded px-2"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #fdfdfd 15%, #eeeeee 100%)",
            }}
          >
            <span
              onClick={setToZero}
              className="cursor-pointer hover:underline w-[50px] sm:w-[60px] h-[100%] border-r border-[#bbb] flex items-center justify-center text-sm"
            >
              0
            </span>

            <div className="flex-1 px-2">
              <input
                type="range"
                min="0"
                max={Math.floor(mainBalance)}
                step="1"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAmount(val);
                  setInputValue(String(val));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer yellow-thumb"
                style={{
                  backgroundImage: `linear-gradient(to right, #facc15 0%, #facc15 ${(amount / mainBalance) * 100
                    }%, #e5e7eb ${(amount / mainBalance) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            <span
              onClick={setToMax}
              className="cursor-pointer hover:underline w-[50px] sm:w-[60px] h-[100%] flex items-center justify-center border-l border-[#bbb] text-sm"
            >
              Max
            </span>
          </div>
        </div>

        {/* <div className="text-center p-1 font-semibold text-xs sm:text-sm">
          {oneChipSmsLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="text-red-500">Note:</span> {oneChipSms}
            </>
          )}
        </div> */}

        <div className="flex justify-between px-3 py-4 gap-2 sm:gap-3 border-t">
          <button
            onClick={handleClose}
            className="w-full sm:w-[50%] text-[black] font-semibold py-2 text-[13px] rounded border border-[#ddd]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #eeeeee 89%)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-[50%] text-[#ffb600] font-semibold text-[13px] py-2 rounded disabled:opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #474747 0%, #070707 100%)",
            }}
          >
            {loading ? "Transferring..." : "Transfer and Enter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasinoBalance;

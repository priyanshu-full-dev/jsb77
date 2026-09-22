import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import {
  selectSiteHeaderColor,
  selectSiteLogo,
  selectSiteName,
} from "../../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../../utils/helper/generatePresignedUrl";
import { ReCallCasinoBalance } from "../../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../../redux/slices/userSlice";

const GameLobby = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const userData = useSelector((state) => state?.user?.userData);
  const HeaderColor = useSelector(selectSiteHeaderColor());
  const siteLogo = useSelector(selectSiteLogo());
  const siteName = useSelector(selectSiteName());

  const [logo, setLogo] = useState("");

  const rawParam = searchParams.get("gameId") || "";
  let gameUrl = "";
  try {
    gameUrl = decodeURIComponent(rawParam);
  } catch {
    gameUrl = rawParam;
  }

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (siteLogo) {
          const presignedUrl = await generatePresignedUrl(siteLogo);
          setLogo(presignedUrl);
          if (siteName) {
            document.title = siteName;
          }
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();
  }, [siteLogo, siteName]);

  const handlereCall = async () => {
    try {
      if (userData?.casinoBalance && userData.casinoBalance > 0) {
        const response = await ReCallCasinoBalance({
          CasinoBalance: userData?.casinoBalance,
        });
        if (response?.data?.user) {
          dispatch(updateAvailableBalance(response.data.user.availableBalance));
          dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
        }
      }
    } catch (error) {
      console.error("Error recalling balance:", error);
    }
  };

  const handleBack = async () => {
    await handlereCall();
    navigate(-1);
  };

  useEffect(() => {
    if (location.pathname !== "/game-lobby") {
      handlereCall();
    }
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-[99999] flex flex-col">
      {/* Top Header Bar */}
      <div
        className="w-full h-[36px] px-3 flex items-center justify-between z-10 flex-shrink-0"
        style={{
          backgroundImage: HeaderColor?.start
            ? `linear-gradient(180deg, ${HeaderColor?.start}, ${HeaderColor?.end})`
            : "linear-gradient(180deg, #1f2937, #111827)",
        }}
      >
        <button
          onClick={handleBack}
          type="button"
          className="text-white hover:text-amber-400 font-bold text-sm flex items-center gap-1 cursor-pointer transition-colors"
        >
          <IoIosArrowBack size={22} />
          <span>Back</span>
        </button>

        {logo ? (
          <img src={logo} alt={siteName || "Logo"} className="h-[26px] object-contain" />
        ) : (
          <span className="text-xs font-semibold text-gray-200">
            {siteName || "Kuberbook666 Live Lobby"}
          </span>
        )}
      </div>

      {/* Game Iframe */}
      <div className="w-full flex-1 bg-black relative">
        {gameUrl ? (
          <iframe
            src={gameUrl}
            className="w-full h-full border-0"
            title="Casino Game Lobby"
            allow="autoplay; fullscreen; screen-wake-lock"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
            <p className="text-base font-bold mb-3">No game URL provided.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#c10831] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Back to Games
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import {
  selectSiteHeaderColor,
  selectSiteLogo,
  selectSiteName,
} from "../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../utils/helper/generatePresignedUrl";
import { ReCallCasinoBalance } from "../../api";
import {
  updateAvailableBalance,
  updateUserCasinoBalance,
} from "../../redux/slices/userSlice";

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

  const urlParam = searchParams.get("url") || "";
  const gameIdParam = searchParams.get("gameId") || "";
  const gameName = searchParams.get("name") || "Casino Game";

  let rawParam = urlParam || gameIdParam;
  let gameUrl = "";
  try {
    gameUrl = decodeURIComponent(rawParam);
  } catch {
    gameUrl = rawParam;
  }

  const VALID_SPRIBE_SLUGS = new Set([
    'aviator', 'balloon', 'trader', 'mines', 'plinko', 'dice', 'hilo', 'goal', 'hotline', 'keno', 'barntomars'
  ]);

  if (gameUrl && !gameUrl.startsWith("http://") && !gameUrl.startsWith("https://") && !gameUrl.startsWith("//")) {
    const clean = gameUrl.trim();
    const cleanLower = clean.toLowerCase();
    const nameLower = (gameName || "").toLowerCase();

    // 1. Specific valid Spribe games matching
    if (cleanLower.includes("balloon") || nameLower.includes("balloon")) {
      gameUrl = "https://demo.spribe.io/launch/balloon?currency=INR&lang=en";
    } else if (cleanLower.includes("trader") || nameLower.includes("trader")) {
      gameUrl = "https://demo.spribe.io/launch/trader?currency=INR&lang=en";
    } else if (cleanLower.includes("mines") || nameLower.includes("mines")) {
      gameUrl = "https://demo.spribe.io/launch/mines?currency=INR&lang=en";
    } else if (cleanLower.includes("plinko") || nameLower.includes("plinko")) {
      gameUrl = "https://demo.spribe.io/launch/plinko?currency=INR&lang=en";
    } else if (cleanLower.includes("dice") || nameLower.includes("dice")) {
      gameUrl = "https://demo.spribe.io/launch/dice?currency=INR&lang=en";
    } else if (cleanLower.includes("hilo") || nameLower.includes("hilo")) {
      gameUrl = "https://demo.spribe.io/launch/hilo?currency=INR&lang=en";
    } else if (cleanLower.includes("goal") || nameLower.includes("goal")) {
      gameUrl = "https://demo.spribe.io/launch/goal?currency=INR&lang=en";
    } else if (cleanLower.includes("hotline") || nameLower.includes("hotline")) {
      gameUrl = "https://demo.spribe.io/launch/hotline?currency=INR&lang=en";
    } else if (cleanLower.includes("keno") || nameLower.includes("keno")) {
      gameUrl = "https://demo.spribe.io/launch/keno?currency=INR&lang=en";
    } else if (cleanLower.includes("aviator") || nameLower.includes("aviator")) {
      gameUrl = "https://demo.spribe.io/launch/aviator?currency=INR&lang=en";
    }
    // 2. Spribe provider prefix matching
    else if (clean.startsWith("SPB-") || clean.startsWith("spb_") || cleanLower.includes("spribe")) {
      const slug = clean.replace(/^SPB-/i, "").replace(/^spb_/i, "").toLowerCase();
      if (VALID_SPRIBE_SLUGS.has(slug)) {
        gameUrl = `https://demo.spribe.io/launch/${slug}?currency=INR&lang=en`;
      } else {
        gameUrl = "";
      }
    }
    // 3. Unavailable fallback: show clean Unavailable screen instead of wrong game
    else {
      gameUrl = "";
    }
  }

  const isValidUrl = Boolean(
    gameUrl &&
      (gameUrl.startsWith("http://") ||
        gameUrl.startsWith("https://") ||
        gameUrl.startsWith("//"))
  );

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
    const returnURL = localStorage.getItem("returnURL");
    if (returnURL?.startsWith("/")) {
      navigate(returnURL);
    } else {
      navigate(-1);
    }
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
    <div className="fixed inset-0 w-screen h-screen bg-black z-[99999] relative">
      {/* Floating Exit/Back Button */}
      <button
        onClick={handleBack}
        type="button"
        className="absolute top-3 left-3 z-50 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm cursor-pointer transition-all border border-white/20 active:scale-95"
      >
        <IoIosArrowBack size={16} />
        <span>Back</span>
      </button>

      {/* Game Iframe or Game Not Found Display */}
      {isValidUrl ? (
        <iframe
          src={gameUrl}
          className="w-full h-full border-0"
          title="Casino Game Lobby"
          allow="autoplay; fullscreen; screen-wake-lock"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center bg-[#111827]">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold shadow-md">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
          <p className="text-sm text-gray-400 max-w-xs mb-6">
            The requested game &quot;{gameName}&quot; is currently unavailable.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 bg-[#c10831] hover:bg-[#a00628] text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-md active:scale-95"
          >
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
};

export default GameLobby;

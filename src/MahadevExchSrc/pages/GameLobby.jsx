import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  selectSiteHeaderColor,
  selectSiteLogo,
  selectSiteName,
} from "../../utils/helper/commonSelectors";
import { IoIosArrowBack } from "react-icons/io";
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
  const [showOverlay, setShowOverlay] = useState(true);
  const gameId = decodeURIComponent(searchParams.get("gameId"));

  const handlereCall = async () => {
    try {
      const response = await ReCallCasinoBalance({
        CasinoBalance: userData?.casinoBalance,
      });
      dispatch(updateAvailableBalance(response.data.user.availableBalance));
      dispatch(updateUserCasinoBalance(response.data.user.casinoBalance));
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
      navigate("/");
    }
  };


  useEffect(() => {
    if (location.pathname !== "/game-lobby") {
      handlereCall();
    }
  }, [location.pathname]);


  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (siteLogo) {
          const presignedUrls = await generatePresignedUrl(siteLogo);
          setLogo(presignedUrls);
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


  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const previousPadding = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "0px";
    return () => {
      document.body.style.paddingBottom = previousPadding;
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
  

      {/* 🔹 Header */}
      <div
        className="pr-2"
        style={{
          backgroundImage: `linear-gradient(180deg, ${HeaderColor?.start}, ${HeaderColor?.end})`,
          width: "100vw",
          height: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            color: "white",
            height: "30px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IoIosArrowBack size={30} /> Back
        </button>
        <img src={logo} alt={siteName} className="h-[30px]" />
      </div>

      {/* 🔹 Game Iframe */}
      <iframe
        src={gameId}
        style={{
          height: "calc(100vh - 32px)",
          width: "100vw",
          border: "none",
        }}
        title="Game Lobby"
      />
    </div>
  );
};

export default GameLobby;

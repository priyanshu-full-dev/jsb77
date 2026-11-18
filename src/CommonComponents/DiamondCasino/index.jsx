import { lazy, Suspense, useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { subscribeToDiamondCasinoOddsData, socket } from "../../socketClient";
import CasinoHeader from "../../NprSrc/AuraExchangeSrc/components/Header/CasinoHeader";
import {
  selectSite,
  selectSiteHeaderColor,
} from "../../utils/helper/commonSelectors";

const casinoComponents = {
  3030: lazy(() => import("./CasinoFullMarket/CT3030")),
  3058: lazy(() => import("./CasinoFullMarket/CT3058")),
  3031: lazy(() => import("./CasinoFullMarket/CT3031")),
  3032: lazy(() => import("./CasinoFullMarket/CT3032")),
  3059: lazy(() => import("./CasinoFullMarket/CT3059")),
  3033: lazy(() => import("./CasinoFullMarket/CT3033")),
  3038: lazy(() => import("./CasinoFullMarket/CT3038")),
  3039: lazy(() => import("./CasinoFullMarket/CT3039")),
  3040: lazy(() => import("./CasinoFullMarket/CT3040")),
  3044: lazy(() => import("./CasinoFullMarket/CT3044")),
  3042: lazy(() => import("./CasinoFullMarket/CT3042")),
  3043: lazy(() => import("./CasinoFullMarket/CT3043")),
  3034: lazy(() => import("./CasinoFullMarket/CT3034")),
  3037: lazy(() => import("./CasinoFullMarket/CT3037")),
  3055: lazy(() => import("./CasinoFullMarket/CT3055")),
};

const DiamondCasino = ({ externalLoader }) => {
  const { gameId } = useParams();
  const dispatch = useDispatch();
  const { odds, loading, error } = useSelector(
    (state) => state.diamondCasinoOdds,
  );
  const siteLayout = useSelector(selectSite());
  const headerColor = useSelector(selectSiteHeaderColor());

  const CasinoComponent = casinoComponents[gameId];
  const [socketDis, setsocketDis] = useState(false);
  const [internalLoader, setInternalLoader] = useState(true);
  const [showLoader, setShowLoader] = useState(true); // 👈 new state

  const isUsingExternal = externalLoader !== undefined;
  const Dloader = isUsingExternal ? externalLoader : internalLoader;

  // Minimum 1-second loader
  useEffect(() => {
    if (!isUsingExternal) {
      setInternalLoader(true);

      const timer = setTimeout(() => {
        setInternalLoader(false);
      }, 3000); // minimum loader time

      return () => clearTimeout(timer);
    }
  }, [gameId, isUsingExternal]);

  // Handle socket disconnection
  const handleDisconnect = useCallback(() => {
    setsocketDis(true);
    toast.error("Network error, please refresh the page", {
      position: "top-center",
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToDiamondCasinoOddsData({
      eventId: "casino",
      eventType: "casino",
      gmid: gameId,
    });

    socket.on("disconnect", handleDisconnect);

    return () => {
      unsubscribe();
      socket.off("disconnect", handleDisconnect);
    };
  }, [gameId, handleDisconnect]);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-black">
          {Dloader && <img src="/casino/universe.gif" alt="Loading..." />}
        </div>
      }
    >

      {siteLayout?.layout === "skyexchange" && (
        <div className="w-full">
          <CasinoHeader headerColor={headerColor} />
          <div className="h-[56px]" />
        </div>
      )}

      {error && (
        <div className="text-center mt-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {CasinoComponent && !loading && !error ? (
        <CasinoComponent gameId={gameId} data={odds} socketDis={socketDis} />
      ) : (
        !loading &&
        !error && (
          <div className="text-center mt-4">
            <p className="text-red-500">
              This Casino Table is under maintenance.
            </p>
          </div>
        )
      )}
    </Suspense>
  );
};

export default DiamondCasino;

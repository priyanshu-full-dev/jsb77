import React, { useEffect } from "react";
import TvIframe from "./Iframe";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { subscribeToDiamondCasinoOddsData } from "../../../../socketClient";
import Card from "./Card";

const BallByBall = () => {
  const { gameId } = useParams();
  const { odds, loading, error } = useSelector(
    (state) => state.diamondCasinoOdds
  );

  useEffect(() => {
    const unsubscribe = subscribeToDiamondCasinoOddsData({
      eventId: "casino",
      eventType: "casino",
      gmid: gameId,
    });
    return () => {
      unsubscribe();
    };
  }, [gameId]);

  console.log({ odds });

  return (
    <div className="w-full">
      <TvIframe gameId={gameId} data={odds} />
      <Card gameId={gameId} data={odds} />
    </div>
  );
};

export default BallByBall;

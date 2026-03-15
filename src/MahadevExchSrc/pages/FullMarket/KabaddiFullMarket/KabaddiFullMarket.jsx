import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  subscribeToKabaddiMatchesDataOdds,
} from "../../../../socketClient";
import OtherOddsKabaddi from "./OtherOddsKabaddi";
import BookmakerOddsKabaddi from "./BookmakerOddsKabaddi";


const KabaddiMarket = () => {
  const dispatch = useDispatch();
  const { kabaddiMarkets } = useSelector((state) => state?.kabaddi);
  const [searchParams] = useSearchParams();
  const gmid = searchParams.get("gmid");
  const bm = searchParams.get("bm");
  const fancy = searchParams.get("fancy");

  // Subscribe to odds data
  useEffect(() => {
    if (gmid) {
      subscribeToKabaddiMatchesDataOdds(gmid);
    }
    return () => {
      // Cleanup subscription (implement unsubscribe logic if needed)
    };
  }, [gmid]);


  return (
    <>
      {bm=="true"&&<BookmakerOddsKabaddi/>}
      {fancy == "true" && <OtherOddsKabaddi />}
     
    </>
  );
};

export default KabaddiMarket;

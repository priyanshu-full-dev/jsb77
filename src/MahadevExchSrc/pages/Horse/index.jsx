import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Loader from "";
import { GoDotFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import "./index.css";
// import {
//   updateHorseMarket,
// } from "../../redux/slices/horseSlice";


import HorseFilteredMatches from "./HorseFilteredMatches";

import { subscribeToHorseMatchesData } from "../../../socketClient";
import SportsHeader from "../../components/SportsHeader";
export default function Horse() {
  const data = useSelector((state) => state?.horse?.horseRaceList);
  const [activeTab, setActiveTab] = useState("ALL");

  
  const countryIcons = {
    GB: "/Flags/GB.svg",
    FRA: "/Flags/FRA.svg",
    FR: "/Flags/FRA.svg",
    USA: "/Flags/USA.svg",
    AU: "/Flags/AUS.svg",
    IRE: "/Flags/IRE.svg",
    IE: "/Flags/IRE.svg",
    RSA: "/Flags/RSA.svg",
    NZ: "/Flags/NZ.svg",
    IN: "/Flags/IN.svg",
    ZA: "/Flags/ZA.svg",
    HK: "/Flags/HK.svg",
    US: "/Flags/USA.svg",
  };

  // const fetch = async () => {
  //   try {
  //     if (!data) {
  //       setLoading(true);
  //     }
  //     const response = await horseRace();
  //     dispatch(updateHorseSlice({ horseRaceList: response?.data?.data?.t1 }));
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    // fetch();
    // const fetchGreyhoundRaceIntervalId = setInterval(() => {
    //   fetch();
    // }, 60000);
    // return () => { clearInterval(fetchGreyhoundRaceIntervalId) }
    subscribeToHorseMatchesData();
  }, []);

  // Unique country codes from data
  const availableTabs = data
    ? ["ALL", ...new Set(data.map((e) => e?.cname))]
    : [];

  return (
    <div className="flex pb-[80px] flex-col bg-light-bg dark:bg-dark-bg text-black dark:text-white">
   <SportsHeader/>

      <div>
        <div
          className={`bg-[#005930] text-[white] p-2 pl-2.5 font-bold`}
          style={{

            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 className="text-[13px] ">Horse Racing Schedule</h4>
          <h6 className="text-[10px]"> Time Format: IST </h6>
        </div>
        {/* Country selection */}
        <div className="flex w-full border-b border-[#c8ced3] justify-between bg-[#e2e2e2] items-center">
          <div className="w-full overflow-x-auto whitespace-nowrap">
            <div className="flex w-max">
              {availableTabs.map((label, index) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`font-bold text-[11px] flex flex-col items-center justify-center h-[45px] w-[70px] ${
                    activeTab === label
                      ? "bg-light-bg dark:bg-dark-bg text-black  border-l border-[#c8ced3] border-r"
                      : "bg-light-bg dark:bg-dark-bg text-gray-600"
                  }`}
                >
                  {countryIcons[label] ? (
                    <img src={countryIcons[label]} width={20} alt={label} />
                  ) : index === 0 ? (
                    "ALL"
                  ) : (
                    label
                  )}
                  <b>{countryIcons[label] && label}</b>
                </button>
              ))}
            </div>
          </div>
        </div>

        <HorseFilteredMatches data={data} activeTab={activeTab} />
      </div>
      {/* )} */}
    </div>
  );
}

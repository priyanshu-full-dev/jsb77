import { useEffect, useMemo, useState } from "react";
import CasinoHomeNav from "./CasinoHomeNav";
import CasinoHomeNavForLiveCasino from "./CasinoHomeNavForLiveCasino";
import { useDispatch, useSelector } from "react-redux";
import { selectDomainID } from "../../../../utils/helper/commonSelectors";
import { updateCasinoSlice } from "../../../../redux/slices/casinoSlice";
import defaultCasinoData from "./defaultCasinoData";
import axios from "axios";

function CasinoHome() {
  const dispatch = useDispatch();
  const domainId = useSelector(selectDomainID());
  const casinoApiData = useSelector((state) => state.casino.casinoApiData);

  const [isLoading, setIsLoading] = useState(false);

  const currentPathName =
    typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    if (!domainId) {
      return;
    }

    const fetchCasino = async () => {
      try {
        const response = await axios.get(
          `https://api.professor.monster/api/int/getIntCasinos?domainId=${domainId}`
        );

        const data = response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          dispatch(updateCasinoSlice({ casinoApiData: data }));
        }
      } catch (error) {
        console.error(
          "Error fetching casino data:",
          error?.response?.data?.message || error?.message || error
        );
      }
    };

    fetchCasino();
  }, [domainId, dispatch]);

  // Guarantees instant 0.0s rendering on reload from Redux / bundled defaultCasinoData without bloating localStorage
  const providerList = useMemo(() => {
    const data =
      Array.isArray(casinoApiData) && casinoApiData.length > 0
        ? casinoApiData
        : defaultCasinoData;

    return data;
  }, [casinoApiData]);

  return <CasinoHomeNav providerList={providerList} />;
}

export default CasinoHome;
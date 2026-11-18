// src/hooks/useTrackPreviousRoute.js

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPreviousRoute } from "../redux/slices/routeSlice";


const useTrackPreviousRoute = () => {
  const location = useLocation();
  const prevLocation = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (prevLocation.current) {
      dispatch(setPreviousRoute(prevLocation.current.pathname));
    }
    prevLocation.current = location;
  }, [location, dispatch]);
};

export default useTrackPreviousRoute;

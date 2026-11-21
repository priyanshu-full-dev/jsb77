import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, navigateTo = "/" }) => {
  const navigate = useNavigate();
  const reduxLoggedIn = useSelector((state) => state.user?.isLoggedIn);
  const reduxToken = useSelector((state) => state.user?.token);
  const rehydrated = useSelector((state) => state?._persist?.rehydrated);

  const isAuthenticated = Boolean(
    reduxLoggedIn ||
    reduxToken ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("npr_user")))
  );

  useEffect(() => {
    if (rehydrated !== false && !isAuthenticated) {
      navigate(navigateTo, { replace: true });
    }
  }, [isAuthenticated, rehydrated, navigate, navigateTo]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

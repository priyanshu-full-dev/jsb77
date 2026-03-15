import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, navigateTo = "/" }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.isLoggedIn);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate(navigateTo);
    }
  }, [isAuthenticated, navigate, navigateTo]);

  if (!isAuthenticated) {
    return null; // or a loading spinner if you want
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isSignupUser } from "../utils/helper/commonSelectors";

const SignupProtectedRoute = ({ children, navigateTo = "/" }) => {
  const navigate = useNavigate();
  const signupUser = useSelector(isSignupUser());

  useEffect(() => {
    if (!signupUser) {
      navigate(navigateTo);
    }
  }, [signupUser, navigate, navigateTo]);

  if (!signupUser) {
    return null;
  }

  return <>{children}</>;
};

export default SignupProtectedRoute;

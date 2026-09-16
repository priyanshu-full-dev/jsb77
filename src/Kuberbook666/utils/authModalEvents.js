export const openLoginModal = () => {
  window.dispatchEvent(new CustomEvent("kuber_open_login"));
};

export const openSignupModal = () => {
  window.dispatchEvent(new CustomEvent("kuber_open_signup"));
};

export const isUserLoggedIn = () => {
  return Boolean(
    localStorage.getItem("kuber_user") ||
    localStorage.getItem("token") ||
    localStorage.getItem("kuber_token")
  );
};

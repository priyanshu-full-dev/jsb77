export const isPort5177 = () => {
  if (typeof window === "undefined") return false;
  return window.location.port === "5177";
};

export const t = (en, bn) => {
  return isPort5177() ? en : bn;
};

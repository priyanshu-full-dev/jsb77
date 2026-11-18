import { useState, useEffect } from "react";
import { themeColors } from "./../utils/themeColors";

// Helper to get the selected theme
const getSelectedTheme = () => {
  try {
    const savedTheme = localStorage.getItem("themeData");
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
  } catch (e) {
    console.error("Error parsing themeData:", e);
  }

  // If themeData is not yet set, fallback to dynamic siteDetails colors if cached
  try {
    const rawSiteDetails = localStorage.getItem("siteDetails");
    if (rawSiteDetails) {
      const siteDetails = JSON.parse(rawSiteDetails);
      const topHeaderColor =
        siteDetails?.topHeaderColor || siteDetails?.topBarColor;
      const headerColor = siteDetails?.headerColor;
      const loginButtonColor = siteDetails?.loginButtonColor;

      if (topHeaderColor || headerColor) {
        return {
          id: "DefaultSiteTheme",
          name: "DefaultSiteTheme",
          Primary: {
            start: topHeaderColor?.start || "#F6A21E",
            end: topHeaderColor?.end || "#efae4b",
          },
          PrimaryTextColor: "black",
          SecondaryTextColor: "black",
          Secondary: {
            start: loginButtonColor?.start || "#000000",
            end: loginButtonColor?.end || "#000000",
          },
          gradient: {
            start: headerColor?.start || "#000000",
            middle: "#fff",
            end: headerColor?.end || "#ffc011",
          },
        };
      }
    }
  } catch (e) {
    console.error("Error parsing siteDetails in useThemeColors:", e);
  }

  // Default to theme2 (Sunny Dusk - #F6A21E), the official Aura theme, instead of theme1 (Ocean Breeze)
  const defaultTheme =
    themeColors.find((t) => t.id === "theme2") || themeColors[0];
  return defaultTheme;
  return defaultTheme;
};

// ================== usePrimaryColor ==================
export const usePrimaryColor = () => {
  const [primaryColor, setPrimaryColor] = useState(() => getSelectedTheme().Primary);

  useEffect(() => {
    const updateTheme = () => setPrimaryColor(getSelectedTheme().Primary);

    updateTheme();

    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return primaryColor
    ? `linear-gradient(180deg, ${primaryColor.start}, ${primaryColor.end})`
    : "";
};

// ================== usePrimaryTextColor ==================
export const usePrimaryTextColor = () => {
  const [primaryTextColor, setPrimaryTextColor] = useState(() => getSelectedTheme().PrimaryTextColor);

  useEffect(() => {
    const updateTheme = () => setPrimaryTextColor(getSelectedTheme().PrimaryTextColor);

    updateTheme();

    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return primaryTextColor || "";
};

// ================== useSecondaryTextColor ==================
export const useSecondaryTextColor = () => {
  const [secondaryTextColor, setSecondaryTextColor] = useState(() => getSelectedTheme().SecondaryTextColor);

  useEffect(() => {
    const updateTheme = () => setSecondaryTextColor(getSelectedTheme().SecondaryTextColor);

    updateTheme();

    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return secondaryTextColor || "";
};

// ================== useSecondaryColor ==================
export const useSecondaryColor = () => {
  const [secondaryColor, setSecondaryColor] = useState(() => getSelectedTheme().Secondary);

  useEffect(() => {
    const updateTheme = () => setSecondaryColor(getSelectedTheme().Secondary);

    updateTheme();

    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return secondaryColor
    ? `linear-gradient(180deg, ${secondaryColor.start}, ${secondaryColor.end})`
    : "";
};

// ================== useGradientColor ==================
export const useGradientColor = () => {
  const [gradientColor, setGradientColor] = useState(() => getSelectedTheme().gradient);

  useEffect(() => {
    const updateTheme = () => setGradientColor(getSelectedTheme().gradient);

    updateTheme();

    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return gradientColor
    ? `linear-gradient(180deg, ${gradientColor.start} 0%, ${gradientColor.end} 100%)`
    : "";
};

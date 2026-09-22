import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("kuber_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      // ignore
    }
    return "light";
  });

  const applyThemeToDOM = (currentTheme) => {
    const isDark = currentTheme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.body.setAttribute("data-theme", "light");
    }
  };

  // Immediate synchronous DOM update before paint
  useLayoutEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("kuber_theme", theme);
    } catch {
      // ignore
    }
    applyThemeToDOM(theme);
    window.dispatchEvent(new CustomEvent("kuber_theme_changed", { detail: { theme } }));
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setThemeState(newTheme);
    }
  };

  const value = {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;

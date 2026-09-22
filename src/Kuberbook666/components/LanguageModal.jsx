import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";

export const ALL_LANGUAGES = [
  { code: "EN", name: "English", label: "English (EN)" },
  { code: "HI", name: "हिंदी", label: "हिंदी (HI)" },
  { code: "MR", name: "मराठी", label: "मराठी (MR)" },
  { code: "GU", name: "ગુજરાતી", label: "ગુજરાતી (GU)" },
  { code: "KN", name: "ಕನ್ನಡ", label: "ಕನ್ನಡ (KN)" },
  { code: "BN", name: "বাংলা", label: "বাংলা (BN)" },
  { code: "ES", name: "Español", label: "Español (ES)" },
  { code: "TH", name: "ภาษาไทย", label: "ภาษาไทย (TH)" },
  { code: "AS", name: "অসমীয়া", label: "অসমীয়া (AS)" },
  { code: "OR", name: "ଓଡ଼ିଆ", label: "ଓଡ଼ିଆ (OR)" },
  { code: "TA", name: "தமிழ்", label: "தமிழ் (TA)" },
  { code: "UR", name: "اردو", label: "اردو (UR)" },
  { code: "TE", name: "తెలుగు", label: "తెలుగు (TE)" },
  { code: "PA", name: "ਪੰਜਾਬੀ", label: "ਪੰਜਾਬੀ (PA)" },
  { code: "NE", name: "नेपाली", label: "नेपाली (NE)" },
  { code: "AR", name: "العربية", label: "العربية (AR)" },
];

export const getStoredLanguage = () => {
  try {
    const saved = localStorage.getItem("kuber_lang");
    if (saved && ALL_LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    // fallback
  }
  return "EN";
};

export default function LanguageModal({ isOpen, onClose, onSelectLanguage, currentLanguage = "EN" }) {
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setSelectedLang(currentLanguage || getStoredLanguage());
    }
  }, [isOpen, currentLanguage]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      localStorage.setItem("kuber_lang", selectedLang);
    } catch {
      // ignore
    }
    if (onSelectLanguage) {
      onSelectLanguage(selectedLang);
    }
    window.dispatchEvent(
      new CustomEvent("kuber_language_changed", {
        detail: { language: selectedLang },
      })
    );
    onClose();
  };

  const handleCancel = () => {
    setSelectedLang(currentLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-lato">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleCancel} />

      {/* Modal Container */}
      <div
        style={{
          backgroundColor: isDark ? "#151822" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
        }}
        className="w-full max-w-[500px] relative rounded-lg shadow-2xl popUpOpenAnimation max-h-[90vh] flex flex-col overflow-hidden z-10 border border-black/10 dark:border-white/10"
      >
        {/* Close Button (Circle X) */}
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 active:scale-95 transition-transform duration-200 cursor-pointer z-20 text-gray-800 dark:text-gray-200 hover:opacity-80"
          type="button"
          aria-label="Close"
        >
          <svg
            height="24"
            width="24"
            fill="currentColor"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
            />
            <path
              fill="#ffffff"
              d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z"
            />
          </svg>
        </button>

        {/* Modal Header & Content */}
        <div className="px-5 pt-6 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-y-auto">
          <div className="text-center sm:text-left">
            <h3
              style={{ color: isDark ? "#ffffff" : "#111827" }}
              className="text-lg font-bold leading-6 tracking-wide"
            >
              Select Language
            </h3>
            <div className="mt-1">
              <p
                style={{ color: isDark ? "#9ca3af" : "#4b5563" }}
                className="text-xs sm:text-sm font-normal"
              >
                Choose your preferred language from the list below:
              </p>
            </div>
          </div>

          {/* Languages Grid */}
          <div className="mt-4 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <li key={lang.code}>
                    <button
                      onClick={() => setSelectedLang(lang.code)}
                      style={
                        isSelected
                          ? {
                              backgroundColor: isDark ? "#3b1622" : "#fce7ec",
                              color: isDark ? "#ffb3c1" : "#111827",
                              borderColor: "#c10931",
                            }
                          : {
                              backgroundColor: isDark ? "#1c1f2b" : "#ffffff",
                              color: isDark ? "#e2e8f0" : "#111827",
                              borderColor: isDark ? "#2e3344" : "#e2e8f0",
                            }
                      }
                      className="relative overflow-hidden w-full px-3 py-2.5 text-sm font-semibold rounded-md border text-left transition-all duration-150 active:scale-[0.98] cursor-pointer hover:border-[#c10931]"
                      type="button"
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate">{lang.label}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="18"
                            fill="#c10931"
                            viewBox="0 0 448 512"
                            className="w-4 h-4 flex-shrink-0"
                          >
                            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Modal Action Buttons (Confirm & Cancel) */}
        <div
          style={{
            borderTopColor: isDark ? "#272733" : "#f1f5f9",
          }}
          className="px-5 py-3 border-t flex flex-row justify-end gap-3"
        >
          <button
            onClick={handleConfirm}
            type="button"
            className="flex-1 sm:flex-none sm:min-w-[120px] px-5 py-2.5 text-sm font-bold text-white bg-[#a00727] hover:bg-[#830827] active:scale-95 rounded-md shadow transition cursor-pointer text-center justify-center"
          >
            Confirm
          </button>
          <button
            onClick={handleCancel}
            type="button"
            style={{
              backgroundColor: isDark ? "#252836" : "#fce7ec",
              color: isDark ? "#e2e8f0" : "#111827",
            }}
            className="flex-1 sm:flex-none sm:min-w-[120px] px-5 py-2.5 text-sm font-bold rounded-md hover:opacity-90 active:scale-95 transition cursor-pointer text-center justify-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

LanguageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectLanguage: PropTypes.func,
  currentLanguage: PropTypes.string,
};

import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    const isPort5177 = window.location.host==="kuberbook.online";
    if (isPort5177) {
      document.cookie = "googtrans=/en/en; path=/";
    } else {
      const langCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("googtrans="));

      if (!langCookie) {
        document.cookie = "googtrans=/en/bn; path=/";
      }
    }

    const addScript = () => {
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ta,te,kn,mr,gu,bn,ne",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        };
      }

      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
};

export default GoogleTranslate;
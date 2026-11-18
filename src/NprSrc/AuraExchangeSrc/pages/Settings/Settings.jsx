import { useState, useEffect } from "react";
import { Settings, RefreshCw } from "lucide-react";
import {
  selectSiteHeaderColor,
  selectSiteLoginColor,
  selectSiteTopHeaderColor,
} from "../../../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";
import { themeColors } from "../../utils/themeColors";
import {
  usePrimaryColor,
  useSecondaryColor,
  useSecondaryTextColor,
} from "../../hooks/useThemeColors";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Added import

export default function SettingsPage() {
  const headerColor = useSelector(selectSiteHeaderColor());
  const LoginButtonColor = useSelector(selectSiteLoginColor());
  const TopHeaderColor = useSelector(selectSiteTopHeaderColor());
  const SecondaryTextColor = useSecondaryTextColor();

  const defaultTheme = {
    id: "DefaultSiteTheme",
    name: "DefaultSiteTheme",
    Primary: {
      start: TopHeaderColor?.start || "#000000",
      end: TopHeaderColor?.end || "#000000",
    },
    PrimaryTextColor: "black",
    SecondaryTextColor: "black",
    Secondary: {
      start: LoginButtonColor?.start || "#000000",
      end: LoginButtonColor?.end || "#000000",
    },
    gradient: {
      start: headerColor?.start || "#000000",
      middle: "#fff",
      end: headerColor?.end || "#000000",
    },
  };

  const [selectedTheme, setSelectedTheme] = useState(() => {
    const savedTheme = localStorage.getItem("themeData");
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // const [isDarkMode, setIsDarkMode] = useState(() => {
  //   const savedTheme = localStorage.getItem("theme");
  //   if (savedTheme === "dark") return true;
  //   if (savedTheme === "light") return false;
  //   return window.matchMedia("(prefers-color-scheme: dark)").matches;
  // });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    return false;
  });

  useEffect(() => {
    localStorage.setItem("themeData", JSON.stringify(selectedTheme));
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    window.dispatchEvent(new Event("themeChanged"));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [selectedTheme, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [stakes, setStakes] = useState([
    { id: 1, buttonValue: "100", newValue: "100" },
    { id: 2, buttonValue: "200", newValue: "200" },
    { id: 3, buttonValue: "500", newValue: "500" },
    { id: 4, buttonValue: "1000", newValue: "1000" },
    { id: 5, buttonValue: "2000", newValue: "2000" },
    { id: 6, buttonValue: "5000", newValue: "5000" },
    { id: 7, buttonValue: "10000", newValue: "10000" },
    { id: 8, buttonValue: "25000", newValue: "25000" },
  ]);

  useEffect(() => {
    const savedStakes = localStorage.getItem("stakes");
    if (savedStakes) {
      try {
        const parsedStakes = JSON.parse(savedStakes);
        if (Array.isArray(parsedStakes)) {
          setStakes(parsedStakes);
        }
      } catch (err) {
        console.error("Failed to parse saved stakes:", err);
      }
    }
  }, []);

  const handleInputChange = (id, value) => {
    const updatedStakes = stakes.map((stake) =>
      stake.id === id ? { ...stake, newValue: value } : stake,
    );
    setStakes(updatedStakes);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        const updatedStakes = stakes.map((stake) => ({
          ...stake,
          buttonValue: stake.newValue,
        }));
        setStakes(updatedStakes);
        localStorage.setItem("stakes", JSON.stringify(updatedStakes));
        toast.success("Stake values saved successfully!");
        navigate("/");
      } catch (error) {
        toast.error("Failed to save stake values");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-gray-800 border-b border-[#ddd] pb-1">
      <div
        className="flex items-center justify-start p-2.5 shadow-md"
        style={{ background: usePrimaryColor() }}
      >
        <Settings
          className="mr-2 h-6 w-6"
          style={{ color: SecondaryTextColor }}
        />
        <h1
          className="text-md font-extrabold"
          style={{ color: SecondaryTextColor }}
        >
          Settings
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-1">
        <div className="mb-1">
          <div
            style={{
              background: "linear-gradient(-180deg, #2e4b5e 0, #243a48 82%)",
            }}
            className="flex items-center justify-between  p-1.5"
          >
            <h2 className="text-[15px] font-extrabold text-white">Theme</h2>
            <button
              className="flex items-center space-x-1 rounded-md text-white px-3 text-sm font-medium shadow-sm"
              onClick={() => {
                setSelectedTheme(defaultTheme); // Fixed to use defaultTheme object
                toast.info("Theme reset to default");
              }}
            >
              <span className="font-extrabold">Default</span>
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-white p-4 dark:bg-dark-bg">
            <div className="grid grid-cols-5 gap-3 place-content-center place-items-center">
              {themeColors.map((theme) => (
                <button
                  key={theme.id}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-black transition-all duration-200 `}
                  onClick={() => setSelectedTheme(theme)}
                  aria-label={`Select ${theme.id} theme`}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${theme.gradient.start} 49%, ${theme.gradient.middle} 0, ${theme.gradient.middle} 51%, ${theme.Primary.end} 0)`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-1">
          <div className="flex items-center bg-[#2c3e50] p-1.5">
            <h2 className="text-[15px] font-bold text-white">Stake</h2>
          </div>
          <div className="bg-light-bg dark:bg-dark-bg p-1">
            <h3 className="mb-3 mt-2 text-sm font-extrabold text-black dark:text-white">
              Quick Stakes
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {stakes.map((stake) => (
                <input
                  key={stake.id}
                  value={stake.newValue}
                  type="text"
                  onChange={(e) => handleInputChange(stake.id, e.target.value)}
                  className="border-[3px] border-solid text-[13px] p-1.5 text-center 
                  [border-image:conic-gradient(#6ca7ec,#2222b9,#6ca7ec,#2222b9,#6ca7ec,#2222b9,#6ca7ec)_1]
                  focus:outline-none focus:shadow-none focus:rounded-none focus:bg-[white]"
                />
              ))}
            </div>
          </div>
        </div>
        {/* <div className="mb-1">
          <div className="flex items-center justify-between bg-[#2c3e50] p-1.5">
            <h2 className="text-sm font-extrabold text-white">Dark/Light Mode</h2>
          </div>
          <div className="bg-white p-4 dark:bg-dark-bg">
            <label className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-800 dark:text-white">Toggle Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isDarkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                    isDarkMode ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
        </div> */}
      </div>

      <div className="p-1">
        <button
          className="w-full rounded-lg text-xl font-extrabold text-white"
          onClick={handleSubmit}
          style={{
            background: useSecondaryColor(),
            height: "45px",
          }}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white inline-block"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

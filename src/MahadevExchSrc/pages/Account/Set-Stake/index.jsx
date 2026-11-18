import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSite } from "../../../../utils/helper/commonSelectors";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Loading from "../../../../utils/Loader";

export default function SetStake() {
  const topHeaderColor = useSelector(selectSite())?.headerColor;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate
  const [stakes, setStakes] = useState([
    { id: 1, buttonValue: "5555", newValue: "5555" },
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
      const parsedStakes = JSON.parse(savedStakes);
      // Ensure newValue is initialized with buttonValue if not present
      const initializedStakes = parsedStakes.map((stake) => ({
        ...stake,
        newValue: stake.newValue || stake.buttonValue,
      }));
      setStakes(initializedStakes);
    } else {
      localStorage.setItem("stakes", JSON.stringify(stakes));
    }
    setLoading(false);
  }, []);

  const handleInputChange = (id, value) => {
    const updatedStakes = stakes.map((stake) =>
      stake.id === id ? { ...stake, newValue: value } : stake
    );
    setStakes(updatedStakes);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        // Update buttonValue with newValue on submit
        const updatedStakes = stakes.map((stake) => ({
          ...stake,
          buttonValue: stake.newValue,
        }));
        setStakes(updatedStakes);
        localStorage.setItem("stakes", JSON.stringify(updatedStakes));
        toast.success("Stake values saved successfully!");
        navigate("/"); // Redirect to home page after saving
      } catch (error) {
        toast.error("Failed to save stake values");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleCancel = () => {
    // Reset newValue to buttonValue for all stakes
    const resetStakes = stakes.map((stake) => ({
      ...stake,
      newValue: stake.buttonValue,
    }));
    setStakes(resetStakes);
    toast.info("Changes discarded!");
    navigate("/"); // Redirect to home page after canceling
  };

  return (
    <div className="p-2.5">
      {loading && <Loading />}
      <form onSubmit={handleSubmit} className="bg-white rounded mb-4">
        <h2
          className="text-[13px] text-white font-bold p-1.5"
          style={{
            backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
          }}
        >
          Stake Settings
        </h2>
        <div className="mt-2.5">
          <div className="grid grid-cols-2 gap-2">
            {stakes.map((stake) => (
              <div key={stake.id} className="flex rounded-md overflow-hidden">
                <div className="w-1/2 bg-[#108098] text-white p-2 text-center flex items-center justify-center">
                  {stake.buttonValue}
                </div>
                <input
                  type="text"
                  value={stake.newValue}
                  onChange={(e) => handleInputChange(stake.id, e?.target.value)}
                  className="w-1/2 p-2 text-center border border-gray-300 focus:outline-none focus:ring-0 focus:bg-transparent focus:overflow-hidden"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="submit"
              className="w-full sm:w-32 bg-[#15803d] text-white font-bold py-2 rounded-md  focus:outline-none focus:shadow-outline flex items-center justify-center"
            >
              <span className="mr-2">SAVE</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-32 bg-red-700 text-white font-bold py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:shadow-outline flex items-center justify-center"
            >
              <span className="mr-2">CANCEL</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
import { useOutletContext } from "react-router-dom";
import GameSection from "../../components/GameSection";
import JackpotSection from "../../components/JackpotSection";

const SportsPage = () => {
  const { onOpenLogin } = useOutletContext() || {};

  return (
    <div className="flex flex-col w-full p-2">
      <div className="bg-gradient-to-r from-[#003da5] to-[#005bf8] text-white p-3 rounded-xl mb-3 shadow-sm">
        <h2 className="text-base font-extrabold uppercase">JSB77 Sports & Cricket</h2>
        <p className="text-[11px] text-blue-100">Live odds on IPL, BPL, Premier League & Tennis</p>
      </div>
      <JackpotSection />
      <GameSection onSelectGame={() => onOpenLogin && onOpenLogin()} />
    </div>
  );
};

export default SportsPage;

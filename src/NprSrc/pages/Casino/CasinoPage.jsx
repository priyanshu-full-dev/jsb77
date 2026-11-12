import { useOutletContext } from "react-router-dom";
import GameSection from "../../components/GameSection";
import JackpotSection from "../../components/JackpotSection";

const CasinoPage = () => {
  const { onOpenLogin } = useOutletContext() || {};

  return (
    <div className="flex flex-col w-full p-2">
      <div className="bg-gradient-to-r from-[#003da5] via-[#103d96] to-[#003da5] text-white p-3 rounded-xl mb-3 shadow-sm">
        <h2 className="text-base font-extrabold uppercase">Live Casino & Slot Games</h2>
        <p className="text-[11px] text-blue-100">Evolution, Pragmatic Play, Jili, Sexy Baccarat & Spribe</p>
      </div>
      <JackpotSection />
      <GameSection onSelectGame={() => onOpenLogin && onOpenLogin()} />
    </div>
  );
};

export default CasinoPage;

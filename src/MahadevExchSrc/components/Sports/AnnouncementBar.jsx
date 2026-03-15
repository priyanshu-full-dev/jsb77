import { FaBullhorn } from "react-icons/fa";

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-[#2c2c2c]  flex items-center h-[42px]">
      <div className="flex items-center px-3 text-white">
        <FaBullhorn className="text-[20px] mr-2 rotate-[-20deg]" />
      </div>

      <div className="flex-1 overflow-hidden">
        <marquee
          behavior="scroll"
          direction="left"
          scrollAmount="5"
          className="text-white text-[12px] mt-1 tracking-[0.5px]"
        >
          JD VOLLEYBALL BETS HAVE STARTED IN OUR EXCHANGE. | PLEASE CHECK OUR
          LATEST SPORTS MARKETS AND ENJOY LIVE BETTING.
        </marquee>
      </div>
    </div>
  );
};

export default AnnouncementBar;

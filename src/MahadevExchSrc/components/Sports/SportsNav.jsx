import { NavLink } from "react-router-dom";

const sports = [
  { name: "ক্রিকেট", slug: "cricket", icon: "/SportsIcon/cricket.svg" },
  { name: "ফুটবল", slug: "soccer", icon: "/SportsIcon/soccer.svg" },
  { name: "টেনিস", slug: "tennis", icon: "/SportsIcon/tennis.svg" },
  { name: "গেমস", slug: "games", icon: "/SportsIcon/games-white.svg" },
  { name: "আইস হকি", slug: "ice-hockey", icon: "/SportsIcon/ice_Hockey.svg" },
  { name: "ব্যাডমিন্টন", slug: "badminton", icon: "/SportsIcon/badminton.svg" },
  { name: "ভলিবল", slug: "volleyball", icon: "/SportsIcon/volleyball.svg" },
  { name: "টেবিল টেনিস", slug: "table-tennis", icon: "/SportsIcon/table_Tennis.svg" },
];

const SportsNav = ({ type = "inplay" }) => {
  return (
    <div
      className="w-full border-b border-[#ffffff22]"
      style={{
        background: "#00723B",
        minHeight: "48px",
        boxShadow: "inset 0 5px 10px rgba(0,0,0,.2)",
      }}
    >
      <div className="flex overflow-x-auto whitespace-nowrap hide-scrollbar">
        {sports.map((sport) => (
          <NavLink
            key={sport.slug}
            to={`/sports/${sport.slug}/${type}`}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center 
               py-1.5 px-3 text-white text-[10px] tracking-[1px]
              border-r border-[#ffffff33]
              `
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={sport.icon}
                  alt={sport.name}
                  className="w-[20px] h-[20px] object-contain"
                />

                <span className="mt-1 text-[8px]">{sport.name}</span>

                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SportsNav;
import { NavLink, useParams } from "react-router-dom";

const tabs = [
  { type: "inplay", label: "IN-PLAY" },
  { type: "today", label: "TODAY" },
  { type: "tomorrow", label: "TOMORROW" },
];

const SportsTabs = () => {
  const { sport } = useParams();

  return (
    <div className="flex  justify-around px-6 pb-1 pt-1 bg-[#00723B] text-white">

      {tabs.map((tab) => (
        <NavLink
          key={tab.type}
          to={`/sports/${sport}/${tab.type}`}
          className={({ isActive }) =>
            `text-center py-1.5 text-[15px] font-extrabold
            ${
              isActive
                ? "border-b-[3px] border-white"
                : ""
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}

    </div>
  );
};

export default SportsTabs;
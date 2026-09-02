import { NavLink, useParams } from "react-router-dom";
import { t } from "../../utils/language";

const getTabs = () => [
  { type: "inplay", label: t("In-Play", "লাইভ") },
  { type: "today", label: t("Today", "আজ") },
  { type: "tomorrow", label: t("Tomorrow", "আগামীকাল") },
];

const SportsTabs = () => {
  const { sport } = useParams();

  return (
    <div className="flex  justify-around px-6 pb-1 pt-1 bg-[#00723B] text-white">

      {getTabs().map((tab) => (
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
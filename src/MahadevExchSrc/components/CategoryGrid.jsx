import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { categories } from "../data/categories";
import { isPort5177 } from "../utils/language";

const CategoryGrid = () => {
  const navigate = useNavigate();
  const isEnglish = isPort5177();

  return (
    <div className="grid grid-cols-3 gap-2.5 px-3 mt-4">
      {categories.map((item, i) => (
        <CategoryCard
          key={i}
          title={isEnglish ? item.title : item.bn}
          icon={item.icon}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;

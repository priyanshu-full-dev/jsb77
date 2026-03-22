import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { categories } from "../data/categories";

const CategoryGrid = () => {

  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2.5 px-3 mt-4">
      {categories.map((item, i) => (
        <CategoryCard
          key={i}
          title={item.title}
          icon={item.icon}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
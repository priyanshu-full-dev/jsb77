const CategoryCard = ({ title, icon: Icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
      h-[99px]
      bg-[#272727]
      border
      border-[rgba(255,255,255,0.2)]
      rounded-[10px]

gap-1
      flex
      flex-col
      justify-center
      items-center
      shadow-[2px_2px_3px_rgba(0,0,0,0.5)]
      "
    >
      <Icon className="text-white mb-1" />

      <p
        className="
        text-[13.5px]
        font-bold
        leading-[22px]
        uppercase
        text-white
        tracking-wide
        "
      >
        {title}
      </p>
    </div>
  );
};

export default CategoryCard;

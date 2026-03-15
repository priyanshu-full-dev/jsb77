const TrendingCard = ({image,title}) => {
  return (
    <div className="rounded-xl overflow-hidden relative">
      <img
        src={image}
        className="w-full h-[180px] object-cover"
      />

      <div className="absolute bottom-2 left-2 text-white font-bold text-lg">
        {title}
      </div>
    </div>
  );
};

export default TrendingCard;
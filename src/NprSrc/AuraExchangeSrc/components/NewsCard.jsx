import { useNavigate } from "react-router-dom";

export default function NewsCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/news", { state: item })}
      className="flex gap-3 p-3 border-b border-gray-300 cursor-pointer hover:bg-gray-50"
    >
      {/* Image */}
      <img
        src={item.url}
        alt="news"
        className="w-[112px] h-[140px] object-cover rounded-md flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1">
        <h2 className="font-bold text-[14px] text-[#212529] leading-tight  line-clamp-2">
          {item.title}
        </h2>

        <p className="text-gray-600 text-[13px] mt-1 line-clamp-5">
          {item.description?.replace(/\r\n/g, " ")}
        </p>
      </div>
    </div>
  );
}

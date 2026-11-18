import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";



export default function NewsDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div>No Data</div>;

  return (
    <div className="min-h-screen bg-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5  border-b ">
        <button onClick={() => navigate(-1)}>
          <FaArrowCircleLeft size={20}/>
        </button>
        <span className="text-sm text-[#212529] flex items-center gap-1">
          <FaRegCalendarAlt />
{new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}
        </span>
      </div>

      {/* Image with overlay */}
      <div className="relative !rounded overflow-hidden  px-3 py-2 pt-0">
        <img
          src={state.url}
          alt="news"
          className="w-full h-[320px] rounded-md"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-black/85 text-white p-2 text-[13px] font-normal rounded-b-md mx-3">
          {state.title}
        </div>
      </div>

      {/* Content */}
      <div className=" text-sm text-gray-800 leading-relaxed px-3 py-2">
        {state.description}
      </div>
    </div>
  );
}
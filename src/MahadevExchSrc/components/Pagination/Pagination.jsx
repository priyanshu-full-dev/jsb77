import React from "react";
import { useSelector } from "react-redux";
import { selectSite } from "../../../utils/helper/commonSelectors";


export default function Pagination({ page, totalPages, setPage }) {
  if (!totalPages || totalPages < 2) return null;

  const topHeaderColor = useSelector(selectSite())?.headerColor;

  const windowSize = 5; 
  let startPage = Math.max(1, page - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pages = [...Array(endPage - startPage + 1)].map((_, i) => startPage + i);

  return (
    <div className="flex justify-center items-center  gap-2 p-3">
      {/* Prev Button */}
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-transform duration-200 ${
          page === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border shadow"
        }`}
        style={
          page === 1
            ? {}
            : {
                backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                color: "white",
              }
        }
      >
        ⬅
      </button>

      {/* Page Numbers */}
      {pages.map((pageNum) => {
        const isActive = page === pageNum;
        return (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-200 ${
              isActive ? "shadow-lg" : "bg-white text-gray-700 border shadow"
            }`}
            style={
              isActive
                ? {
                    backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                    color: "white",
                  }
                : {}
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundImage = `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`;
                e.currentTarget.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundImage = "";
                e.currentTarget.style.color = "";
              }
            }}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-transform duration-200 ${
          page === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border shadow"
        }`}
        style={
          page === totalPages
            ? {}
            : {
                backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
                color: "white",
              }
        }
      >
        ➡
      </button>
    </div>
  );
}

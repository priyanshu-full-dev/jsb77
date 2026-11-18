import React, { useMemo } from "react";
import { FaMicrophone } from "react-icons/fa";
import { useSelector } from "react-redux";

const parseNews = (newsHTML) => {
  if (typeof window === "undefined") return { time: "", text: newsHTML };

  const div = document.createElement("div");
  div.innerHTML = newsHTML;
  const span = div.querySelector(".news-time");
  const time = span?.textContent || "";
  span?.remove();
  const text = div.textContent?.trim() || "";
  return { time, text };
};

const News = () => {
  const siteNews = useSelector((state) => state?.site?.siteDetails?.news);


  const domainName =
    typeof window !== "undefined" ? window.location.host : "our site";


  const parsedNews = useMemo(() => {
    return (siteNews || []).map((item) => parseNews(item));
  }, [siteNews]);

  return (
    <div className="h-[22px] w-full bg-[linear-gradient(-180deg,#2E4B5E_0%,#243A48_82%)] flex items-center text-white">
      <div className="h-[100%] bg-[linear-gradient(-180deg,#274253_0%,#0f191f_82%)] flex items-center gap-0.5 px-1">
        <FaMicrophone className="text-white text-[11.5px]" />
        <p className="text-[11.5px] font-bold">News</p>
      </div>

      <marquee className="w-full text-[12px] font-bold">
        {parsedNews.length > 0 ? (
          <>
            {parsedNews.map((item, index) => (
              <div key={index} className="mr-4 inline-block">
                <span className="italic text-[#1c2834] bg-[#6ac2ff] px-2 py-[1px] rounded mr-2">
                  {item.time}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </>
        ) : (
          <p>
           Ball by Ball Started in Our Exchange
          </p>
        )}
      </marquee>
    </div>
  );
};

export default News;

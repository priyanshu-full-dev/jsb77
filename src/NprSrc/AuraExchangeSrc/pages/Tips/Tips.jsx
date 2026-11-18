import React, { useEffect, useState } from "react";
import axios from "axios";
import NewsCard from "../../components/NewsCard";

let newsCache = null;

export default function Tips() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (newsCache) {
          setNews(newsCache);
          return;
        }

        const response = await axios.post(
          "https://aura444.com/api/exchange/tips/tipsPreviewList"
        );
        console.log({response});
        

        const result = response?.data?.data?.preview || [];
        console.log({result});
        

        newsCache = result;
        setNews(result);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 py-2 px-2 rounded">
      <div className="max-w-md mx-auto bg-white rounded-md border border-gray-300 border-b">
        <h1 className="text-lg font-bold px-3 py-2 ">
          NEWS
        </h1>

        {news.map((item, index) => (
          <NewsCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
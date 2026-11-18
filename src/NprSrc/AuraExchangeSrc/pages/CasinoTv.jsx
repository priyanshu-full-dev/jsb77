import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CasinoTV = () => {
  const { eventId } = useParams();

  const [tvUrl, setTvUrl] = useState("");

  useEffect(() => {
    let timer;

    const loadTV = async () => {
      try {
        const response = await fetch(
          `https://api.professor.monster/api/v4/casino/tv/${eventId}/embed`,
          {
            method: "POST",
          },
        );

        const result = await response.json();

        if (result?.iframeUrl) {
          setTvUrl(result.iframeUrl);

          timer = setTimeout(
            loadTV,
            Math.max((result.expiresIn - 300) * 1000, 60000),
          );
        }
      } catch (err) {
        console.error("TV Load Error:", err);
      }
    };

    if (eventId) {
      loadTV();
    }

    return () => clearTimeout(timer);
  }, [eventId]);

  return (
    <iframe
      src={tvUrl}
      allow="autoplay; fullscreen; picture-in-picture"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
      title="Casino TV"
    />
  );
};

export default CasinoTV;

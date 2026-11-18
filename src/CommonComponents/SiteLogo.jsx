import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSiteLogo, selectSiteName } from "../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../utils/helper/generatePresignedUrl";

const SiteLogo = ({
  s3Key,             
  className = "sm:h-16 h-14",
  to = "/",
  alt = typeof window !== "undefined" ? window.location.hostname : "", 
  defaultSrc = "",  
}) => {
  const [logoUrl, setLogoUrl] = useState("");
  const siteLogo = useSelector(selectSiteLogo());
  const siteName = useSelector(selectSiteName());

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const storageKey = "siteLogo";
        const storageTimestampKey = "siteLogoTimestamp";

        const cachedLogo = localStorage.getItem(storageKey);
        const cachedTime = localStorage.getItem(storageTimestampKey);

        const isExpired =
          !cachedTime || Date.now() - parseInt(cachedTime, 10) > 10 * 60 * 1000; // 10 min expiry

        if (cachedLogo && !isExpired) {
          // Use cached logo
          setLogoUrl(cachedLogo);
          return;
        }

        // Else fetch new logo
        const key = s3Key || siteLogo;
        if (key) {
          const presigned = await generatePresignedUrl(key);
          setLogoUrl(presigned);

          // Save in localStorage with timestamp
          localStorage.setItem(storageKey, presigned);
          localStorage.setItem(storageTimestampKey, Date.now().toString());
        }
      } catch (error) {
        console.error("Error loading site logo:", error);
      }
    };

    fetchLogo();
  }, [s3Key, siteLogo]);

  if (!logoUrl && !defaultSrc) return null;

  return (
    <Link to={to}>
      <img
        src={logoUrl || defaultSrc}
        alt={alt || siteName || "Site Logo"}
        className={`${className} xs:max-w-[115px] sm:max-w-[140px] md:max-w-[155px] xl:max-w-[165px] object-contain`}
        loading="lazy"
      />
    </Link>
  );
};

export default SiteLogo;

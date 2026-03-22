import { FaWhatsapp } from "react-icons/fa";
import { selectSite } from "../../utils/helper/commonSelectors";
import { useSelector } from "react-redux";

const WhatsAppFloat = () => {
  const siteData = useSelector(selectSite());

  if (!siteData?.whatsappSupport) return null;

  return (
    <a
      href={`https://wa.me/${siteData?.whatsappSupport}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-3 bottom-24 z-50"
    >
      <div className="bg-white p-2 rounded-full shadow-lg relative">
        <FaWhatsapp className="text-green-500 text-2xl" />

        <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></span>
      </div>
    </a>
  );
};

export default WhatsAppFloat;

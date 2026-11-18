import { useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { selectSiteBanners } from "../../../../utils/helper/commonSelectors";
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";

export default function HomeCarousel({ isMobile }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false); // Added loading state

    const siteBanners = useSelector(selectSiteBanners()); // Renamed to avoid conflict

    const fetchBanners = async () => {
        setLoading(true);
        try {
            if (Array.isArray(siteBanners)) {
                const presignedUrls = await Promise.all(
                    siteBanners.map((banner) =>
                        generatePresignedUrl(banner)
                    )
                );
                setBanners(presignedUrls);
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            // toast.error("Failed to load banners.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (siteBanners) {
            fetchBanners();
        }
    }, [siteBanners]);


    if (loading) {
        return <div className="w-full min-h-[100px] bg-black">

        </div>
    }
    return (
        banners.length > 0 && <Carousel
            swipeable={true}
            showThumbs={false}
            infiniteLoop={true}
            useKeyboardArrows
            autoPlay={true}
            showStatus={false}
            showArrows={!isMobile}
            showIndicators={!isMobile}
            renderArrowPrev={(onClickHandler, hasPrev) =>
                hasPrev && (
                    <button
                        type="button"
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 text-white z-10"
                        onClick={onClickHandler}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )
            }
            renderArrowNext={(onClickHandler, hasNext) =>
                hasNext && (
                    <button
                        type="button"
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-white z-10"
                        onClick={onClickHandler}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )
            }
        >
            {banners.map((item, i) => (
                <div key={i} style={{ height: '100%', minHeight: '100px' }}>
                    <img
                        src={item}
                        alt={`Banner${i}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            ))}
        </Carousel>

    );
}

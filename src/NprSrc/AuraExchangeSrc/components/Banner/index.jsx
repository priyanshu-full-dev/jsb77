import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import { useNavigate } from "react-router-dom";

const BannerSlider = ({ images = [] }) => {
  const navigate = useNavigate();

  if (!images?.length) return null;

  return (
    <div
      className="
        relative
        clear-both
        bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_15%,rgba(255,255,255,0.2)_40%,rgba(255,255,255,0)_70%)]
      "
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={images.length > 1}
        className="bannerSwiper"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              className="w-full cursor-pointer block"
              onClick={() =>
                navigate(img?.path ? `/${img.path}` : "/home")
              }
              src={img?.url}
              alt={`banner-${i}`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "auto"}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
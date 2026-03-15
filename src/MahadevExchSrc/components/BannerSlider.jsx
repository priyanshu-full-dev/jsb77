import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BannerSlider = ({ images = [] }) => {
  if (!images.length) return null;

  return (
    <div
      className="
      px-3
      mt-1
      relative
      clear-both
      bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_15%,rgba(255,255,255,0.2)_40%,rgba(255,255,255,0)_70%)]
      "
    >
      <Swiper
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={images.length > 1}
        className="bannerSwiper"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt={`banner-${i}`}
              className="w-full h-[200px] object-cover rounded-md"
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
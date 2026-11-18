import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGradientColor,
  usePrimaryColor,
  usePrimaryTextColor,
} from "../../hooks/useThemeColors";

function ProviderTabs2({
  providers,
  activeIndex,
  onClick,
  scrollRef,
  itemRefs,
  topBarColor,
  headerColor,
}) {
  const gradiantcolor = useGradientColor();
  const PrimaryColor = usePrimaryColor();
  const PrimaryTextColor = usePrimaryTextColor();

  const { permissionList } = useSelector(
    (state) => state.casinoPermission
  );

  const lockedProviders =
    permissionList
      ?.filter((p) => p.type === "provider")
      ?.map((p) => p.provider?.toLowerCase()) || [];

  const filteredProviders = providers.filter(
    ({ provider }) =>
      !lockedProviders.includes(provider?.name?.toLowerCase())
  );

  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex, filteredProviders.length]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-nowrap w-full overflow-x-auto overflow-y-hidden scrollbar-visible"
      style={{
        width: "100%",
        background: PrimaryColor,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {filteredProviders.map(({ provider }, i) => (
        <a
          key={provider?.name || i}
          href="#"
          role="button"
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onClick={(e) => {
            e.preventDefault();
            onClick(i, e);
            requestAnimationFrame(() => {
              itemRefs.current[i]?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            });
          }}
          className="flex-shrink-0 min-h-5 flex justify-center items-center rounded-t-md text-sm px-1 font-bold transition-all duration-150 cursor-pointer"
        >
          <div
            className="flex items-center h-[clamp(38px,4.5vw,42px)] px-2.5 rounded-t-md mt-1"
            style={{
              background: i === activeIndex ? gradiantcolor : "transparent",
              color: i === activeIndex ? "white" : PrimaryTextColor,
            }}
          >
            <span className="text-[14px] capitalize text-nowrap">
              {provider?.name}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

export default ProviderTabs2;
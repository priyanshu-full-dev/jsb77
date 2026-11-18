import { useGradientColor, usePrimaryColor, usePrimaryTextColor, useSecondaryTextColor } from "../../hooks/useThemeColors";

function ProviderTabs({ providers, activeIndex, onClick, scrollRef, itemRefs, topBarColor, headerColor }) {
    const getGradient = (start, end) => `linear-gradient(180deg, ${start} 0%, ${end} 100%)`;
    const gradiantcolor = useGradientColor()
  const PrimaryColor = usePrimaryColor()
    const PrimaryTextColor = usePrimaryTextColor()
    const SecondaryTextColor = useSecondaryTextColor()
    return (
        <div
            ref={scrollRef}
            className="flex pl-[1px] flex-nowrap pr-[100px] scrollbar-visible"
            style={{
                height: 'clamp(38px, 4.2vw, 42px)',
                width: '100vw',
                background: PrimaryColor,
                overflowX: 'scroll',
                overflowY: 'hidden',
            }}
        >
            {providers.map(({ provider }, i) => (
                <a
                    key={i}
                    href="#"
                    role="button"
                    ref={el => itemRefs.current[i] = el}
                    onClick={(e) => onClick(i, e)}
                    className="min-h-5 flex justify-center items-center rounded-t-md text-sm px-1 font-bold transition-all duration-150"
                >
                    <div
                        className="flex items-center h-[clamp(38px,4.5vw,42px)] px-3 rounded-t-md mt-2"
                        style={{
                            background: i === activeIndex ? gradiantcolor : 'transparent',
                            color: i === activeIndex ? "white" : PrimaryTextColor,
                        }}
                    >
                        <span className="text-[14px] capitalize">{provider?.name?.toUpperCase()}</span>
                    </div>
                </a>
            ))}
        </div>
    );
}

export default ProviderTabs;

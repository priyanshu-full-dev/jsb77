import { Search } from "lucide-react";
import { useGradientColor, usePrimaryColor, usePrimaryTextColor, useSecondaryTextColor } from "../../hooks/useThemeColors";

function CategoryTabs({ categories, activeIndex, onClick, scrollRef, itemRefs, topBarColor }) {
    const getGradient = (start, end) => `linear-gradient(180deg, ${start} 0%, ${end} 100%)`;
    const gradiantcolor = useGradientColor()
    const PrimaryTextColor = usePrimaryTextColor()
    const SecondaryTextColor = useSecondaryTextColor()
  const PrimaryColor = usePrimaryColor()

    return (
        <div
            ref={scrollRef}
            className="flex flex-nowrap pr-[100px]  scrollbar-visible"
            style={{
                width: '100vw',
                background: getGradient('#000000', '#000000'),
                overflowX: 'scroll',
                overflowY: 'hidden',
            }}
        >
            {categories.map((category, i) => (
                <a
                    key={i}
                    href="#"
                    role="button"
                    ref={el => itemRefs.current[i] = el}
                    onClick={(e) => onClick(i, e)}
                    className="min-h-5 flex justify-center items-center rounded-t-md text-sm px-1 font-bold transition-all duration-150"
                >
                    <div
                        className="flex items-center h-[clamp(32px,4.5vw,32px)] px-3 rounded-t-md mt-2"
                        style={{
                            background: i === activeIndex ? PrimaryColor : 'transparent',
                            color: i === activeIndex ? PrimaryTextColor:"white",
                        }}
                    >
                        <span className="text-[12px] capitalize whitespace-nowrap font-bold">
                            {category?.toUpperCase().replaceAll('_', ' ')}
                        </span>
                    </div>
                </a>
            ))}
            
        </div>
    );
}

export default CategoryTabs;

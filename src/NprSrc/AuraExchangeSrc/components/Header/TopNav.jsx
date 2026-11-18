import { useEffect, useState } from 'react'
import HomeCarousel from '../HomeCarousel'
import SiteNavigation from './SiteNavigation';

function TopNav({headerColor, location}) {
      const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
      useEffect(() => {
          const updateScreenSize = () => {
              setIsMobile(window.innerWidth <= 768);
          };
  
          window.addEventListener("resize", updateScreenSize);
  
          return () => {
              window.removeEventListener("resize", updateScreenSize);
          };
      }, []);
  return (
    <div >
    {isMobile && location?.pathname && "/fullmarket".includes(location.pathname) && <HomeCarousel isMobile={isMobile} />}
    <SiteNavigation headerColor={headerColor} location={location} />

    </div>
  )
}

export default TopNav
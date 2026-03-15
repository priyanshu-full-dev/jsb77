import { Outlet } from 'react-router-dom'
import Header from "../../AuraExchangeSrc/components/Header"
import MobileBottomNavbar from '../../AuraExchangeSrc/components/Header/MobileBottomNavbar'

function DiamondCasinoPageLayout() {

    return (
        <div className="" style={{ display: "flex", flexDirection: "column" }}>
            <Header />
            <div className='h-[56px] w-full' />

            <div style={{ height: "100%", overflowY: "auto", paddingBottom: "100px" }}>

                <Outlet />
            </div>

            <div className='w-full mt-4' style={{ position: "fixed", bottom: 0, }} >
                <MobileBottomNavbar />
            </div>
        </div>
    )
}

export default DiamondCasinoPageLayout
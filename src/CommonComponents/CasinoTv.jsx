import React from 'react';
import { useParams } from 'react-router-dom';

function CasinoTv() {
    const { gameId } = useParams();

    return (
        <div
            id="full-market-live-tv"
            className="w-full h-screen bg-[#141435] flex justify-center items-center overflow-hidden"
        >
            <div className="relative w-full max-w-[1920px] aspect-video">
                <iframe
                    src={`https://live.oldd247.com/swiftdizire/?id=${gameId}&muted`}
                    allow="autoplay; fullscreen"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export default CasinoTv;

import React from 'react';

const WinPopup = ({result,label}) => {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="px-5 py-2.5 text-white text-[12px] font-semibold
                      bg-gradient-to-r from-orange-500 to-red-500
                      rounded-tl-3xl rounded-br-3xl shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                {label} {result?.win !==0 ? `WIN` : ''}
            </div>
        </div>
    );
};

export default WinPopup;

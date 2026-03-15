import React from "react";



const SplitButton = ({
    label,
    onClickMain,
    onClickInfo,
}) => {
    return (
        <div className="flex w-fit overflow-hidden text-white text-sm font-semibold">
            {/* Left main button */}
            <button
                onClick={onClickMain}
                className="bg-gradient-to-b from-[#F26522] to-[#F7931E] px-4 py-2"
            >
                {label}
            </button>

            {/* Info button */}
            <button
                onClick={onClickInfo}
                className="bg-[#F7931E] w-[40px] h-[40px] flex items-center justify-center rounded-tr-2xl"
            >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    i
                </div>
            </button>
        </div>
    );
};

export default SplitButton;

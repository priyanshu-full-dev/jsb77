import { useEffect } from "react";

const Popup1 = ({ title = "", isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        // Clean up on unmount (important!)
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                style={{
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
                className={`fixed top-1/2 left-1/2 z-50 w-11/12 max-w-md bg-white rounded-md shadow-lg overflow-hidden transform transition-all duration-300 ${
                    isOpen
                        ? "opacity-100 scale-100 translate-x-[-50%] translate-y-[-50%]"
                        : "opacity-0 scale-90 translate-x-[-50%] translate-y-[-45%]"
                }`}
            >
                {/* Header */}
                <div
                    className="w-full h-[50px] bg-black"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "linear-gradient(180deg, #474747 0%, #070707 100%)",
                    }}
                >
                    <p
                        className="bg-transparent text-[#FFB200] text-[18px]"
                        style={{ fontWeight: 800 }}
                    >
                        {title}
                    </p>
                </div>

                {/* Content */}
                <div
                    style={{ height: "calc(80vh - 100px)", overflowY: "auto" }}
                    className="policy-content px-4 py-2"
                >
                    {children}
                </div>

                {/* Footer */}
                <div className="w-full flex justify-center border-t py-2">
                    <button
                        onClick={onClose}
                        className="min-w-[50%] bg-black text-yellow-100 py-2 px-6 rounded"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </>
    );
};

export default Popup1;

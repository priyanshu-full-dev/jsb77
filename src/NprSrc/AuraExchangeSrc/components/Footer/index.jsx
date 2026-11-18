import { useState } from "react";
import AuraPolicyModal from "./AuraPolicyModal";

const Footer = () => {
  const [modalOpen, setModalOpen] = useState("");

  const handleDownload = (e) => {
    e.preventDefault();
    const link = document.createElement("a");
    link.href = "/aura/androidapk.png";
    link.download = "aura.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Main Footer Wrapper */}
      <div className="col-md-12 footerDiv mobile-android-height w-full bg-transparent text-black max-[574px]:!h-[150px]">
        <div className="inner-footer m-[5px] pt-[6px] max-[426px]:m-0 max-[426px]:mt-[5px] max-[426px]:pt-[6px] min-[992px]:border-t min-[992px]:border-[#d5d5d5] min-[992px]:mt-[49px] min-[992px]:mb-[39px] min-[992px]:pt-[6px]">
          {/* Policy Links Section */}
          <div className="support-wrap block text-center text-[13px] leading-[22px] my-[10px] text-black px-2">
            <dl className="support-mail inline-block mr-0 min-[427px]:mr-[10px] mb-[6px] p-0 text-center">
              {/* Privacy Policy */}
              <a
                onClick={() => setModalOpen("Privacy Policy")}
                className="rules-btn-home text-[12px] min-[360px]:text-[14px] text-black no-underline cursor-pointer hover:underline select-none whitespace-nowrap"
              >
                {" "}Privacy Policy{" "}
              </a>

              <span className="mx-[6px] min-[360px]:mx-[10px] select-none text-black">
                |
              </span>

              {/* Rules and Regulations (wraps between 'Rules and' and 'Regulations' on < 380px) */}
              <a
                onClick={() => setModalOpen("Rules and Regulations")}
                className="rules-btn-home text-[12px] min-[360px]:text-[14px] text-black no-underline cursor-pointer hover:underline select-none"
              >
                <span className="whitespace-nowrap"> Rules and</span>{" "}
                <br className="max-[379px]:block hidden" />
                <span className="whitespace-nowrap">Regulations </span>
              </a>

              <span className="mx-[6px] min-[360px]:mx-[10px] select-none text-black">
                |
              </span>

              {/* KYC */}
              <a
                onClick={() => setModalOpen("KYC")}
                className="rules-btn-home text-[12px] min-[360px]:text-[14px] text-black no-underline cursor-pointer hover:underline select-none whitespace-nowrap"
              >
                {" "}KYC{" "}
              </a>

              <span className="mx-[6px] min-[360px]:mx-[10px] select-none text-black">
                |
              </span>

              {/* Break between KYC and Terms on 380px-767px */}
              <br className="hidden min-[380px]:max-[767px]:block" />

              {/* Terms and Conditions (wraps between 'Terms and' and 'Conditions' on < 380px) */}
              <a
                onClick={() => setModalOpen("Terms and Conditions")}
                className="rules-btn-home text-[12px] min-[360px]:text-[14px] text-black no-underline cursor-pointer hover:underline select-none"
              >
                <span className="whitespace-nowrap"> Terms and</span>{" "}
                <br className="max-[379px]:block hidden" />
                <span className="whitespace-nowrap">Conditions </span>
              </a>

              <span className="mx-[6px] min-[360px]:mx-[10px] select-none text-black">
                |
              </span>

              {/* Responsible Gambling */}
              <a
                onClick={() => setModalOpen("Responsible Gambling")}
                className="rules-btn-home text-[12px] min-[360px]:text-[14px] text-black no-underline cursor-pointer hover:underline select-none whitespace-nowrap"
              >
                {" "}Responsible Gambling{" "}
              </a>
            </dl>
          </div>

          {/* Android App Download Button Section */}
          <div className="extra-wrap hidden max-[992px]:flex max-[992px]:justify-center">
            <div className="appdl-link-android block">
              <a
                href="/aura/androidapk.png"
                onClick={handleDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block cursor-pointer"
              >
                <img
                  alt="Download Android App"
                  src="/aura/androidapk.png"
                  className="max-[992px]:w-[41.33333vw] max-[992px]:max-w-[200px] h-auto rounded-[8px] object-contain cursor-pointer active:scale-95 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modal Dialog */}
      <AuraPolicyModal
        isOpen={Boolean(modalOpen)}
        title={modalOpen}
        onClose={() => setModalOpen("")}
      />
    </>
  );
};

export default Footer;

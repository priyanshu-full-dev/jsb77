import { useState } from "react";
import ChangePasswordModal from "./change-password-modal";
import { useSelector } from "react-redux";
import { getUserData } from "../../../../utils/helper/commonSelectors";

const MyProfile = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const UserData = useSelector(getUserData());

  const handleEditPassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPasswordModalOpen(false);
  };

  return (
    <>
      <div className=" px-1 sm:p-2 max-w-full mt-3">
        <div className="border border-[#cdd5dc] rounded-[4px] bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[linear-gradient(-180deg,_#2E4B5E_0%,_#243A48_82%)] px-2 py-2">
            <h1 className="text-white text-[13px] font-bold tracking-wide m-0">
              Account Details
            </h1>
          </div>

          {/* Details List */}
          <div className="bg-white">
            {/* Name */}
            <div className="border-b border-[#dcdcdc] px-3.5 py-2">
              <label className="block text-black font-bold text-[14px]">
                Name
              </label>
            </div>
            <div className="border-b border-[#dcdcdc] px-3.5 py-2 text-black text-[14px]">
              {UserData?.userName || UserData?.name || "0"}
            </div>

            {/* Commission */}
            <div className="border-b border-[#dcdcdc] px-3.5 py-2">
              <label className="block text-black font-bold text-[14px]">
                Commission
              </label>
            </div>
            <div className="border-b border-[#dcdcdc] px-3.5 py-2 text-black text-[14px]">
              {UserData?.commission !== undefined && UserData?.commission !== null && UserData?.commission !== ""
                ? UserData.commission
                : "0"}
            </div>

            {/* Exposure Limit */}
            <div className="border-b border-[#dcdcdc] px-3.5 py-2">
              <label className="block text-black font-bold text-[14px]">
                Exposure Limit
              </label>
            </div>
            <div className="border-b border-[#dcdcdc] px-3.5 py-2 text-black text-[14px]">
              {UserData?.exposureLimit !== undefined && UserData?.exposureLimit !== null && UserData?.exposureLimit !== ""
                ? UserData.exposureLimit
                : "0"}
            </div>

            {/* Password */}
            <div className="border-b border-[#dcdcdc] px-3.5 py-2">
              <label className="block text-black font-bold text-[14px]">
                Password
              </label>
            </div>
            <div className="border-b border-[#dcdcdc] px-3.5 py-2 flex items-center gap-6">
              <span className="text-black text-[14px] tracking-wider">
                **********
              </span>
              <button
                type="button"
                onClick={handleEditPassword}
                className="flex items-center gap-1 text-black font-bold text-[14px] hover:text-[#2E4B5E] transition-colors cursor-pointer"
              >
                <span>Edit</span>
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>

            {/* Bottom blank row */}
            <div className="h-8 px-3.5 py-2" />
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default MyProfile;

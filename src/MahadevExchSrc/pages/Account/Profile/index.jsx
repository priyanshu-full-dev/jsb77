import React from "react";
import { useSelector } from "react-redux";
import { getUserData, selectSite } from "../../../utils/helper/commonSelectors";
import profileimage from "../../../assets/images/profile_image.png";

export default function Profile() {
  const userData = useSelector(getUserData());
  const siteDetails = useSelector(selectSite());

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="bg-[#27a6c3] text-white text-center py-1.5 w-full shadow-lg">
        <h1 className="text-sm font-semibold tracking-wide">PROFILE</h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mt-[-14px] sm:mt-6 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-[350px_1fr] gap-6 p-6">
            {/* Left Profile Section */}
            <div className="flex flex-col items-center bg-gradient-to-b from-blue-100 to-white p-6 rounded-lg shadow-md border border-gray-300">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-400 shadow-md">
                <img src={profileimage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-700 tracking-wide">
                {userData?.userName || "NA"}
              </h2>
            </div>

            {/* Right Content Section */}
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-center text-[#6D081D] mb-4">
                Welcome to {siteDetails?.siteName}
              </h3>
              
              <div className="bg-gray-50 p-5 rounded-xl shadow-md border border-gray-300">
                <div className="grid grid-cols-2 text-sm gap-y-3">
                  <div className="font-semibold text-gray-600 border-b pb-2">User Id:</div>
                  <div className="font-semibold border-b pb-2">{userData?.userName || "NA"}</div>

                  <div className="font-semibold text-gray-600 border-b pb-2">Available Chips:</div>
                  <div className="font-semibold text-green-600 border-b pb-2">
                    {(userData?.availableBalance?.toFixed(0) - userData?.exposure?.toFixed(0)) || "NA"}
                  </div>

                  <div className="font-semibold text-gray-600 border-b pb-2">Exposure:</div>
                  <div className="font-semibold text-red-600 border-b pb-2">
                    {userData?.exposure?.toFixed(0) || "NA"}
                  </div>

                  <div className="font-semibold text-gray-600">Total Chips:</div>
                  <div className="font-semibold">{userData?.availableBalance?.toFixed(0) || "NA"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

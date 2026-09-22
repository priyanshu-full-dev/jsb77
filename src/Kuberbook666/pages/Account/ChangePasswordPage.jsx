import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUserPassword, updatePassword } from "../../../api/index";
import { getUserData, getUserId } from "../../../utils/helper/commonSelectors";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  // User details from Redux
  const user = useSelector(getUserData());
  const userId = useSelector(getUserId()) || user?._id || user?.id || "";
  const username =
    user?.userName ||
    user?.username ||
    user?.mobile ||
    user?.phone ||
    user?.name ||
    "";

  // Form State
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password Visibility States
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submitting state
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldPassword.trim()) {
      toast.error("Please enter your old password");
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error("Please enter your new password");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      toast.error("New password cannot be the same as your old password");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userName: username,
        username: username,
        mobile: user?.mobile || username,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        userId: userId,
      };

      let response;
      try {
        response = await updateUserPassword(payload);
      } catch (err) {
        // Fallback to updatePassword endpoint if updateUserPassword is not available
        try {
          response = await updatePassword(payload);
        } catch {
          throw err;
        }
      }

      if (response?.success || response?.status === 200 || response?.data?.success) {
        toast.success(
          response?.data?.message ||
            response?.message ||
            "Password changed successfully!"
        );
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate(-1);
        }, 1200);
      } else {
        toast.error(
          response?.data?.message ||
            response?.message ||
            "Failed to change password. Please verify your old password."
        );
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to change password. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.oldPassword.trim().length > 0 &&
    formData.newPassword.trim().length >= 6 &&
    formData.confirmPassword.trim().length >= 6 &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="flex flex-col transition-all ease-in-out duration-100">
      <div className="flex items-start justify-start w-full">
        {/* Desktop Left Sidebar Menu */}
        <div
          title="Menu"
          id="leftDeskSideBar"
          className="hidden lg:flex p-2 overflow-y-auto z-10 w-[20%] h-[calc(100dvh-120px)] sticky top-[54px] lg:top-[110px]"
        >
          <ul className="flex border border-ternary3 bg-bg_Quaternary-side overflow-x-hidden flex-col w-full bg-white shadow-sm rounded-lg">
            {/* Cricket */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Cricket/4"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.4414 1.55859C13.3601 -0.519531 10.0152 -0.519531 7.93389 1.55859L6.50529 2.98719C6.46779 3.02469 6.46779 3.09031 6.50529 3.12781L13.8722 10.4947C13.9097 10.5322 13.9753 10.5322 14.0128 10.4947L15.4414 9.06611C17.5195 6.9848 17.5195 3.63989 15.4414 1.55859Z"
                    fill="#C10931"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Cricket
                </span>
              </a>
            </li>

            {/* Football */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Football/1"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0C3.80588 0 0 3.80588 0 8.5C0 13.1941 3.80588 17 8.5 17C13.1941 17 17 13.1941 17 8.5C17 3.80588 13.1941 0 8.5 0Z"
                    fill="#1A56DB"
                  ></path>
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Football
                </span>
              </a>
            </li>

            {/* Tennis */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Tennis/2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8.5" cy="8.5" r="8.5" fill="#84CC16" />
                </svg>
                <span className="font-medium text-start text-text_Ternary-new">
                  Tennis
                </span>
              </a>
            </li>

            {/* Horse Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/horse-racing"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Horse Racing
                </span>
              </a>
            </li>

            {/* Greyhound Racing */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/greyhound-racing"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Greyhound Racing
                </span>
              </a>
            </li>

            {/* Sportsbook */}
            <li className="text-sm cursor-pointer py-4 text-nowrap whitespace-nowrap autoAnimate font-semibold w-full border-b hover:bg-bg_MenuHoverColor hover:scale-[102%]">
              <a
                className="flex w-full items-center h-full px-6 justify-start gap-3 text-gray-800 hover:text-black"
                href="/sports-page/Sportsbook/0"
              >
                <span className="font-medium text-start text-text_Ternary-new">
                  Sportsbook
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Center Main Content Area */}
        <div
          className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%]"
          style={{ minHeight: "calc(100dvh - 110px)" }}
        >
          {/* Mobile Top Header */}
          <div
            title="Change Password"
            className="sticky top-0 z-10 w-full bg-white h-max py-2.5 flex flex-col lg:hidden border-b border-gray-200 font-lato shadow-xs"
          >
            <div className="flex items-center gap-2 w-full pl-[13px] pr-2">
              <button
                onClick={() => navigate(-1)}
                className="relative overflow-hidden bg-gray-100 border border-gray-200 rounded w-[26px] h-[26px] flex items-center justify-center active:scale-95 transition"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                >
                  <path
                    d="M5.3673 11.2346L0 5.8673L5.3673 0.5L6.32 1.4527L1.90539 5.8673L6.32 10.2819L5.3673 11.2346Z"
                    fill="#8b0a24"
                  ></path>
                </svg>
              </button>
              <div className="flex-1 flex items-center justify-between">
                <h3 className="text-gray-900 text-base font-bold">
                  Change Password
                </h3>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div
            title="Change Password"
            className="p-3 sm:p-4 space-y-3 mx-2 my-2 rounded-xl bg-white shadow-xs border border-gray-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 font-lato">
                {/* 1. Old Password */}
                <div className="flex flex-col w-full">
                  <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold mb-1">
                    Old Password<span className="text-red-600">*</span>
                  </div>
                  <div className="relative">
                    <span className="px-3 absolute top-1/2 -translate-y-1/2 w-max text-[#8b0a24]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="16"
                        fill="#8b0a24"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <input
                      id="oldPassword"
                      placeholder="Old Password"
                      name="oldPassword"
                      className="block w-full focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg text-gray-900 text-sm pl-10 pr-10 transition"
                      autoComplete="current-password"
                      type={showOldPassword ? "text" : "password"}
                      value={formData.oldPassword}
                      onChange={handleChange}
                    />
                    <span className="px-2 absolute top-1/2 -translate-y-1/2 right-0">
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out cursor-pointer p-1 text-[#8b0a24]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          width="20"
                          viewBox="0 0 512 512"
                        >
                          <path
                            d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                            fill="none"
                            stroke="#8b0a24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="32"
                          ></path>
                          <circle
                            cx="256"
                            cy="256"
                            r="80"
                            fill="none"
                            stroke="#8b0a24"
                            strokeMiterlimit="10"
                            strokeWidth="32"
                          ></circle>
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>

                {/* 2. New Password */}
                <div className="flex flex-col w-full">
                  <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold mb-1">
                    New Password<span className="text-red-600">*</span>
                  </div>
                  <div className="relative">
                    <span className="px-3 absolute top-1/2 -translate-y-1/2 w-max text-[#8b0a24]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="16"
                        fill="#8b0a24"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <input
                      id="newPassword"
                      placeholder="New Password"
                      name="newPassword"
                      className="block w-full focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg text-gray-900 text-sm pl-10 pr-10 transition"
                      autoComplete="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    <span className="px-2 absolute top-1/2 -translate-y-1/2 right-0">
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out cursor-pointer p-1 text-[#8b0a24]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          width="20"
                          viewBox="0 0 512 512"
                        >
                          <path
                            d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                            fill="none"
                            stroke="#8b0a24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="32"
                          ></path>
                          <circle
                            cx="256"
                            cy="256"
                            r="80"
                            fill="none"
                            stroke="#8b0a24"
                            strokeMiterlimit="10"
                            strokeWidth="32"
                          ></circle>
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>

                {/* 3. Confirm Password */}
                <div className="flex flex-col w-full">
                  <div className="ml-1 text-gray-800 text-xs sm:text-sm font-bold mb-1">
                    Confirm Password<span className="text-red-600">*</span>
                  </div>
                  <div className="relative">
                    <span className="px-3 absolute top-1/2 -translate-y-1/2 w-max text-[#8b0a24]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="16"
                        fill="#8b0a24"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <input
                      id="repeatPassword"
                      placeholder="Confirm Password"
                      name="confirmPassword"
                      className="block w-full focus:outline-none focus:border-[#8b0a24] focus:ring-1 focus:ring-[#8b0a24] py-2.5 bg-[#f4f4f4] border border-gray-300 rounded-lg text-gray-900 text-sm pl-10 pr-10 transition"
                      autoComplete="new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <span className="px-2 absolute top-1/2 -translate-y-1/2 right-0">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out cursor-pointer p-1 text-[#8b0a24]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          width="20"
                          viewBox="0 0 512 512"
                        >
                          <path
                            d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                            fill="none"
                            stroke="#8b0a24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="32"
                          ></path>
                          <circle
                            cx="256"
                            cy="256"
                            r="80"
                            fill="none"
                            stroke="#8b0a24"
                            strokeMiterlimit="10"
                            strokeWidth="32"
                          ></circle>
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>

                {/* Buttons: Cancel and Save */}
                <div className="flex items-center justify-center mt-3 w-full gap-x-3">
                  <button
                    onClick={handleCancel}
                    className="inline-block leading-normal relative overflow-hidden transition duration-150 ease-in-out max-w-[180px] p-2.5 bg-white rounded-lg font-bold text-[#8b0a24] border border-[#8b0a24] hover:bg-gray-50 active:scale-95 cursor-pointer text-sm"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="leading-normal relative overflow-hidden transition duration-150 ease-in-out max-w-[180px] disabled:cursor-not-allowed p-2.5 bg-[#8b0a24] hover:bg-[#72081d] rounded-lg font-bold text-white border border-[#8b0a24] disabled:opacity-50 flex items-center justify-center cursor-pointer active:scale-95 text-sm shadow-md"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

ChangePasswordPage.Element = function Element() {
  return <ChangePasswordPage />;
};

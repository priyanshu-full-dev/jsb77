import { useState, useCallback } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  PhoneIcon,
  KeyIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSelector } from "react-redux";


import { FaSpinner, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { updateUserPassword } from "../../../../api";
import { selectSite } from "../../../../utils/helper/commonSelectors";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  disabled,
  placeholder,
  showToggle,
  showPassword,
  togglePassword,
  readOnly,
}) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-[13px] font-semibold mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        className={`w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        type={showPassword ? "text" : type}
        value={value}
        onChange={(e) => onChange(e?.target.value)}
        placeholder={placeholder}
        required
        disabled={disabled}
        readOnly={readOnly}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={togglePassword}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeOffIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
  </div>
);

export default function ChangePassword() {
  const userData = useSelector((state) => state?.user?.userData) || {};
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: userData.userName || "",
    oldPassword: "",
    mobile: userData.userName || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const topHeaderColor = useSelector(selectSite())?.headerColor;

  const handleChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const togglePassword = useCallback(
    (field) => () => {
      setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    []
  );

  const handleGetOtp = async () => {
    if (!formData.mobile) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setOtpLoading(true);
    try {
      // Simulate an API call to get OTP (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP sent to your mobile number!");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setFormData((prev) => ({
      ...prev,
      oldPassword: "",
      otp: "",
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password don't match");
      return;
    }

    if (isForgotPassword && !formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!isForgotPassword && !formData.oldPassword) {
      toast.error("Please enter your old password");
      return;
    }

    setLoading(true);
    try {
      let payload;
      if (isForgotPassword) {
        payload = {
          mobile: formData.mobile,
          otp: formData.otp,
          newPassword: formData.newPassword,
        };
      } else {
        payload = {
          userName: formData.userName,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        };
      }

      const response = await updateUserPassword(payload);
      toast.success(response.data.message || "Password changed successfully");
      setFormData({
        userName: userData.userName || "",
        oldPassword: "",
        mobile: userData.userName || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsForgotPassword(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-3">
      {loading && <>Loading...</>}
      <div className="bg-gray-100 rounded-t-lg">
        <h2
          className="text-sm font-bold text-white p-3 rounded-t-lg"
          style={{
            backgroundImage: `linear-gradient(180deg, ${topHeaderColor?.start}, ${topHeaderColor?.end})`,
          }}
        >
          Change Password
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-b-lg shadow-lg py-4 px-3 min-h-[450px] flex flex-col justify-between"
      >
        <div>
          {isForgotPassword ? (
            <>
              {/* Mobile Number Field */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <InputField
                    label="Mobile Number"
                    type="text"
                    value={formData.mobile}
                    onChange={handleChange("mobile")}
                    icon={PhoneIcon}
                    disabled={loading || otpLoading}
                    readOnly
                    placeholder="Enter your mobile number"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGetOtp}
                  className={`px-4 py-2.5 mt-2 text-[13px] text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 ${
                    otpLoading || loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={otpLoading || loading}
                >
                  {otpLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  ) : (
                    <FaCheck className="h-5 w-5" />
                  )}
                  {otpLoading ? "Sending..." : "Get OTP"}
                </button>
              </div>

              {/* OTP Field */}
              <InputField
                label="OTP"
                type="text"
                value={formData.otp}
                onChange={handleChange("otp")}
                icon={KeyIcon}
                disabled={loading}
                placeholder="Enter the OTP"
              />
            </>
          ) : (
            <>
              {/* Username Field */}
              <InputField
                label="Username"
                type="text"
                value={formData.userName}
                onChange={handleChange("userName")}
                icon={UserIcon}
                disabled={loading}
                readOnly
                placeholder="Enter your username"
              />

              {/* Old Password Field */}
              <InputField
                label="Old Password"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange("oldPassword")}
                showToggle
                showPassword={showPasswords.oldPassword}
                togglePassword={togglePassword("oldPassword")}
                disabled={loading}
                placeholder="Enter your old password"
              />

              {/* Forgot Password Button */}
              {/* <div className="mb-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#910707] hover:underline text-[15px] font-semibold"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div> */}
            </>
          )}

          {/* New Password Field */}
          <InputField
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={handleChange("newPassword")}
            showToggle
            showPassword={showPasswords.newPassword}
            togglePassword={togglePassword("newPassword")}
            disabled={loading}
            placeholder="Enter new password"
          />

          {/* Confirm Password Field */}
          <InputField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            showToggle
            showPassword={showPasswords.confirmPassword}
            togglePassword={togglePassword("confirmPassword")}
            disabled={loading}
            placeholder="Confirm new password"
          />
        </div>

        {/* Submit Button */}
        <div className="flex text-[13px] justify-center gap-3 mt-6 w-full">
          <button
            type="submit"
            className={`w-full bg-[#07662a] text-white font-bold py-2 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin h-5 w-5 text-white" />
            ) : (
              ""
            )}
            {loading ? "Updating..." : "Update"}
          </button>

          <Link
            to="/user"
            className={`w-full bg-red-700 text-white font-bold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 `}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
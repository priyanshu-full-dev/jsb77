import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUserPassword } from "../../../api";

// Reusable EyeIcon component for password visibility toggle
const EyeIcon = ({ isVisible, toggleVisibility }) => (
  <button
    type="button"
    onClick={toggleVisibility}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    aria-label="Toggle password visibility"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isVisible ? (
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  </button>
);

export default function ChangePasswordModal({
  isOpen = false,
  onClose,
  onSuccess = () => {},
}) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Old password is required";
    }

  

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.oldPassword && formData.newPassword === formData.oldPassword) {
      newErrors.newPassword =
        "New password must be different from old password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateUserPassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (!response.success) {
        throw new Error(response?.data?.message || "Failed to update password");
      }

      // toast.success(response?.message || "Password updated successfully");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onSuccess();
      onClose(); // Close modal only on successful password update
    
    } catch (err) {
      setErrors({ submit: err.message || "Error updating password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field] || errors.submit) {
      setErrors((prev) => ({ ...prev, [field]: "", submit: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {isLoading && <div className="loader">Loading...</div>}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-[30%] bg-white w-[min(95vw,500px)] flex flex-col justify-center items-center rounded-md overflow-hidden h-max border-none outline-none transition-all duration-300">
        <div className="bg-[#263D4C] text-white font-bold text-sm flex justify-between items-center p-1 w-full">
          <h2 className="text-lg font-medium">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="sm:p-6 p-4 space-y-4 w-full">
          <div className="sm:flex sm:space-x-2">
            {/* Old Password */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Old Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? "text" : "password"}
                  placeholder="Old Password"
                  value={formData.oldPassword}
                  onChange={(e) =>
                    handleInputChange("oldPassword", e.target.value)
                  }
                  className={`w-full px-3 py-1 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.oldPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <EyeIcon
                  isVisible={showPasswords.oldPassword}
                  toggleVisibility={() => togglePasswordVisibility("oldPassword")}
                />
              </div>
              {errors.oldPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className={`w-full px-3 py-1 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <EyeIcon
                  isVisible={showPasswords.newPassword}
                  toggleVisibility={() => togglePasswordVisibility("newPassword")}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-1 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <EyeIcon
                isVisible={showPasswords.confirmPassword}
                toggleVisibility={() =>
                  togglePasswordVisibility("confirmPassword")
                }
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
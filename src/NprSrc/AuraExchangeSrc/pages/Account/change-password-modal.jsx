import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { logPasswordChange, updateUserPassword } from "../../../../api";
import { useGradientColor } from "./../../hooks/useThemeColors";
import { getUserData } from '../../../../utils/helper/commonSelectors';
import { useSelector } from "react-redux";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const gradientColor = useGradientColor();
  const userData = useSelector(getUserData());

  useEffect(() => {
    if (isOpen) {
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password don't match");
      return;
    }

    if (!formData.oldPassword) {
      toast.error("Please enter your old password");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      const response = await updateUserPassword(payload);
      await logPasswordChange({
        userId: userData?._id,
        userCreatedBy: userData?.createdBy._id,
        remark: "Password Changed By Self"
      });
      if (!response?.success) {
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);

        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start sm:items-center z-50 p-2 sm:p-0">
      <div className="bg-white rounded-[4px] shadow-xl w-full max-w-md overflow-hidden mt-6 sm:mt-0">
        {/* Header */}
        <div className="bg-[#294354] px-4 py-2.5 flex items-center justify-between">
          <h2 className="text-white text-[15px] font-bold tracking-wide m-0">
            Change Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-0.5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="p-4 sm:p-5 space-y-4 text-black bg-white"
        >
          {/* Decoy fields to trap browser password autofill */}
          <input type="text" name="fakeusernameremembered" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="fakepasswordremembered" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          {/* Old Password */}
          <div>
            <label className="block text-[14px] text-[#222] font-normal mb-1.5">
              Old Password <span className="text-[#f87171]">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword_no_fill"
                autoComplete="new-password"
                value={formData.oldPassword}
                onChange={(e) =>
                  handleInputChange("oldPassword", e.target.value)
                }
                className="w-full h-[34px] px-3 pr-10 bg-white border border-[#d1d5db] rounded-[4px] text-[13.5px] font-[200] text-black focus:bg-white focus:outline-none focus:border-[#9ca3af] transition-colors"
                style={{ fontWeight: 200 }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer p-0.5"
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[14px] text-[#222] font-normal mb-1.5">
              New Password <span className="text-[#f87171]">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword_no_fill"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className="w-full h-[34px] px-3 pr-10 bg-white border border-[#d1d5db] rounded-[4px] text-[13.5px] font-[200] text-black focus:bg-white focus:outline-none focus:border-[#9ca3af] transition-colors"
                style={{ fontWeight: 200 }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer p-0.5"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[14px] text-[#222] font-normal mb-1.5">
              Confirm Password <span className="text-[#f87171]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword_no_fill"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full h-[34px] px-3 pr-10 bg-white border border-[#d1d5db] rounded-[4px] text-[13.5px] font-[200] text-black focus:bg-white focus:outline-none focus:border-[#9ca3af] transition-colors"
                style={{ fontWeight: 200 }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer p-0.5"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#e5e7eb]">
            <button
              type="submit"
              className="px-5 py-1.5 text-[14px] font-medium text-white rounded-[4px] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
              disabled={loading}
              style={{ background: gradientColor }}
            >
              {loading ? "Submitting..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-1.5 text-[14px] font-medium bg-[#cdd5dc] hover:bg-[#b9c3cc] text-black rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              disabled={loading}
            >
              No
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

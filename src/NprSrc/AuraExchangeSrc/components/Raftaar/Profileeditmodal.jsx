import { useEffect, useRef, useState } from "react";
import { IoClose, IoCameraOutline, IoTrashOutline } from "react-icons/io5";
import { HiOutlineIdentification } from "react-icons/hi";
import {
  updateUserProfile,
  uploadMedia,
} from "../../../../api";
import { useSelector, useDispatch } from "react-redux";
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl";

function ProfileEditModal({ open, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const userData = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();

  const [preview, setPreview] = useState(null); 
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  const [existingAvatarUrl, setExistingAvatarUrl] = useState(null);
  const [resolvingExisting, setResolvingExisting] = useState(false);

  useEffect(() => {
    let active = true;

    const resolveExisting = async () => {

      if (typeof userData?.profile !== "string" || !userData.profile.trim()) {
        if (userData?.profile) {
          console.warn("Skipping avatar resolve, userData.profile is not a string:", userData.profile);
        }
        setExistingAvatarUrl(null);
        return;
      }
      setResolvingExisting(true);
      try {
        const resolved = await generatePresignedUrl(userData.profile);
        if (active) setExistingAvatarUrl(resolved);
      } catch (err) {
        console.error("Couldn't resolve profile image:", err, "input was:", userData.profile);
        if (active) setExistingAvatarUrl(null);
      } finally {
        if (active) setResolvingExisting(false);
      }
    };

    if (open) resolveExisting();
    return () => {
      active = false;
    };
  }, [open, userData?.profile]);

  const currentAvatar = preview || existingAvatarUrl || "/raftaar/user.jpeg";

  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError("");
    setAvatarFile(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!avatarFile) {
      setError("Choose a photo first.");
      return;
    }
    if (!userData?._id) {
      setError("Couldn't find your account. Try logging in again.");
      return;
    }

    setSaving(true);
    setError("");

    try {

      const cleanedFileName = avatarFile.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      const renamedFile = new File([avatarFile], cleanedFileName, {
        type: avatarFile.type,
      });

      const imageFormData = new FormData();
      imageFormData.append("image", renamedFile);

      const uploadRes = await uploadMedia(imageFormData);

      console.log("uploadMedia response:", uploadRes?.data);

      const uploadedKey =
        uploadRes?.data?.data?.url ||
        uploadRes?.data?.data?.key ||
        uploadRes?.data?.url ||
        uploadRes?.data?.key ||
        uploadRes?.data?.data;

      if (typeof uploadedKey !== "string" || !uploadedKey.trim()) {
        console.error("uploadMedia didn't return a usable string. Full response:", uploadRes?.data);
        throw new Error("Upload didn't return a usable file reference.");
      }


      const resolvedUrl = await generatePresignedUrl(uploadedKey);
      setExistingAvatarUrl(resolvedUrl);


      const updateRes = await updateUserProfile({
        userId: userData._id,
        profile: uploadedKey,
      });

      if (!updateRes?.data?.success) {
        throw new Error(updateRes?.data?.message || "Couldn't save your photo.");
      }


      onSave?.({ ...userData, profile: uploadedKey });
      clearPhoto();
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Couldn't save changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={saving ? undefined : onClose}
        className={`fixed inset-0 z-[80] bg-black/60 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[90] mx-auto w-full max-w-[420px] rounded-t-2xl bg-[#0c1626] border-t border-white/10 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 text-white font-sans font-bold text-[15px]">
            <HiOutlineIdentification size={19} className="text-[#8fa0bd]" />
            Profile Edit
          </div>
          <button
            onClick={saving ? undefined : onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <IoClose size={18} />
          </button>
        </div>

        <div className="h-px bg-white/10 mx-5" />

        {/* Avatar upload */}
        <div className="flex flex-col items-center pt-6 pb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-b from-[#ff5a3c] to-[#c62828] p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0c1626]">
                <img
                  src={currentAvatar}
                  alt="avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {(saving || resolvingExisting) && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}

            <button
              onClick={pickFile}
              disabled={saving}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] border-2 border-[#0c1626] flex items-center justify-center shadow-md disabled:opacity-60"
              aria-label="Upload photo"
            >
              <IoCameraOutline size={16} className="text-[#1a1a1a]" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={pickFile}
              className="text-[#f59e0b] font-sans font-bold text-[12.5px]"
            >
              Change photo
            </button>
            {preview && (
              <button
                onClick={clearPhoto}
                className="flex items-center gap-1 text-[#f41f03] font-sans font-bold text-[12.5px]"
              >
                <IoTrashOutline size={14} />
                Remove
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="px-5 pb-2 text-[#f41f03] font-sans text-[12px] font-medium">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex gap-3">
          <button
            onClick={saving ? undefined : onClose}
            className="flex-1 rounded-md border border-white/15 py-2.5 text-[#c3cfe0] font-sans font-bold text-[13.5px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-md bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] py-2.5 text-[#1a1a1a] font-sans font-bold text-[13.5px] disabled:opacity-60 transition-opacity"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

export default ProfileEditModal;
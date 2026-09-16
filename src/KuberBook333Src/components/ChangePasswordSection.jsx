import React, { useState } from 'react';
import { updatePassword } from '../../api';

export default function ChangePasswordSection({ user, onToast }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!oldPassword.trim()) {
      if (onToast) onToast({ id: Date.now(), type: 'error', message: 'Please enter old password' });
      else alert('Please enter old password');
      return;
    }

    if (!newPassword.trim()) {
      if (onToast) onToast({ id: Date.now(), type: 'error', message: 'Please enter new password' });
      else alert('Please enter new password');
      return;
    }

    if (newPassword.length < 6) {
      if (onToast) onToast({ id: Date.now(), type: 'error', message: 'New password must be at least 6 characters' });
      else alert('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (onToast) onToast({ id: Date.now(), type: 'error', message: 'New passwords do not match' });
      else alert('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('token') || user?.token;
    if (!token || user?.isDemo || user?.username === 'DEMO') {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'add',
          message: 'Password changed successfully! (Demo Mode)',
        });
      } else {
        alert('Password changed successfully!');
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res?.data?.status || res?.data?.success) {
        if (onToast) {
          onToast({
            id: Date.now(),
            type: 'add',
            message: res?.data?.message || 'Password changed successfully!',
          });
        } else {
          alert(res?.data?.message || 'Password changed successfully!');
        }
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (onToast) {
          onToast({
            id: Date.now(),
            type: 'error',
            message: res?.data?.message || 'Failed to change password.',
          });
        } else {
          alert(res?.data?.message || 'Failed to change password.');
        }
      }
    } catch (err) {
      console.error('Error updating password:', err);
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: err?.response?.data?.message || 'Failed to update password.',
        });
      } else {
        alert(err?.response?.data?.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full bg-[#f2f4f7] min-h-screen pb-24 text-neutral-900 select-none flex flex-col pt-0">
      {/* CARD CONTAINER */}
      <div className="mx-2 mt-1 rounded-[8px] overflow-hidden shadow-md">
        {/* GOLD HEADER: Change Password */}
        <div
          style={{
            background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
          }}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <h2 className="text-white font-bold text-[16.5px] tracking-wide drop-shadow-xs">
            Change Password
          </h2>
        </div>

        {/* DARK FORM BODY */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#212529] p-4 flex flex-col gap-3.5 text-white"
        >
          {/* Old Password */}
          <div className="w-full bg-[#2b2f36] border border-[#424750] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showOld ? 'text' : 'password'}
              placeholder="Enter Old Password*"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-transparent text-[13.5px] text-white placeholder-gray-400 outline-none pr-2"
            />
            <EyeIcon show={showOld} onToggle={() => setShowOld(!showOld)} />
          </div>

          {/* New Password */}
          <div className="w-full bg-[#2b2f36] border border-[#424750] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter New Password*"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent text-[13.5px] text-white placeholder-gray-400 outline-none pr-2"
            />
            <EyeIcon show={showNew} onToggle={() => setShowNew(!showNew)} />
          </div>

          {/* Confirm New Password */}
          <div className="w-full bg-[#2b2f36] border border-[#424750] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Enter Confirm New Password*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-[13.5px] text-white placeholder-gray-400 outline-none pr-2"
            />
            <EyeIcon show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
            }}
            className="w-full mt-1 py-2.5 rounded-[6px] text-white font-bold text-[14px] tracking-wider uppercase shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center disabled:opacity-60 drop-shadow-xs"
          >
            {loading ? 'SAVING...' : 'SAVE'}
          </button>
        </form>
      </div>
    </div>
  );
}

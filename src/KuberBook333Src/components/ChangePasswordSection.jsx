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
      className="text-gray-400 hover:text-white transition-opacity cursor-pointer p-1 shrink-0 flex items-center justify-center"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <img
        src={show ? '/games/changepass/score-hide-icon.svg' : '/games/changepass/score-visible.svg'}
        alt={show ? 'Hide password' : 'Show password'}
        className="w-4 h-4 object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
      />
    </button>
  );

  return (
    <div className="w-full bg-white pt-1 min-h-screen pb-24 text-neutral-900 select-none flex flex-col ">
      {/* CARD CONTAINER */}
      <div className="mx-2 mt-1 rounded-[8px] overflow-hidden shadow-md">
        {/* GOLD HEADER: Change Password */}
        <div
          style={{
            background: 'transparent linear-gradient(94deg,#b6842d,#ebda8d 55%,#b7862f)',
          }}
          className="w-full px-3 py-2 flex tracking-tighter items-center justify-between"
        >
          <h2 className="text-white font-bold text-[15.5px] tracking-wide drop-shadow-xs">
            Change Password
          </h2>
        </div>

        {/* DARK FORM BODY */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#202020] p-2 pt-4 pb-6 flex flex-col gap-2 text-white"
        >
          {/* Old Password */}
          <div className="w-full bg-transparent border border-[#424750] rounded-[6px] pr-2.5 pl-3 py-1.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showOld ? 'text' : 'password'}
              placeholder="Enter Old Password*"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-transparent text-[14px] text-white placeholder-gray-400 outline-none pr-2"
            />
            <EyeIcon show={showOld} onToggle={() => setShowOld(!showOld)} />
          </div>

          {/* New Password */}
          <div className="w-full bg-transparent border border-[#424750] rounded-[6px] pr-2.5 pl-3 py-1.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter New Password*"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent text-[14px] text-white placeholder-gray-400 outline-none pr-2"
            />
            <EyeIcon show={showNew} onToggle={() => setShowNew(!showNew)} />
          </div>

          {/* Confirm New Password */}
          <div className="w-full bg-transparent border border-[#424750] rounded-[6px] pr-2.5 pl-3 py-1.5 flex items-center justify-between focus-within:border-amber-500 transition-colors">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Enter Confirm New Password*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-[14px] text-white placeholder-gray-400 outline-none pr-2"
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
            className="w-full mt-1.5 py-3 rounded-[6px] text-white font-extrabold text-[15px] tracking-wider uppercase shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center disabled:opacity-60 drop-shadow-xs"
          >
            {loading ? 'SAVING...' : 'SAVE'}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit2, Plus, X } from 'lucide-react';

export default function DepositSection({ user, onToast, activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if active view is withdraw or deposit
  const isWithdraw = activeTab === 'withdraw' || location.pathname.includes('/withdraw');

  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');
  const [stakes, setStakes] = useState([200, 500, 1000, 3000]);
  const [isEditingStakes, setIsEditingStakes] = useState(false);
  const [editedStakes, setEditedStakes] = useState(['200', '500', '1000', '3000']);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState('bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');

  // Requests history table filter
  const [filterStatus, setFilterStatus] = useState('All');
  const [transactionRequests, setTransactionRequests] = useState([]);

  // Handle Quick Add for Deposit
  const handleQuickAdd = (val) => {
    const current = parseFloat(depositAmount) || 0;
    setDepositAmount(String(current + val));
  };

  // Handle Save Stakes
  const handleSaveStakes = () => {
    const nextStakes = editedStakes.map((s) => parseFloat(s) || 100);
    setStakes(nextStakes);
    setIsEditingStakes(false);
    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'success',
        message: 'Deposit stakes updated successfully!',
      });
    }
  };

  // Handle Deposit Submit
  const handleSubmitDeposit = (e) => {
    e?.preventDefault();
    const num = parseFloat(depositAmount);
    if (!num || num < 100) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: 'Minimum deposit amount is ₹100',
        });
      } else {
        alert('Minimum deposit amount is ₹100');
      }
      return;
    }
    if (num > 200000) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: 'Maximum deposit amount is ₹200,000',
        });
      } else {
        alert('Maximum deposit amount is ₹200,000');
      }
      return;
    }

    const newReq = {
      id: Date.now(),
      type: 'Deposit',
      method: 'UPI / Bank',
      amount: num,
      status: 'Pending',
      date: new Date().toLocaleString(),
    };

    setTransactionRequests((prev) => [newReq, ...prev]);
    setDepositAmount('');
    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'success',
        message: `Deposit request for ₹${num.toLocaleString()} submitted successfully!`,
      });
    }
  };

  // Handle Withdraw Submit
  const handleSubmitWithdraw = (e) => {
    e?.preventDefault();
    const num = parseFloat(withdrawAmount);
    const userBalance = user?.balance ?? 0;

    if (!num || num < 300) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: 'Minimum withdrawal amount is ₹300',
        });
      } else {
        alert('Minimum withdrawal amount is ₹300');
      }
      return;
    }

    if (num > 1000000) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: 'Maximum withdrawal amount is ₹1,000,000',
        });
      } else {
        alert('Maximum withdrawal amount is ₹1,000,000');
      }
      return;
    }

    if (num > userBalance) {
      if (onToast) {
        onToast({
          id: Date.now(),
          type: 'error',
          message: 'Insufficient balance for withdrawal',
        });
      } else {
        alert('Insufficient balance for withdrawal');
      }
      return;
    }

    const newReq = {
      id: Date.now(),
      type: 'Withdraw',
      method: selectedMethod === 'bank' ? 'Bank Transfer' : 'UPI',
      amount: num,
      status: 'Pending',
      date: new Date().toLocaleString(),
    };

    setTransactionRequests((prev) => [newReq, ...prev]);
    setWithdrawAmount('');
    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'success',
        message: `Withdrawal request for ₹${num.toLocaleString()} submitted successfully!`,
      });
    }
  };

  // Handle Add Account
  const handleSaveAccount = (e) => {
    e?.preventDefault();
    if (newAccountType === 'bank') {
      if (!accountName || !accountNumber || !ifscCode) {
        if (onToast) {
          onToast({
            id: Date.now(),
            type: 'error',
            message: 'Please fill all required bank fields',
          });
        }
        return;
      }
      const acc = {
        id: Date.now(),
        type: 'bank',
        name: accountName,
        accountNumber,
        ifscCode,
        bankName: bankName || 'Bank Account',
      };
      setAccounts((prev) => [...prev, acc]);
      setSelectedAccount(acc);
    } else {
      if (!accountName || !upiId) {
        if (onToast) {
          onToast({
            id: Date.now(),
            type: 'error',
            message: 'Please fill name and UPI ID',
          });
        }
        return;
      }
      const acc = {
        id: Date.now(),
        type: 'upi',
        name: accountName,
        upiId,
      };
      setAccounts((prev) => [...prev, acc]);
      setSelectedAccount(acc);
    }

    setIsAddAccountModalOpen(false);
    setAccountName('');
    setAccountNumber('');
    setIfscCode('');
    setBankName('');
    setUpiId('');

    if (onToast) {
      onToast({
        id: Date.now(),
        type: 'success',
        message: 'Account added successfully!',
      });
    }
  };

  const filteredRequests = transactionRequests.filter((r) => {
    if (isWithdraw && r.type !== 'Withdraw') return false;
    if (!isWithdraw && r.type !== 'Deposit') return false;
    if (filterStatus === 'All') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="w-full flex flex-col px-2.5 py-2.5 min-h-[600px] select-none text-[#212529] pb-24 font-sans">
      {/* 1. Top Action Switcher Bar: Deposit (Green) | Withdraw (Red) */}
      <div className="w-full flex items-center gap-2 mb-3">
        {/* Deposit Button (Active Green) */}
        <button
          type="button"
          onClick={() => navigate('/deposit')}
          className={`w-full flex items-center justify-center gap-2.5 bg-[linear-gradient(180deg,#007b15,#138e00)] hover:bg-[#086600] text-white font-semibold px-4 py-1.5 ml-1 text-[14px] rounded-sm cursor-pointer active:scale-98 transition-all ${!isWithdraw ? 'ring-2 ring-green-600 ring-offset-1' : 'opacity-90'
            }`}
        >
          <img
            src="/games/download (3).webp"
            alt="Deposit"
            className="w-[20px] h-[20px] object-contain shrink-0 brightness-0 invert"
          />
          Deposit
        </button>

        {/* Withdraw Button (Red) */}
        <button
          type="button"
          onClick={() => navigate('/withdraw')}
          className={`w-full flex items-center mr-1 justify-center gap-2.5 bg-[linear-gradient(180deg,#7b0000,#d10000)] hover:bg-[#cc0000] text-white font-semibold px-4 py-1.5 text-[14px] rounded-sm cursor-pointer active:scale-98 transition-all ${isWithdraw ? 'ring-2 ring-red-700 ring-offset-1' : 'opacity-90'
            }`}
        >
          <img
            src="/games/download (4).webp"
            alt="Withdraw"
            className="w-[20px] h-[20px] object-contain shrink-0 brightness-0 invert"
          />
          Withdraw
        </button>
      </div>

      {/* 2. Top Sub-Bar: Back button (and + ADD ACCOOUNT on withdraw view) */}
      <div className="w-full flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
          }}
          className="px-5 py-1.5 rounded-[4px] font-bold text-[13px] text-white shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer leading-none"
        >
          Back
        </button>

        {isWithdraw && (
          <button
            type="button"
            onClick={() => setIsAddAccountModalOpen(true)}
            className="bg-white border border-gray-300 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Plus size={11} strokeWidth={3.5} />
            </div>
            <span className="font-extrabold text-[12px] text-[#212529] tracking-tight uppercase">
              ADD ACCOOUNT
            </span>
          </button>
        )}
      </div>

      {/* ===================== WITHDRAW VIEW ===================== */}
      {isWithdraw ? (
        <>
          {/* CARD 1: Choose a Payment Method */}
          <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col mb-3">
            <span className="font-bold text-[14px] text-[#212529] mb-3">
              Choose a payment method
            </span>

            <div className="flex items-center gap-3">
              {/* BANK BUTTON */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`w-[68px] h-[58px] rounded-[6px] flex flex-col items-center justify-center cursor-pointer transition-all border ${selectedMethod === 'bank'
                  ? 'bg-[#1c2833] border-[#1c2833] text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">BANK</span>
                <svg
                  viewBox="0 0 512 512"
                  className="w-5 h-5 fill-current mt-1"
                  aria-hidden="true"
                >
                  <path d="M496 128v16a8 8 0 0 1-8 8h-24v12c0 6.627-5.373 12-12 12H60c-6.627 0-12-5.373-12-12v-12H24a8 8 0 0 1-8-8v-16a8 8 0 0 1 4.941-7.392l232-88a7.996 7.996 0 0 1 6.118 0l232 88A8 8 0 0 1 496 128zm-24 304H40c-13.255 0-24 10.745-24 24v16a8 8 0 0 0 8 8h464a8 8 0 0 0 8-8v-16c0-13.255-10.745-24-24-24zM96 192v192H60c-6.627 0-12 5.373-12 12v20h416v-20c0-6.627-5.373-12-12-12h-36V192h-64v192h-64V192h-64v192h-64V192H96z" />
                </svg>
              </button>

              {/* UPI BUTTON */}
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`w-[68px] h-[58px] rounded-[6px] flex flex-col items-center justify-center cursor-pointer transition-all border ${selectedMethod === 'upi'
                  ? 'bg-[#1c2833] border-[#1c2833] text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">UPI</span>
                <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-[2px] mt-1 tracking-tighter">
                  UPI
                </span>
              </button>
            </div>

            {/* List of Added Accounts or "No accounts yet" */}
            {accounts.filter((a) => a.type === selectedMethod).length === 0 ? (
              <div className="w-full text-center py-6 text-[15px] font-semibold text-[#212529]">
                No accounts yet
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2 mt-3">
                {accounts
                  .filter((a) => a.type === selectedMethod)
                  .map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc)}
                      className={`p-2.5 rounded-[4px] border flex items-center justify-between cursor-pointer ${selectedAccount?.id === acc.id
                        ? 'border-[#caa049] bg-amber-50/50'
                        : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[13px] text-[#212529]">{acc.name}</span>
                        <span className="text-[11.5px] text-gray-600">
                          {acc.type === 'bank' ? `${acc.bankName} - ${acc.accountNumber}` : acc.upiId}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAccount?.id === acc.id
                          ? 'border-[#caa049] bg-[#caa049]'
                          : 'border-gray-400'
                          }`}
                      >
                        {selectedAccount?.id === acc.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* CARD 2: Withdraw Amount Section */}
          <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col gap-2.5 mb-3">
            <div className="w-full flex items-center justify-between">
              <span className="font-bold text-[14px] text-[#212529]">Withdraw Amount*</span>
              <div className="bg-[#caa049] text-white font-bold text-[12px] px-2.5 py-0.5 rounded-[4px]">
                Available Bal: {(user?.balance ?? 0).toFixed(2)}
              </div>
            </div>

            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none font-medium text-[#212529] placeholder:text-gray-400 focus:border-[#435263]"
            />

            <div className="w-full text-right text-[11.5px] font-semibold text-gray-600 mt-[-4px]">
              Min: 300 | Max: 1000000
            </div>

            <button
              type="button"
              onClick={handleSubmitWithdraw}
              className={`w-full py-2.5 rounded-[4px] font-bold text-[14px] text-white transition-all cursor-pointer shadow-xs ${withdrawAmount && parseFloat(withdrawAmount) >= 300
                ? 'bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-98'
                : 'bg-[#ef9a9a] active:scale-98'
                }`}
            >
              Withdrawal
            </button>
          </div>

          {/* CARD 3: Withdraw Rules */}
          <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col gap-2.5 mb-3">
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              1. This form is for withdrawing the amount from the main wallet only.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              2. The bonus wallet amount cannot be withdrawn by this form.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              3. Do not put Withdraw request without betting with deposit amount. Such activity may be identified as Suspicious.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              4. If multiple users are using same withdraw account then all the linked users will be blocked.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              6. Maximum Withdraw time is 45 minutes then only complain on WhatsApp number.
            </p>
          </div>
        </>
      ) : (
        /* ===================== DEPOSIT VIEW ===================== */
        <>
          {/* CARD 1: Deposit Amount Section */}
          <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col gap-2.5 mb-3">
            <span className="font-bold text-[14px] text-[#212529]">Deposit Amount</span>

            {/* Input + SUBMIT Button */}
            <div className="w-full flex items-stretch">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-white border border-gray-300 rounded-l-[4px] px-3 py-2 text-[14px] outline-none font-medium text-[#212529] placeholder:text-gray-400 focus:border-[#435263]"
              />
              <button
                type="button"
                onClick={handleSubmitDeposit}
                className="bg-[#435263] hover:bg-[#344150] active:scale-95 text-white font-bold text-[13px] px-5 py-2 rounded-r-[4px] transition-all cursor-pointer flex items-center justify-center leading-none"
              >
                SUBMIT
              </button>
            </div>

            {/* Min / Max Info */}
            <div className="w-full text-right text-[11.5px] font-semibold text-gray-600 mt-[-4px]">
              Min: 100 | Max: 200000
            </div>

            {/* Quick Amount Chips */}
            {isEditingStakes ? (
              <div className="w-full flex flex-col gap-2 mt-1">
                <div className="grid grid-cols-4 gap-2">
                  {editedStakes.map((stk, idx) => (
                    <input
                      key={idx}
                      type="number"
                      value={stk}
                      onChange={(e) => {
                        const copy = [...editedStakes];
                        copy[idx] = e.target.value;
                        setEditedStakes(copy);
                      }}
                      className="bg-gray-50 border border-gray-300 text-[#212529] font-bold text-[13px] py-1.5 px-2 rounded-[4px] text-center outline-none focus:border-[#b6842d]"
                    />
                  ))}
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingStakes(false)}
                    className="px-3 py-1 text-[12px] font-bold bg-gray-200 text-gray-700 rounded-[4px] hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStakes}
                    className="px-4 py-1 text-[12px] font-bold bg-[#008a00] text-white rounded-[4px] hover:bg-green-700 shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mt-1">
                {stakes.map((stkVal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAdd(stkVal)}
                    className="bg-[#2b303a] hover:bg-[#1f232b] active:scale-95 text-white font-bold text-[13px] py-2 rounded-[4px] text-center cursor-pointer transition-all shadow-2xs leading-none"
                  >
                    + {stkVal}
                  </button>
                ))}
              </div>
            )}

            {/* Edit Stakes Button */}
            {!isEditingStakes && (
              <button
                type="button"
                onClick={() => setIsEditingStakes(true)}
                style={{
                  background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                }}
                className="w-full py-2.5 rounded-[4px] text-black font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:brightness-105 active:scale-98 transition-all mt-1"
              >
                <Edit2 size={14} className="text-black stroke-[2.5]" />
                Edit stakes
              </button>
            )}
          </div>

          {/* CARD 2: Important Deposit Rules / Instructions */}
          <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col gap-2.5 mb-3">
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              1. Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              2. Deposits made 45 minutes after the account removal from the site are valid &amp; will be added to their wallets.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              3. Site is not responsible for money deposited to Old, Inactive or Closed accounts.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              4. After deposit, add your UTR and amount to receive balance.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              5. NEFT receiving time varies from 40 minutes to 2 hours.
            </p>
            <p className="font-bold text-[13px] text-[#212529] leading-relaxed">
              6. In case of account modification: payment valid for 1 hour after changing account details in deposit page.
            </p>
          </div>
        </>
      )}

      {/* CARD 3 / CARD 4: Common Transaction History / Requests Table */}
      <div className="w-full bg-white rounded-[6px] p-3.5 shadow-xs border border-gray-100 flex flex-col gap-2.5">
        {/* Dropdown Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-[4px] px-3 py-2 text-[13px] font-semibold text-[#212529] bg-white outline-none focus:border-[#b6842d]"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Requests Table */}
        <div className="w-full flex flex-col overflow-hidden rounded-[3px] border border-gray-200 mt-1">
          {/* Header */}
          <div className="w-full bg-[#1c2833] grid grid-cols-12 text-white font-bold text-[11px] uppercase text-center py-2.5 px-1">
            <div className="col-span-4 flex items-center justify-center">REQUEST TYPE</div>
            <div className="col-span-5 flex items-center justify-center">PAYMENT METHOD</div>
            <div className="col-span-3 flex items-center justify-center">AMOUNT</div>
          </div>

          {/* Rows / Empty state */}
          {filteredRequests.length === 0 ? (
            <div className="w-full py-6 text-center font-bold text-[14px] text-[#212529] bg-white">
              No data found!
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="w-full bg-white grid grid-cols-12 text-[12px] font-semibold text-center py-3 px-1 border-b border-gray-100 items-center"
              >
                <div
                  className={`col-span-4 font-bold ${req.type === 'Deposit' ? 'text-[#008a00]' : 'text-[#b30000]'
                    }`}
                >
                  {req.type}
                </div>
                <div className="col-span-5 text-gray-700">{req.method}</div>
                <div className="col-span-3 text-[#212529] font-bold">
                  ₹{req.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: ADD ACCOUNT */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1c2833] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-[14px]">Add New Account</span>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAccount} className="p-4 flex flex-col gap-3">
              {/* Type Switcher */}
              <div className="flex rounded-[4px] border border-gray-300 p-0.5 bg-gray-100">
                <button
                  type="button"
                  onClick={() => setNewAccountType('bank')}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-[3px] transition-all cursor-pointer ${newAccountType === 'bank'
                    ? 'bg-[#caa049] text-white shadow-xs'
                    : 'text-gray-700 hover:text-black'
                    }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setNewAccountType('upi')}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-[3px] transition-all cursor-pointer ${newAccountType === 'upi'
                    ? 'bg-[#caa049] text-white shadow-xs'
                    : 'text-gray-700 hover:text-black'
                    }`}
                >
                  UPI ID
                </button>
              </div>

              {/* Account Holder Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-700">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter full name"
                  className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[13px] outline-none focus:border-[#caa049]"
                />
              </div>

              {newAccountType === 'bank' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank, SBI"
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[13px] outline-none focus:border-[#caa049]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-gray-700">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[13px] outline-none focus:border-[#caa049]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-gray-700">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[13px] outline-none focus:border-[#caa049] uppercase"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-gray-700">UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. username@okhdfcbank"
                    className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[13px] outline-none focus:border-[#caa049]"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="flex-1 py-2 rounded-[4px] text-[13px] font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-[4px] text-[13px] font-bold bg-[#008a00] text-white hover:bg-green-700 transition-colors cursor-pointer shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

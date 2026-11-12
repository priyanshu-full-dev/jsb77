import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Copy,
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Smartphone,
  Shield,
  Upload,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { SiPhonepe, SiTether } from 'react-icons/si';
import { BsBank2 } from 'react-icons/bs';
import { saveAs } from 'file-saver';

// API Endpoints
import {
  getactiveAdminDepositMethod,
  uploadMedia,
  createPayment,
  getPaymentsByUserId,
  getAllAccounts,
  createAccount,
  deleteAccount,
  createwithdraw,
  checkWithdrawalAllowed,
  getwithdrawals,
} from '../../api';
import { generatePresignedUrl } from '../../utils/helper/generatePresignedUrl';
import { setUserData } from '../../redux/slices/userSlice';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

export default function DepositSection({ user: propUser, onToast, activeTab: propActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux user fallback
  const reduxUser = useSelector((state) => state?.user?.userData);
  const user = propUser || reduxUser || {};

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    localStorage.getItem('userId') ||
    '';

  const isDemoUser = Boolean(
    user?.isDemo ||
    user?.username?.toLowerCase().startsWith('demo') ||
    user?.userName?.toLowerCase().startsWith('demo') ||
    user?.username === 'DEMO'
  );

  // Active Tab: "deposit" or "withdraw"
  const isWithdrawRoute =
    propActiveTab === 'withdraw' || location.pathname.includes('/withdraw');
  const [activeTab, setActiveTab] = useState(isWithdrawRoute ? 'withdraw' : 'deposit');

  useEffect(() => {
    if (location.pathname.includes('/withdraw') || propActiveTab === 'withdraw') {
      setActiveTab('withdraw');
    } else if (location.pathname.includes('/deposit') || propActiveTab === 'deposit') {
      setActiveTab('deposit');
    }
  }, [location.pathname, propActiveTab]);

  const rawBalance =
    typeof user?.availableBalance === 'number'
      ? user.availableBalance
      : typeof user?.balance === 'number'
      ? user.balance
      : 0.0;
  const balance = Number(rawBalance || 0).toFixed(2);

  // ----------------------------------------------------
  // DEPOSIT STATE (Reference from Kuberbook666)
  // ----------------------------------------------------
  const [depositAmount, setDepositAmount] = useState('100');
  const [openGateway, setOpenGateway] = useState(false);
  const [depositHistory, setDepositHistory] = useState([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositHistoryFilter, setDepositHistoryFilter] = useState('All');

  const filteredDepositHistory = useMemo(() => {
    if (!depositHistoryFilter || depositHistoryFilter === 'All') return depositHistory;
    return depositHistory.filter((item) => {
      const st = String(item?.status || '').toLowerCase();
      return st === depositHistoryFilter.toLowerCase();
    });
  }, [depositHistory, depositHistoryFilter]);

  // Payment Gateway Form State
  const [gatewayTab, setGatewayTab] = useState('phone pe'); // "phone pe", "account", "usdt"
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [paymentDetails, setPaymentDetails] = useState({
    account: [],
    gpay: [],
    usdt: [],
  });

  const [gatewayForm, setGatewayForm] = useState({
    UTR: '',
    amount: 100,
    image: null,
    termsAccepted: false,
    PaymentMode: 'phone pe',
    PaymentBy: userId,
    domainId: '6a85553b526a2dbeb187f071',
  });

  // Fetch Admin Payment Deposit Methods
  const fetchAdminDepositMethods = useCallback(async () => {
    try {
      setGatewayLoading(true);
      const res = await getactiveAdminDepositMethod();
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      const account = data.filter((acc) => (acc.type || '').toLowerCase() === 'bank') || [];
      const gpay = data.filter(
        (acc) =>
          (acc.type || '').toLowerCase() === 'qr' ||
          (acc.type || '').toLowerCase() === 'upi'
      ) || [];
      const usdt = data.filter(
        (acc) =>
          (acc.type || '').toLowerCase() === 'usdt' ||
          (acc.type || '').toLowerCase() === 'crypto'
      ) || [];

      setPaymentDetails({ account, gpay, usdt });
    } catch (err) {
      console.error('Failed to fetch deposit methods:', err);
    } finally {
      setGatewayLoading(false);
    }
  }, []);

  // Fetch QR Presigned URL
  useEffect(() => {
    const generateUrl = async () => {
      const qrSource = gatewayTab === 'phone pe' ? paymentDetails.gpay : paymentDetails.usdt;
      if (qrSource?.[0]?.imageUrl) {
        setGatewayLoading(true);
        try {
          const key = qrSource[0].imageUrl;
          const presignedUrl = await generatePresignedUrl(key);
          setQrImageUrl(presignedUrl || key);
        } catch {
          setQrImageUrl(qrSource[0].imageUrl || '');
        } finally {
          setGatewayLoading(false);
        }
      } else {
        setQrImageUrl('');
      }
    };
    if (openGateway) {
      generateUrl();
    }
  }, [paymentDetails.gpay, paymentDetails.usdt, gatewayTab, openGateway]);

  // Fetch User Deposit History
  const fetchDepositHistory = useCallback(async () => {
    if (!userId || userId === 'undefined') return;
    try {
      setDepositLoading(true);
      const res = await getPaymentsByUserId(userId);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setDepositHistory(list);
    } catch {
      setDepositHistory([]);
    } finally {
      setDepositLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'deposit') {
      fetchDepositHistory();
      fetchAdminDepositMethods();
    }
  }, [activeTab, fetchDepositHistory, fetchAdminDepositMethods]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(String(text))
      .then(() => {
        if (onToast) onToast({ id: Date.now(), type: 'success', message: 'Copied to clipboard!' });
        else toast.success('Copied to clipboard!');
      })
      .catch(() => toast.error('Failed to copy'));
  };

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const cleanedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    const renamedFile = new File([file], cleanedFileName, { type: file.type });
    const formData = new FormData();
    formData.append('image', renamedFile);

    setGatewayLoading(true);
    try {
      const response = await uploadMedia(formData);
      const imageUrl = response?.data?.data?.url || response?.data?.url;
      if (imageUrl) {
        setGatewayForm((prev) => ({ ...prev, image: imageUrl }));
        if (onToast) onToast({ id: Date.now(), type: 'success', message: 'Image uploaded successfully' });
        else toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to retrieve image URL');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleSubmitDepositPayment = async (e) => {
    e?.preventDefault();
    const requiredFields = ['UTR', 'image', 'amount', 'PaymentMode'];
    const missing = requiredFields.filter((f) => !gatewayForm[f] || (f === 'amount' && Number(gatewayForm[f]) <= 0));
    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.join(', ')}`);
      return;
    }
    if (!gatewayForm.termsAccepted) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    setGatewayLoading(true);
    try {
      const response = await createPayment({
        ...gatewayForm,
        amount: Number(depositAmount),
        PaymentMode: gatewayTab,
        PaymentBy: userId,
        domainId: user?.domain || user?.domainId || '6a85553b526a2dbeb187f071',
        termsAccepted: true,
      });

      if (
        response?.success ||
        response?.data?.success ||
        response?.statusCode === 200 ||
        response?.data?.message?.toLowerCase().includes('success') ||
        response?.message?.toLowerCase().includes('success')
      ) {
        const msg = 'Payment request submitted successfully! Pending admin approval.';
        if (onToast) onToast({ id: Date.now(), type: 'success', message: msg });
        else toast.success(msg);

        setOpenGateway(false);
        setGatewayForm({
          UTR: '',
          amount: 100,
          image: null,
          termsAccepted: false,
          PaymentMode: 'phone pe',
          PaymentBy: userId,
          domainId: '6a85553b526a2dbeb187f071',
        });
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        fetchDepositHistory();
      } else {
        toast.error(response?.data?.message || response?.message || 'Failed to submit payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An error occurred during payment submission');
    } finally {
      setGatewayLoading(false);
    }
  };

  // ----------------------------------------------------
  // WITHDRAWAL STATE (Reference from Kuberbook666)
  // ----------------------------------------------------
  const [withdrawMethod, setWithdrawMethod] = useState('BANK'); // "BANK" or "UPI"
  const [accountMode, setAccountMode] = useState('new'); // "new" or "previous"
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedSavedAccountId, setSelectedSavedAccountId] = useState(null);
  const [previousAccountAmount, setPreviousAccountAmount] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawTermsAccepted, setWithdrawTermsAccepted] = useState(true);
  const [showMoreRules, setShowMoreRules] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  const [bankForm, setBankForm] = useState({
    amount: '',
    ifsc: '',
    accountNo: '',
    bankType: 'SAVINGS',
    accountName: user?.name || user?.username || '',
    bankName: '',
  });

  const [upiForm, setUpiForm] = useState({
    amount: '',
    upiId: '',
    mobileNo: user?.mobile || '',
    accountName: user?.name || user?.username || '',
  });

  const [withdrawalCheck, setWithdrawalCheck] = useState({
    withdrawalAllowed: true,
    moreExposureRequiredToWithdraw: 0,
  });

  // Verify Withdrawal Allowed API
  useEffect(() => {
    const verifyWithdrawal = async () => {
      try {
        const response = await checkWithdrawalAllowed();
        if (response?.data?.data) {
          setWithdrawalCheck(response.data.data);
        }
      } catch {
        setWithdrawalCheck({ withdrawalAllowed: true });
      }
    };
    if (activeTab === 'withdraw') {
      verifyWithdrawal();
    }
  }, [activeTab]);

  // Fetch Saved Accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const res = await getAllAccounts();
      const accountData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setSavedAccounts(accountData);
      if (accountData.length > 0 && !selectedSavedAccountId) {
        setSelectedSavedAccountId(accountData[0]._id || accountData[0].id);
      }
    } catch {
      setSavedAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, [selectedSavedAccountId]);

  // Fetch Withdrawal History
  const fetchWithdrawalHistory = useCallback(async () => {
    if (!userId || userId === 'undefined') return;
    try {
      const res = await getwithdrawals(userId);
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setWithdrawHistory(data);
    } catch {
      setWithdrawHistory([]);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'withdraw') {
      fetchAccounts();
      fetchWithdrawalHistory();
    }
  }, [activeTab, fetchAccounts, fetchWithdrawalHistory]);

  const handleDeleteSavedAccount = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setWithdrawSubmitting(true);
      const res = await deleteAccount(id);
      if (res?.success || res?.status === 200) {
        toast.success('Account removed successfully');
        setSavedAccounts((prev) => prev.filter((acc) => acc._id !== id && acc.id !== id));
        if (selectedSavedAccountId === id) setSelectedSavedAccountId(null);
      } else {
        toast.error(res?.data?.message || 'Failed to delete account');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Error deleting account');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Submit New Account Withdrawal
  const handleSubmitNewAccountWithdraw = async (e) => {
    e?.preventDefault();
    if (!withdrawTermsAccepted) {
      toast.error('Please accept the terms of payment and withdrawal policy.');
      return;
    }

    if (!withdrawalCheck.withdrawalAllowed) {
      toast.error(
        `Withdrawal not allowed. Play for more exposure of ₹${
          withdrawalCheck.moreExposureRequiredToWithdraw || 0
        } to withdraw.`
      );
      return;
    }

    const amt = parseFloat(withdrawMethod === 'BANK' ? bankForm.amount : upiForm.amount);
    if (isNaN(amt) || amt < 300 || amt > 1000000) {
      toast.error('Withdrawal amount must be between ₹300 and ₹1,000,000');
      return;
    }

    if (amt > rawBalance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    try {
      setWithdrawSubmitting(true);
      const uuid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1. Create account entry
      let createdAccId = null;
      try {
        const accPayload =
          withdrawMethod === 'BANK'
            ? {
                accountHolderName: bankForm.accountName,
                accountNumber: bankForm.accountNo,
                ifscCode: bankForm.ifsc,
                bankName: bankForm.bankName,
                accountType: bankForm.bankType,
                mobileNo: user?.mobile || '',
                domainId: user?.domain || user?.domainId || '6a85553b526a2dbeb187f071',
                userId: userId,
              }
            : {
                accountHolderName: upiForm.accountName,
                accountNumber: upiForm.upiId,
                ifscCode: 'UPI',
                bankName: 'UPI',
                mobileNo: upiForm.mobileNo,
                domainId: user?.domain || user?.domainId || '6a85553b526a2dbeb187f071',
                userId: userId,
              };
        const accRes = await createAccount(accPayload);
        if (accRes?.success && accRes?.data?._id) {
          createdAccId = accRes.data._id;
        }
      } catch (err) {
        console.warn('Account creation warning:', err?.message);
      }

      // 2. Submit withdrawal request
      const withdrawPayload = {
        UTR: uuid,
        accountId: createdAccId || 'DIRECT_WITHDRAW',
        withdrawAmount: amt,
        userId: userId,
        domainId: user?.domain || user?.domainId || '6a85553b526a2dbeb187f071',
        paymentMethod: withdrawMethod,
        ...(withdrawMethod === 'BANK'
          ? {
              bankName: bankForm.bankName,
              accountHolderName: bankForm.accountName,
              accountNumber: bankForm.accountNo,
              ifscCode: bankForm.ifsc,
              accountType: bankForm.bankType,
            }
          : {
              upiId: upiForm.upiId,
              accountHolderName: upiForm.accountName,
              mobileNo: upiForm.mobileNo,
            }),
      };

      const response = await createwithdraw(withdrawPayload);

      if (response?.success || response?.status === 200 || response?.data?.success) {
        const msg = `Withdrawal request for ₹${amt.toLocaleString()} submitted successfully!`;
        if (onToast) onToast({ id: Date.now(), type: 'success', message: msg });
        else toast.success(msg);

        // Deduct local balance
        const newBal = Math.max(0, rawBalance - amt);
        dispatch(setUserData({ ...user, availableBalance: newBal, balance: newBal }));

        setBankForm({
          amount: '',
          ifsc: '',
          accountNo: '',
          bankType: 'SAVINGS',
          accountName: user?.name || user?.username || '',
          bankName: '',
        });
        setUpiForm({
          amount: '',
          upiId: '',
          mobileNo: user?.mobile || '',
          accountName: user?.name || user?.username || '',
        });
        fetchAccounts();
        fetchWithdrawalHistory();
      } else {
        toast.error(response?.data?.message || response?.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Error submitting withdrawal');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Submit Previous Account Withdrawal
  const handleSubmitPreviousAccountWithdraw = async (e) => {
    e?.preventDefault();
    if (!withdrawTermsAccepted) {
      toast.error('Please accept the terms of payment and withdrawal policy.');
      return;
    }

    if (!selectedSavedAccountId) {
      toast.error('Please select a saved account.');
      return;
    }

    const amt = parseFloat(previousAccountAmount);
    if (isNaN(amt) || amt < 300 || amt > 1000000) {
      toast.error('Withdrawal amount must be between ₹300 and ₹1,000,000');
      return;
    }

    if (amt > rawBalance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    const selectedAcc = savedAccounts.find(
      (acc) => acc._id === selectedSavedAccountId || acc.id === selectedSavedAccountId
    );
    if (!selectedAcc) {
      toast.error('Selected account not found');
      return;
    }

    try {
      setWithdrawSubmitting(true);
      const uuid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const withdrawPayload = {
        UTR: uuid,
        accountId: selectedAcc._id || selectedAcc.id,
        withdrawAmount: amt,
        userId: userId,
        domainId: user?.domain || user?.domainId || '6a85553b526a2dbeb187f071',
        paymentMethod: selectedAcc.ifscCode === 'UPI' ? 'UPI' : 'BANK',
        bankName: selectedAcc.bankName || 'BANK',
        accountHolderName: selectedAcc.accountHolderName || user?.name || '',
        accountNumber: selectedAcc.accountNumber,
        ifscCode: selectedAcc.ifscCode || 'IFSC',
        accountType: selectedAcc.accountType || 'SAVINGS',
      };

      const response = await createwithdraw(withdrawPayload);

      if (response?.success || response?.status === 200 || response?.data?.success) {
        const msg = `Withdrawal request for ₹${amt.toLocaleString()} submitted successfully!`;
        if (onToast) onToast({ id: Date.now(), type: 'success', message: msg });
        else toast.success(msg);

        const newBal = Math.max(0, rawBalance - amt);
        dispatch(setUserData({ ...user, availableBalance: newBal, balance: newBal }));
        setPreviousAccountAmount('');
        fetchWithdrawalHistory();
      } else {
        toast.error(response?.data?.message || response?.message || 'Failed to submit withdrawal');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Error submitting withdrawal');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // DEMO RESTRICTION BANNER
  // ----------------------------------------------------
  if (isDemoUser) {
    return (
      <div className="w-full bg-white rounded-lg p-8 text-center text-gray-800 shadow-sm flex flex-col items-center justify-center my-4 border border-amber-200">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold mb-3">
          ℹ️
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Demo Account Restriction
        </h3>
        <p className="text-sm text-gray-600 max-w-md mb-4">
          Deposit and Withdrawal are not available for demo accounts. Please log in with a real account to deposit or withdraw funds.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[linear-gradient(94deg,#b6842d,#ebda8d_55%,#b7862f)] text-black font-black text-sm rounded shadow hover:brightness-105 transition-all cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 font-sans select-none antialiased">


      {/* 1. TOP LIGHT GREY BAR WITH GOLDEN BACK BUTTON */}
      <div className="w-full bg-[#dedddd] p-3 rounded-md flex items-center mb-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-[#b8852e] hover:bg-[#a57525] text-white px-5 py-1.5 rounded-md font-bold text-sm cursor-pointer shadow-xs active:scale-95 transition-all border-none"
        >
          Back
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEPOSIT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'deposit' && (
        <div className="flex flex-col gap-3">
          {!openGateway ? (
            /* Amount Selector Card */
            <div className="bg-white rounded-md shadow-xs border border-[#dedddd] p-4 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                Deposit Amount
              </h3>

              {/* Amount Input + SUBMIT Button Inline */}
              <div className="flex items-center w-full border border-[#cccccc] rounded-md overflow-hidden h-[42px] mb-1">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-3 py-2 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none border-none bg-white h-full"
                />
                <button
                  type="button"
                  onClick={() => setOpenGateway(true)}
                  disabled={!depositAmount || Number(depositAmount) < 100}
                  className="bg-[#384656] hover:bg-[#2b3745] text-white font-bold px-6 h-full uppercase text-xs sm:text-sm tracking-wider cursor-pointer transition-colors disabled:opacity-50 border-none shrink-0"
                >
                  SUBMIT
                </button>
              </div>

              {/* Min/Max Text */}
              <div className="text-right text-xs sm:text-sm font-medium text-gray-700 mb-3.5">
                Min: 100 | Max: 200000
              </div>

              {/* Quick Stake Chips (+ 200, + 500, + 1000, + 3000) */}
              <div className="flex flex-wrap gap-2.5 mb-3.5">
                {[200, 500, 1000, 3000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setDepositAmount((prev) =>
                        ((parseInt(prev, 10) || 0) + val).toString()
                      )
                    }
                    className="bg-[#333333] hover:bg-[#222222] text-white font-semibold px-5 py-2 rounded-md text-xs sm:text-sm shadow-xs transition-colors cursor-pointer border-none"
                  >
                    + {val}
                  </button>
                ))}
              </div>

              {/* Edit Stakes Button */}
              <button
                type="button"
                onClick={() => navigate('/stake-settings')}
                style={{
                  background: 'linear-gradient(180deg, #d3a84e 0%, #b6842d 100%)',
                }}
                className="w-full py-2.5 px-4 rounded-md font-bold text-black flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:brightness-105 active:scale-98 transition-all border-none text-xs sm:text-sm"
              >
                <svg
                  className="w-4 h-4 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit stakes
              </button>
            </div>
          ) : (
            /* PAYMENT GATEWAY MODAL / SCREEN (PhonePe, Bank, USDT) */
            <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-4">
              {/* Back to Amount */}
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <button
                  type="button"
                  onClick={() => setOpenGateway(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Amount
                </button>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 font-bold mr-1.5">Amount:</span>
                  <span className="text-sm font-black text-[#0e6438]">₹{depositAmount}</span>
                </div>
              </div>

              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setGatewayTab('phone pe')}
                  className={`p-2.5 rounded-lg text-white font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    gatewayTab === 'phone pe'
                      ? 'bg-[#673AB7] ring-2 ring-black shadow-md'
                      : 'bg-[#673AB7]/80 hover:bg-[#673AB7]'
                  }`}
                >
                  <SiPhonepe className="w-6 h-6" />
                  <span className="text-[10px] sm:text-xs uppercase">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayTab('account')}
                  className={`p-2.5 rounded-lg text-white font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    gatewayTab === 'account'
                      ? 'bg-[#0288D1] ring-2 ring-black shadow-md'
                      : 'bg-[#0288D1]/80 hover:bg-[#0288D1]'
                  }`}
                >
                  <BsBank2 className="w-6 h-6" />
                  <span className="text-[10px] sm:text-xs uppercase">Bank Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayTab('usdt')}
                  className={`p-2.5 rounded-lg text-white font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    gatewayTab === 'usdt'
                      ? 'bg-[#26A17B] ring-2 ring-black shadow-md'
                      : 'bg-[#26A17B]/80 hover:bg-[#26A17B]'
                  }`}
                >
                  <SiTether className="w-6 h-6" />
                  <span className="text-[10px] sm:text-xs uppercase">USDT (Crypto)</span>
                </button>
              </div>

              {/* Details & Submission Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Left: Admin Bank / QR Details */}
                <div className="bg-[#f8fafc] border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b pb-2">
                    Step 1: Transfer Funds to Below {gatewayTab.toUpperCase()}
                  </h4>

                  {/* UPI / QR View */}
                  {gatewayTab === 'phone pe' && (
                    <div className="space-y-3">
                      {paymentDetails.gpay?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white p-2.5 rounded border">
                          <span className="font-bold text-gray-700">UPI ID:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700">{item.upiId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.upiId)}
                              className="p-1 bg-[#00A63E] hover:bg-green-700 text-white rounded cursor-pointer"
                              title="Copy UPI"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {paymentDetails.gpay?.[0]?.imageUrl && (
                        <div className="flex flex-col items-center bg-white p-3 rounded-lg border shadow-xs">
                          <img
                            src={qrImageUrl || paymentDetails.gpay[0].imageUrl}
                            alt="QR Code"
                            className="w-48 h-48 object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => saveAs(qrImageUrl || paymentDetails.gpay[0].imageUrl, 'deposit-qr.png')}
                          />
                          <p className="text-[10px] text-gray-500 mt-2">
                            Scan with PhonePe / GPay / Paytm or click to download
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Account View */}
                  {gatewayTab === 'account' && (
                    <div className="space-y-2">
                      {paymentDetails.account?.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">Bank:</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>{item.bankName}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.bankName)}
                                className="p-1 bg-[#00A63E] text-white rounded cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">Account No:</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold">
                              <span>{item.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.accountNumber)}
                                className="p-1 bg-[#00A63E] text-white rounded cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">IFSC Code:</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold">
                              <span>{item.ifsc || item.ifscCode}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.ifsc || item.ifscCode)}
                                className="p-1 bg-[#00A63E] text-white rounded cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">Holder:</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>{item.accountHolderName || item.accountHolder}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.accountHolderName || item.accountHolder)}
                                className="p-1 bg-[#00A63E] text-white rounded cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* USDT View */}
                  {gatewayTab === 'usdt' && (
                    <div className="space-y-3">
                      {paymentDetails.usdt?.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-600">Address:</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold">
                              <span className="break-all text-[11px]">{item.walletAddress || item.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.walletAddress || item.accountNumber)}
                                className="p-1 bg-[#00A63E] text-white rounded cursor-pointer shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {item.network && (
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-600">Network:</span>
                              <span className="font-bold text-xs">{item.network}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {paymentDetails.usdt?.[0]?.imageUrl && (
                        <div className="flex flex-col items-center bg-white p-3 rounded-lg border shadow-xs">
                          <img
                            src={qrImageUrl || paymentDetails.usdt[0].imageUrl}
                            alt="USDT QR Code"
                            className="w-48 h-48 object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => saveAs(qrImageUrl || paymentDetails.usdt[0].imageUrl, 'usdt-qr.png')}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Step 2 UTR & Screenshot Upload */}
                <form onSubmit={handleSubmitDepositPayment} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b pb-2">
                    Step 2: Enter Transaction Details
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {gatewayTab === 'usdt' ? 'Transaction Hash' : 'UTR / Transaction ID'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={gatewayForm.UTR}
                      onChange={(e) => setGatewayForm((prev) => ({ ...prev, UTR: e.target.value }))}
                      placeholder={gatewayTab === 'usdt' ? 'Enter TX Hash' : 'Enter 12 Digit UTR Number'}
                      className="w-full p-2.5 border rounded-lg text-xs font-bold focus:border-[#b6842d] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full p-2 border rounded-lg text-xs cursor-pointer focus:border-[#b6842d] outline-none"
                      required
                    />
                    {imagePreview && (
                      <div className="flex items-center gap-2 mt-2 bg-neutral-50 p-2 rounded border">
                        <img src={imagePreview} alt="Receipt Preview" className="w-12 h-12 object-cover rounded border" />
                        <span className="text-xs font-bold text-green-700">Proof attached</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gatewayForm.termsAccepted}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                        className="mr-2 h-4 w-4 rounded accent-[#b6842d]"
                      />
                      I accept terms & conditions of deposit
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={gatewayLoading || !gatewayForm.UTR || !gatewayForm.image || !gatewayForm.termsAccepted}
                    style={{
                      background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                    }}
                    className="w-full text-black font-black py-3 rounded-lg shadow hover:brightness-105 disabled:opacity-50 transition-all text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {gatewayLoading ? 'Submitting...' : 'SUBMIT DEPOSIT REQUEST'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Instructions Box (Numbered Rules List) */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3 text-sm text-gray-800 font-medium leading-snug">
            <p><strong>1. Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.</strong></p>
            <p><strong>2. Deposits made 45 minutes after the account removal from the site are valid & will be added to their wallets.</strong></p>
            <p><strong>3. Site is not responsible for money deposited to Old, Inactive or Closed accounts.</strong></p>
            <p><strong>4. After deposit, add your UTR and amount to receive balance.</strong></p>
            <p><strong>5. NEFT receiving time varies from 40 minutes to 2 hours.</strong></p>
            <p><strong>6. In case of account modification: payment valid for 1 hour after changing account details in deposit page.</strong></p>
          </div>

          {/* Filter Select & Deposit History Table */}
          <div className="space-y-3">
            <select
              value={depositHistoryFilter}
              onChange={(e) => setDepositHistoryFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-white outline-none focus:border-gray-500 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a2b3c] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 border-r border-gray-700/50">REQUEST TYPE</th>
                    <th className="py-3 px-4 border-r border-gray-700/50">PAYMENT METHOD</th>
                    <th className="py-3 px-4">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepositHistory.length > 0 ? (
                    filteredDepositHistory.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200 text-xs font-medium text-gray-800 hover:bg-gray-50">
                        <td className="py-3 px-4">{item.PaymentMode || 'Deposit'}</td>
                        <td className="py-3 px-4">{item.PaymentMethod || 'UPI'}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">₹{item.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-sm font-medium text-gray-800">
                        No data found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WITHDRAWAL VIEW (Exact Kuberbook666 Reference) */}
      {/* ========================================================================= */}
      {activeTab === 'withdraw' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
            {/* Balance Overview */}
            <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200 p-3 rounded-lg mb-4">
              <div>
                <span className="text-[11px] text-gray-600 font-bold block">Available Balance</span>
                <span className="text-lg font-black text-[#0e6438]">₹{balance}</span>
              </div>
              <div className="text-right text-[11px] text-gray-500">
                Min: ₹300 | Max: ₹1,000,000
              </div>
            </div>

            {/* Account Mode Switcher ("Use New Account" vs "Use Previous Account") */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAccountMode('new')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  accountMode === 'new'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Use New Account
              </button>
              <button
                type="button"
                onClick={() => setAccountMode('previous')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  accountMode === 'previous'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Use Previous Account ({savedAccounts.length})
              </button>
            </div>

            {/* Method Switcher: BANK vs UPI */}
            {accountMode === 'new' && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('BANK')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    withdrawMethod === 'BANK'
                      ? 'border-2 border-[#b6842d] bg-amber-50 text-black'
                      : 'border border-neutral-300 bg-white text-neutral-600'
                  }`}
                >
                  <BsBank2 className="w-4 h-4 text-[#b6842d]" /> Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('UPI')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    withdrawMethod === 'UPI'
                      ? 'border-2 border-[#b6842d] bg-amber-50 text-black'
                      : 'border border-neutral-300 bg-white text-neutral-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#b6842d]" /> UPI ID
                </button>
              </div>
            )}

            {/* Mode A: New Account Form */}
            {accountMode === 'new' ? (
              <form onSubmit={handleSubmitNewAccountWithdraw} className="space-y-3">
                {withdrawMethod === 'BANK' ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankForm.accountName}
                          onChange={(e) => setBankForm((prev) => ({ ...prev, accountName: e.target.value }))}
                          placeholder="Full Name as in Bank"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankForm.accountNo}
                          onChange={(e) => setBankForm((prev) => ({ ...prev, accountNo: e.target.value }))}
                          placeholder="Account Number"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold font-mono focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          IFSC Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankForm.ifsc}
                          onChange={(e) => setBankForm((prev) => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                          placeholder="e.g. HDFC0001234"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold font-mono uppercase focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          placeholder="e.g. HDFC Bank"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={upiForm.accountName}
                          onChange={(e) => setUpiForm((prev) => ({ ...prev, accountName: e.target.value }))}
                          placeholder="Full Name"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          UPI ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={upiForm.upiId}
                          onChange={(e) => setUpiForm((prev) => ({ ...prev, upiId: e.target.value }))}
                          placeholder="e.g. username@okhdfcbank"
                          className="w-full p-2.5 border rounded-lg text-xs font-bold font-mono focus:border-[#b6842d] outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={upiForm.mobileNo}
                        onChange={(e) => setUpiForm((prev) => ({ ...prev, mobileNo: e.target.value }))}
                        placeholder="10-digit mobile"
                        className="w-full p-2.5 border rounded-lg text-xs font-bold focus:border-[#b6842d] outline-none"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Withdrawal Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={withdrawMethod === 'BANK' ? bankForm.amount : upiForm.amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (withdrawMethod === 'BANK') setBankForm((prev) => ({ ...prev, amount: val }));
                        else setUpiForm((prev) => ({ ...prev, amount: val }));
                      }}
                      placeholder="Enter amount"
                      className="w-full p-2.5 pl-7 border rounded-lg text-sm font-black focus:border-[#b6842d] outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Quick Withdraw Chips */}
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 2000, 5000].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        if (withdrawMethod === 'BANK') setBankForm((prev) => ({ ...prev, amount: String(chip) }));
                        else setUpiForm((prev) => ({ ...prev, amount: String(chip) }));
                      }}
                      className="text-xs font-bold px-2.5 py-1 border rounded bg-gray-50 hover:bg-amber-50 cursor-pointer"
                    >
                      ₹{chip}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const full = Math.floor(rawBalance);
                      if (withdrawMethod === 'BANK') setBankForm((prev) => ({ ...prev, amount: String(full) }));
                      else setUpiForm((prev) => ({ ...prev, amount: String(full) }));
                    }}
                    className="text-xs font-bold px-2.5 py-1 border border-[#b6842d] text-[#8a6019] rounded bg-amber-50 cursor-pointer"
                  >
                    Full Balance
                  </button>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withdrawTermsAccepted}
                      onChange={(e) => setWithdrawTermsAccepted(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded accent-[#b6842d]"
                    />
                    I accept the terms of payment and withdrawal policy
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={withdrawSubmitting || !withdrawTermsAccepted}
                  style={{
                    background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                  }}
                  className="w-full text-black font-black py-3.5 rounded-lg shadow hover:brightness-105 disabled:opacity-50 transition-all text-sm uppercase tracking-wider cursor-pointer"
                >
                  {withdrawSubmitting ? 'Submitting...' : 'SUBMIT WITHDRAWAL'}
                </button>
              </form>
            ) : (
              /* Mode B: Previous Saved Accounts */
              <form onSubmit={handleSubmitPreviousAccountWithdraw} className="space-y-4">
                {loadingAccounts ? (
                  <div className="py-6 text-center text-xs text-gray-500">Loading saved accounts...</div>
                ) : savedAccounts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 border border-dashed rounded-lg">
                    No saved accounts found. Switch to "Use New Account" to add one.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Select Saved Account:</label>
                    <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                      {savedAccounts.map((acc) => {
                        const accId = acc._id || acc.id;
                        const isSelected = selectedSavedAccountId === accId;
                        return (
                          <div
                            key={accId}
                            onClick={() => setSelectedSavedAccountId(accId)}
                            className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#b6842d] bg-amber-50/70 ring-1 ring-[#b6842d]'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-xs">
                              <div className="font-bold text-gray-800">
                                {acc.bankName || 'Bank'} - {acc.accountHolderName}
                              </div>
                              <div className="font-mono text-gray-600 text-[11px]">
                                {acc.accountNumber} ({acc.ifscCode})
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedAccount(accId, e)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Withdrawal Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={previousAccountAmount}
                      onChange={(e) => setPreviousAccountAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-2.5 pl-7 border rounded-lg text-sm font-black focus:border-[#b6842d] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 2000, 5000].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPreviousAccountAmount(String(chip))}
                      className="text-xs font-bold px-2.5 py-1 border rounded bg-gray-50 hover:bg-amber-50 cursor-pointer"
                    >
                      ₹{chip}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPreviousAccountAmount(String(Math.floor(rawBalance)))}
                    className="text-xs font-bold px-2.5 py-1 border border-[#b6842d] text-[#8a6019] rounded bg-amber-50 cursor-pointer"
                  >
                    Full Balance
                  </button>
                </div>

                <div className="pt-2">
                  <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withdrawTermsAccepted}
                      onChange={(e) => setWithdrawTermsAccepted(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded accent-[#b6842d]"
                    />
                    I accept the terms of payment and withdrawal policy
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={withdrawSubmitting || !withdrawTermsAccepted || !selectedSavedAccountId}
                  style={{
                    background: 'linear-gradient(94deg, #b6842d 0%, #ebda8d 55%, #b7862f 100%)',
                  }}
                  className="w-full text-black font-black py-3.5 rounded-lg shadow hover:brightness-105 disabled:opacity-50 transition-all text-sm uppercase tracking-wider cursor-pointer"
                >
                  {withdrawSubmitting ? 'Submitting...' : 'SUBMIT WITHDRAWAL'}
                </button>
              </form>
            )}
          </div>

          {/* Withdrawal History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-xs sm:text-sm text-gray-800">
                Withdrawal History ({withdrawHistory.length})
              </h3>
              <button
                type="button"
                onClick={fetchWithdrawalHistory}
                className="text-xs text-[#8a6019] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {withdrawHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                No withdrawal history yet
              </div>
            ) : (
              <div className="space-y-2">
                {withdrawHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="border p-3 rounded-lg flex justify-between items-center text-xs bg-gray-50/70"
                  >
                    <div>
                      <div className="font-black uppercase text-gray-800">
                        {item.paymentMethod || item.PaymentMode || 'Withdrawal'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Account: {item.accountNumber || item.upiId || 'N/A'}
                      </div>
                      {item.createdAt && (
                        <div className="text-[9px] text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-amber-800 text-sm">₹{item.withdrawAmount || item.amount}</div>
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                          item.status === 'Approved' || item.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'Rejected' || item.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Share2,
  Award,
  Users,
  QrCode,
  CheckCircle,
  Scan,
  X,
  Gift,
  TrendingUp,
} from "lucide-react";
import QRCode from "react-qr-code";
import QrReader from "react-qr-scanner";
import { useSelector } from "react-redux";
import {
  getreferralKey,
  selectAdminDomainID,
  selectSiteDomainName,
} from "../../../../utils/helper/commonSelectors";
import { getAffiliateData, getSiteSetting } from "../../../../api/index";

export default function Referral() {
  const referralKey = useSelector(getreferralKey());
  const siteName = useSelector(selectSiteDomainName());
  const domainId = useSelector(selectAdminDomainID());

  const [referralCode] = useState(referralKey);
  const [referralLink] = useState(() => {
    const baseUrl = siteName?.startsWith("http") ? siteName : `http://${siteName}`;
    return new URL(`/signup?signUp=true&referral=${referralKey}`, baseUrl).href;
  });

  const [currentUserId, setCurrentUserId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [toast, setToast] = useState({ visible: false, title: "", description: "" });
  const [affiliateData, setAffiliateData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNonDepositedPopup, setShowNonDepositedPopup] = useState(false);

  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    nonDepositedUsers: 0,
  });

  // Dynamic percentages from backend
  const [parentReferral, setParentReferral] = useState(0);
  const [depositorReferral, setDepositorReferral] = useState(0);
  const [subparentReferral, setSubparentReferral] = useState(0);
  const [everyDepositReferral, setEveryDepositReferral] = useState(0);

  // ========== BODY BACKGROUND CHANGE ==========
  useEffect(() => {
    // Save original styles
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;

    // Force dark theme on body
    document.body.style.backgroundColor = "#0a1424";
    document.body.style.color = "#ffffff";

    // Cleanup when leaving the page
    return () => {
      document.body.style.backgroundColor = originalBg || "";
      document.body.style.color = originalColor || "";
    };
  }, []);
  // ============================================

  const friendBenefit =
    depositorReferral > 0
      ? `Friends get ${depositorReferral}% bonus on first deposit!`
      : "Your friends get special bonus on signup!";

  const yourEarning =
    parentReferral > 0
      ? `You earn ${parentReferral}% on their first deposit`
      : "You earn rewards on their activity";

  const fetchAffiliateData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAffiliateData(1, 50, "", [], "all", currentUserId || undefined);
      const users = response.data?.users || [];
      setAffiliateData(users);

      const activeReferrals = users.filter((u) => u.status === "active").length;
      const totalEarnings = users.reduce((sum, u) => sum + (u.referralRewardEarned || 0), 0);
      const nonDeposited = users.filter((u) => !u.hasMadeFirstDeposit).length;

      setStats({
        totalReferrals: users.length,
        activeReferrals,
        totalEarnings,
        nonDepositedUsers: nonDeposited,
      });
    } catch (error) {
      showToast("Error", "Failed to load referral data");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const fetchSiteSettings = async () => {
    try {
      const res = await getSiteSetting(domainId);
      if (res.success) {
        const s = res.data?.settings || {};
        setParentReferral(s.parentReferral || 0);
        setDepositorReferral(s.depositorReferral || 0);
        setEveryDepositReferral(s.everydepositReferral || 0);
        setSubparentReferral(s.subparentReferral || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  const showToast = (title, description) => {
    setToast({ visible: true, title, description });
    setTimeout(() => setToast({ visible: false, title: "", description: "" }), 3000);
  };

  const copyToClipboard = (text, type = "code") => {
    navigator.clipboard.writeText(text);
    showToast("Copied!", type === "code" ? "Referral code copied" : "Referral link copied");
  };

  const shareReferral = async () => {
    const proMessage = `Exclusive Invite!

Get ${depositorReferral}% Bonus on First Deposit

Join now: ${referralLink}

I earn ${parentReferral}% lifetime commission – fully transparent

Trusted • Fast Withdrawals • 24/7 Support`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me & Get Bonus!",
          text: proMessage,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(proMessage);
          showToast("Copied!", "Professional invite copied");
        }
      }
    } else {
      navigator.clipboard.writeText(proMessage);
      showToast("Copied!", "Invite message copied to clipboard");
    }
  };

  const handleScan = (data) => {
    if (data) {
      setScannedCode(data.text || data);
      showToast("Success", "QR Code scanned!");
      setShowScanner(false);
    }
  };

  const handleCallUser = (mobile) => {
    window.location.href = `tel:${mobile}`;
  };

  const referrals = affiliateData.map((user) => ({
    id: user._id,
    name: user.name || user.userName || "User",
    date: user.createdAt,
    status: user.status,
    firstDeposit: user.firstAccountStatement?.deposit || "N/A",
    rewardAmount: user.referralRewardEarned || 0,
  }));

  const nonDepositedUsers = affiliateData
    .filter((u) => !u.hasMadeFirstDeposit)
    .map((u) => ({ id: u._id, userName: u.userName, mobile: u.mobile }));

  return (
    <div className="min-h-screen bg-[#0a1424] text-white pb-10 -mb-[100px]">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-4 right-4 bg-[#0f1f2e] border border-[#00e676]/40 rounded-xl shadow-lg p-4 z-50 max-w-xs animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-[#00e676] mr-2" />
            <h4 className="font-medium text-white">{toast.title}</h4>
          </div>
          <p className="text-[#a0b0c5] text-sm mt-1">{toast.description}</p>
        </div>
      )}

      {/* Non-Deposited Popup */}
      {showNonDepositedPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 shadow-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Users Yet to Deposit</h3>
              <button
                onClick={() => setShowNonDepositedPopup(false)}
                className="text-[#8fa0bd] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {nonDepositedUsers.length > 0 ? (
              <div className="space-y-3">
                {nonDepositedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-[#061018] rounded-xl border border-white/10"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <p className="font-medium text-white">{user.userName}</p>
                        <p className="text-sm text-[#8fa0bd]">{user.mobile}</p>
                      </div>
                      <button
                        onClick={() => handleCallUser(user.mobile)}
                        className="px-4 py-2 bg-[#00e676] text-[#0a1424] font-bold rounded-lg text-sm"
                      >
                        Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#8fa0bd] text-center py-6">
                All users have made their first deposit.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a1424]/95 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00e676]/15 border border-[#00e676]/40 flex items-center justify-center text-[#00e676]">
            <Gift size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Referral & Earn</h1>
            <p className="text-[#7a8ba3] text-xs">Invite friends & earn rewards</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#00e676]/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#00e676]" />
              </div>
              <div>
                <p className="text-xs text-[#8fa0bd]">Total Referrals</p>
                <p className="text-xl font-bold">{stats.totalReferrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-[#8fa0bd]">Active</p>
                <p className="text-xl font-bold">{stats.activeReferrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-[#8fa0bd]">Total Earnings</p>
                <p className="text-xl font-bold">₹{stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-[#0f1f2e] rounded-2xl border border-white/10 p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setShowNonDepositedPopup(true)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-[#8fa0bd]">Non-Deposited</p>
                <p className="text-xl font-bold">{stats.nonDepositedUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[#0f1f2e] border border-white/10 p-1">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors ${
              activeTab === "code"
                ? "bg-[#00e676]/20 text-[#00e676]"
                : "text-[#8fa0bd] hover:text-white"
            }`}
          >
            Referral Code
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors ${
              activeTab === "qr"
                ? "bg-[#00e676]/20 text-[#00e676]"
                : "text-[#8fa0bd] hover:text-white"
            }`}
          >
            QR Code
          </button>
        </div>

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="space-y-4">
            {/* Referral Code Card */}
            <div className="bg-[#0f1f2e] rounded-2xl border border-[#00e676]/25 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-[#00e676]" />
                  <h3 className="font-bold text-white">Your Referral Code</h3>
                </div>
                <p className="text-sm text-[#8fa0bd] mt-1">{friendBenefit}</p>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#061018] rounded-xl border border-white/10">
                  <span className="text-xl font-mono font-bold text-[#00e676] tracking-wider">
                    {referralCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(referralCode, "code")}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg flex items-center text-sm text-[#c3cfe0]"
                  >
                    <Copy className="h-4 w-4 mr-1.5" /> Copy
                  </button>
                </div>

                <div>
                  <p className="text-xs text-[#6b7c93] mb-1.5">Your Invite Link</p>
                  <div className="flex items-center gap-2 p-3 bg-[#061018] rounded-xl border border-white/10">
                    <div className="truncate text-sm text-[#a0b0c5] font-mono flex-1">
                      {referralLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(referralLink, "link")}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg flex-shrink-0"
                    >
                      <Copy className="h-4 w-4 text-[#8fa0bd]" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={shareReferral}
                  className="w-full py-3.5 bg-gradient-to-r from-[#00c853] to-[#00e676] text-[#0a1424] rounded-xl flex items-center justify-center font-bold active:scale-[0.98] transition-transform"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share with Friends
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white">How It Works</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#00e676]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00e676] font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Share your referral code</p>
                    <p className="text-sm text-[#8fa0bd]">
                      Send your unique code to friends via WhatsApp, social media or SMS
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#00e676]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00e676] font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Friends sign up</p>
                    <p className="text-sm text-[#8fa0bd]">
                      They get {subparentReferral || depositorReferral}% bonus on first deposit
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#00e676]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00e676] font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">You earn rewards</p>
                    <p className="text-sm text-[#8fa0bd]">{yourEarning}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Tab */}
        {activeTab === "qr" && (
          <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#00e676]" />
                <h3 className="font-bold text-white">Your Referral QR Code</h3>
              </div>
              <p className="text-sm text-[#8fa0bd] mt-1">
                Let friends scan this code to join using your referral
              </p>
            </div>
            <div className="p-5 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCode value={referralLink} size={200} level="H" />
              </div>

              {showScanner && (
                <div className="mt-4 w-full">
                  <div className="p-2 bg-black rounded-xl overflow-hidden">
                    <QrReader
                      delay={300}
                      onError={() => {}}
                      onScan={handleScan}
                      style={{ width: "100%", height: "280px" }}
                      constraints={{ facingMode: "environment" }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowScanner(!showScanner)}
                className="mt-4 px-5 py-2.5 bg-[#00e676]/15 border border-[#00e676]/40 text-[#00e676] rounded-xl font-bold flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                {showScanner ? "Hide Scanner" : "Show Scanner"}
              </button>
            </div>
          </div>
        )}

        {/* Your Referrals List */}
        <div className="bg-[#0f1f2e] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00e676]" />
              <h3 className="font-bold text-white">Your Referrals</h3>
            </div>
            <button
              onClick={fetchAffiliateData}
              className="text-sm text-[#00e676] font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00e676] border-r-transparent"></div>
              </div>
            ) : referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-[#061018] border border-white/10 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#00e676]/15 flex items-center justify-center text-sm font-bold text-[#00e676]">
                          {r.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{r.name}</p>
                          <p className="text-xs text-[#6b7c93]">
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          r.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-[#8fa0bd]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[#6b7c93]">First Deposit:</span>
                        <span className="ml-1 font-medium text-white">{r.firstDeposit}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[#6b7c93]">Your Reward:</span>
                        <span className="ml-1 font-medium text-[#00e676]">
                          ₹{r.rewardAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-white/20" />
                <p className="mt-3 text-[#8fa0bd]">No referrals yet</p>
                <p className="text-sm text-[#6b7c93] mt-1 mb-4">
                  Share your code to start earning rewards
                </p>
                <button
                  onClick={shareReferral}
                  className="py-2.5 px-5 bg-[#00e676] text-[#0a1424] rounded-xl flex items-center justify-center mx-auto font-bold"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Invite Friends
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
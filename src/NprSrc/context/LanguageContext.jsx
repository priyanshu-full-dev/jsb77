import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const translations = {
  en: {
    // Header & User
    "Show balance": "Show balance",
    "Hide balance": "Hide balance",
    "Go to Members Profile": "Go to Members Profile",
    "WhatsApp Support": "WhatsApp Support",
    "Live Customer Service": "Live Customer Service",
    "Select Language": "Select Language",
    "English": "English",
    "नेपाली": "नेपाली",
    "Download": "Download",

    // Auth Bar & Modals
    "Login": "Login",
    "Register": "Register",
    "Deposit": "Deposit",
    "Withdrawal": "Withdrawal",
    "Remember": "Remember",
    "Forgot password?": "Forgot password?",
    "Username": "Username",
    "Password": "Password",
    "Confirm password": "Confirm password",
    "Password (minimum 6 characters)": "Password (minimum 6 characters)",
    "10 digit phone number": "10 digit phone number",
    "OTP (default: 1234)": "OTP (default: 1234)",
    "Send OTP": "Send OTP",
    "Resend OTP": "Resend OTP",
    "Sending...": "Sending...",
    "Invitation code (optional)": "Invitation code (optional)",
    "Already have an account? Login": "Already have an account? Login",
    "I am 18 years old and agree to the terms & conditions of JSB77": "I am 18 years old and agree to the terms & conditions of JSB77",
    "Logging in...": "Logging in...",
    "Registering...": "Registering...",

    // Bottom Navigation
    "Home": "Home",
    "Sports": "Sports",
    "Casino": "Casino",
    "Invite": "Invite",
    "Members": "Members",

    // Home Categories & Sections
    "Cricket": "Cricket",
    "Soccer": "Soccer",
    "Tennis": "Tennis",
    "Slots": "Slots",
    "Table": "Table",
    "Crash": "Crash",
    "Fish": "Fish",
    "Arcade": "Arcade",
    "Lottery": "Lottery",
    "Hot Games": "Hot Games",
    "Live Casino": "Live Casino",
    "Popular Slots": "Popular Slots",
    "Sports Events": "Sports Events",
    "View All": "View All",
    "In Play": "In Play",
    "Upcoming": "Upcoming",
    "All Providers": "All Providers",
    "Featured Games": "Featured Games",
    "Hot": "Hot",
    "Poker": "Poker",
    "All": "All",
    "All Games": "All Games",
    "Hot Slots": "Hot Slots",
    "Favorites": "Favorites",
    "Favorite Games": "Favorite Games",
    "Search": "Search",
    "Search Games": "Search Games",
    "Search slot games...": "Search slot games...",
    "Search fish games...": "Search fish games...",
    "Search poker games...": "Search poker games...",
    "3 Reels": "3 Reels",
    "5 Reels": "5 Reels",
    "Pink": "Pink",
    "Fishing Machine": "Fishing Machine",
    "Multiplayer game": "Multiplayer game",

    // Menu Drawer
    "Promotion": "Promotion",
    "VIP": "VIP",
    "Affiliate": "Affiliate",
    "App": "App",
    "Logout": "Logout",
    "Customer Service": "Customer Service",
    "Reward Center": "Reward Center",
    "Betting Record": "Betting Record",
    "Beginner Guide": "Beginner Guide",

    // Members Page Items
    "My Rewards": "My Rewards",
    "Bet History": "Bet History",
    "Deposit Record": "Deposit Record",
    "Profit And Loss": "Profit And Loss",
    "Withdrawal Record": "Withdrawal Record",
    "Transaction History": "Transaction History",
    "My Account": "My Account",
    "Security Center": "Security Center",
    "Points": "Points",
    "Invite Friends": "Invite Friends",
    "Rebate": "Rebate",
    "Internal Message": "Internal Message",
    "Suggestion": "Suggestion",
    "Download APP": "Download APP",
    "VIP Level": "VIP Level",
    "Total Balance": "Total Balance",
    "Normal Member": "Normal Member",
    "Personal Info": "Personal Info",
    "Reset Password": "Reset Password",

    // Deposit Page
    "Deposit Method": "Deposit Method",
    "Payment Channel": "Payment Channel",
    "Deposit Amounts": "Deposit Amounts",
    "Promotions": "Promotions",
    "Turnover": "Turnover",
    "Payment Details": "Payment Details",
    "Actual Payment Amount": "Actual Payment Amount",
    "Next": "Next",
    "Deposit Info": "Deposit Info: Please do not save our number for deposits. Always check the website before making a deposit.",
    "Instant Bonus": "Instant Bonus",
    "Merchant Account Name": "Merchant Account Name",
    "Transaction / Reference ID (आवश्यक)": "Transaction / Reference ID (Required)",
    "Submit Deposit": "Submit Deposit",
    "Processing Deposit...": "Processing Deposit...",
    "Copy": "Copy",
    "Copied": "Copied",

    // Withdrawal Page
    "Bank Accounts": "Bank Accounts",
    "E wallet": "E wallet",
    "Crypto Wallet": "Crypto Wallet",
    "No bank account linked yet": "No bank account linked yet",
    "Withdrawal time: 24 hours": "Withdrawal time: 24 hours",
    "Daily withdrawal 2 (Times), Remaining withdrawal 2 (Times)": "Daily withdrawal 2 (Times), Remaining withdrawal 2 (Times)",
    "Main Wallet": "Main Wallet",
    "Available Amount": "Available Amount",
    "Refresh Balance": "Refresh Balance",
    "Withdrawal Amount:": "Withdrawal Amount:",
    "Amount": "Amount",
    "Submit": "Submit",
    "Confirm": "Confirm",
    "Cancel": "Cancel",
    "Bonus": "Bonus",
    "Link Bank Account": "Link Bank Account",
    "Link E-Wallet": "Link E-Wallet",
    "Link Crypto Wallet": "Link Crypto Wallet",
    "Select Bank": "Select Bank",
    "Select Wallet": "Select Wallet",
    "Crypto Network": "Crypto Network",
    "Account Holder Name": "Account Holder Name",
    "Full Legal Name": "Full Legal Name",
    "Bank Account Number": "Bank Account Number",
    "Mobile / Wallet ID": "Mobile / Wallet ID",
    "Wallet Address": "Wallet Address",
    "Branch Name": "Branch Name",
    "Save & Link Account": "Save & Link Account",

    // Invite Page
    "Today's Income": "Today's Income",
    "Yesterday's Income": "Yesterday's Income",
    "Registers": "Registers",
    "Valid Referral": "Valid Referral",
    "Revenue goals": "Revenue goals",
    "Invite 50 user to meet the target": "Invite 50 user to meet the target",
    "Rewards Released to Date": "Rewards Released to Date",
    "Invitation Rewards": "Invitation Rewards",
    "Achievement Rewards": "Achievement Rewards",
    "Deposit Rebate": "Deposit Rebate",
    "Betting Rebate": "Betting Rebate",
    "Empty": "Empty",
    "Share with your friends": "Share with your friends",
    "Leaderboard": "Leaderboard",
    "Who received the rewards": "Who received the rewards",
    "Income calculator": "Income calculator",
    "active users, expected revenue": "active users, expected revenue",
    "claimed": "claimed",
    "Received": "Received",

    // Promotion Page
    "Bonus Value": "Bonus Value",
    "Min Deposit": "Min Deposit",
    "Rollover": "Rollover",
    "Status": "Status",
    "Active": "Active",
    "Deposit & Claim": "Deposit & Claim",
    "Close": "Close",
    "View All Promotions": "View All Promotions",

    // Bet History Page
    "Exclusion turnover list": "Exclusion turnover list",
    "Live": "Live",
    "Slot": "Slot",
  },
  np: {
    // Header & User
    "Show balance": "ब्यालेन्स देखाउनुहोस्",
    "Hide balance": "ब्यालेन्स लुकाउनुहोस्",
    "Go to Members Profile": "सदस्य प्रोफाइलमा जानुहोस्",
    "WhatsApp Support": "ह्वाट्सएप सहायता",
    "Live Customer Service": "लाइभ ग्राहक सेवा",
    "Select Language": "भाषा चयन गर्नुहोस्",
    "English": "English",
    "नेपाली": "नेपाली",
    "Download": "डाउनलोड",

    // Auth Bar & Modals
    "Login": "लगइन",
    "Register": "दर्ता",
    "Deposit": "निक्षेप",
    "Withdrawal": "निकासी",
    "Remember": "मलाई सम्झनुहोस्",
    "Forgot password?": "पासवर्ड बिर्सनुभयो?",
    "Username": "प्रयोगकर्ता नाम",
    "Password": "पासवर्ड",
    "Confirm password": "पासवर्ड पुष्टि गर्नुहोस्",
    "Password (minimum 6 characters)": "पासवर्ड (कम्तीमा ६ अक्षर)",
    "10 digit phone number": "१० अंकको फोन नम्बर",
    "OTP (default: 1234)": "ओटीपी (पूर्वनिर्धारित: 1234)",
    "Send OTP": "ओटीपी पठाउनुहोस्",
    "Resend OTP": "पुनः पठाउनुहोस्",
    "Sending...": "पठाउँदैछ...",
    "Invitation code (optional)": "निमन्त्रणा कोड (ऐच्छिक)",
    "Already have an account? Login": "पहिले नै खाता छ? लगइन गर्नुहोस्",
    "I am 18 years old and agree to the terms & conditions of JSB77": "म १८ वर्ष पुगेको छु र JSB77 का नियम र सर्तहरूसँग सहमत छु",
    "Logging in...": "लगइन हुँदैछ...",
    "Registering...": "दर्ता हुँदैछ...",

    // Bottom Navigation
    "Home": "गृहपृष्ठ",
    "Sports": "खेलकुद",
    "Casino": "क्यासिनो",
    "Invite": "निमन्त्रणा",
    "Members": "सदस्य",

    // Home Categories & Sections
    "Cricket": "क्रिकेट",
    "Soccer": "फुटबल",
    "Tennis": "टेनिस",
    "Slots": "स्लट",
    "Table": "टेबल",
    "Crash": "क्र्यास",
    "Fish": "माछा",
    "Arcade": "आर्केड",
    "Lottery": "लटरी",
    "Hot Games": "हट खेलहरू",
    "Live Casino": "लाइभ क्यासिनो",
    "Popular Slots": "लोकप्रिय स्लटहरू",
    "Sports Events": "खेलकुद कार्यक्रम",
    "View All": "सबै हेर्नुहोस्",
    "In Play": "प्रत्यक्ष",
    "Upcoming": "आगामी",
    "All Providers": "सबै प्रदायकहरू",
    "Featured Games": "विशेष खेलहरू",
    "Hot": "हट",
    "Poker": "पोकर",
    "All": "सबै",
    "All Games": "सबै खेलहरू",
    "Hot Slots": "हट स्लटहरू",
    "Favorites": "मनपर्ने",
    "Favorite Games": "मनपर्ने खेलहरू",
    "Search": "खोजी",
    "Search Games": "खेलहरू खोज्नुहोस्",
    "Search slot games...": "स्लट खेलहरू खोज्नुहोस्...",
    "Search fish games...": "माछा खेलहरू खोज्नुहोस्...",
    "Search poker games...": "पोकर खेलहरू खोज्नुहोस्...",
    "3 Reels": "३ रिल्स",
    "5 Reels": "५ रिल्स",
    "Pink": "गुलाबी",
    "Fishing Machine": "फिसिङ मेसिन",
    "Multiplayer game": "मल्टिप्लेयर खेल",

    // Menu Drawer
    "Promotion": "प्रवर्द्धन",
    "VIP": "भीआईपी",
    "Affiliate": "सम्बद्ध",
    "App": "एप",
    "Logout": "लगआउट",
    "Customer Service": "ग्राहक सेवा",
    "Reward Center": "पुरस्कार केन्द्र",
    "Betting Record": "बाजी रेकर्ड",
    "Beginner Guide": "शुरुआती गाइड",

    // Members Page Items
    "My Rewards": "मेरा पुरस्कार",
    "Bet History": "बाजी इतिहास",
    "Deposit Record": "निक्षेप रेकर्ड",
    "Profit And Loss": "नाफा र नोक्सान",
    "Withdrawal Record": "निकासी रेकर्ड",
    "Transaction History": "कारोबार इतिहास",
    "My Account": "मेरो खाता",
    "Security Center": "सुरक्षा केन्द्र",
    "Points": "अंकहरू",
    "Invite Friends": "साथीहरूलाई बोलाउनुहोस्",
    "Rebate": "छुट",
    "Internal Message": "आन्तरिक सन्देश",
    "Suggestion": "सुझाव",
    "Download APP": "एप डाउनलोड गर्नुहोस्",
    "VIP Level": "भीआईपी स्तर",
    "Total Balance": "कुल ब्यालेन्स",
    "Normal Member": "सामान्य सदस्य",
    "Personal Info": "व्यक्तिगत जानकारी",
    "Reset Password": "पासवर्ड रिसेट",

    // Deposit Page
    "Deposit Method": "निक्षेप विधि",
    "Payment Channel": "भुक्तानी च्यानल",
    "Deposit Amounts": "निक्षेप रकम",
    "Promotions": "प्रवर्द्धनहरू",
    "Turnover": "टर्नओभर",
    "Payment Details": "भुक्तानी विवरण",
    "Actual Payment Amount": "वास्तविक भुक्तानी रकम",
    "Next": "अर्को",
    "Deposit Info": "निक्षेप जानकारी: कृपया हाम्रो नम्बर निक्षेपको रूपमा बचत नगर्नुहोस्। जम्मा गर्नु अघि सधैं वेबसाइट जाँच गर्नुहोस्",
    "Instant Bonus": "तुरुन्त बोनस",
    "Merchant Account Name": "व्यापारी खाता नाम",
    "Transaction / Reference ID (आवश्यक)": "कारोबार / सन्दर्भ आईडी (आवश्यक)",
    "Submit Deposit": "निक्षेप पेश गर्नुहोस्",
    "Processing Deposit...": "प्रशोधन हुँदैछ...",
    "Copy": "प्रतिलिपि",
    "Copied": "प्रतिलिपि गरियो",

    // Withdrawal Page
    "Bank Accounts": "बैंक खाताहरू",
    "E wallet": "ई-वालेट",
    "Crypto Wallet": "क्रिप्टो वालेट",
    "No bank account linked yet": "अहिलेसम्म कुनै बैंक खाता जोडिएको छैन",
    "Withdrawal time: 24 hours": "निकासी समय: २४ घण्टा",
    "Daily withdrawal 2 (Times), Remaining withdrawal 2 (Times)": "दैनिक निकासी २ (पटक), बाँकी निकासी २ (पटक)",
    "Main Wallet": "मुख्य वालेट",
    "Available Amount": "उपलब्ध रकम",
    "Refresh Balance": "ब्यालेन्स रिफ्रेस",
    "Withdrawal Amount:": "निकासी रकम:",
    "Amount": "रकम",
    "Submit": "पेश गर्नुहोस्",
    "Confirm": "पुष्टि गर्नुहोस्",
    "Cancel": "रद्द गर्नुहोस्",
    "Bonus": "बोनस",
    "Link Bank Account": "बैंक खाता जोड्नुहोस्",
    "Link E-Wallet": "ई-वालेट जोड्नुहोस्",
    "Link Crypto Wallet": "क्रिप्टो वालेट जोड्नुहोस्",
    "Select Bank": "बैंक चयन गर्नुहोस्",
    "Select Wallet": "वालेट चयन गर्नुहोस्",
    "Crypto Network": "क्रिप्टो नेटवर्क",
    "Account Holder Name": "खातावालाको नाम",
    "Full Legal Name": "पूरा कानुनी नाम",
    "Bank Account Number": "बैंक खाता नम्बर",
    "Mobile / Wallet ID": "मोबाइल / वालेट आईडी",
    "Wallet Address": "वालेट ठेगाना",
    "Branch Name": "शाखा नाम",
    "Save & Link Account": "खाता सुरक्षित गर्नुहोस् र जोड्नुहोस्",

    // Invite Page
    "Today's Income": "आजको आम्दानी",
    "Yesterday's Income": "हिजोको आम्दानी",
    "Registers": "दर्ता संख्या",
    "Valid Referral": "मान्य रेफरल",
    "Revenue goals": "राजस्व लक्ष्य",
    "Invite 50 user to meet the target": "लक्ष्य पूरा गर्न ५० प्रयोगकर्तालाई आमन्त्रित गर्नुहोस्",
    "Rewards Released to Date": "हालसम्म जारी गरिएका पुरस्कारहरू",
    "Invitation Rewards": "निमन्त्रणा पुरस्कार",
    "Achievement Rewards": "उपलब्धि पुरस्कार",
    "Deposit Rebate": "निक्षेप छुट",
    "Betting Rebate": "बाजी छुट",
    "Empty": "खाली",
    "Share with your friends": "आफ्ना साथीहरूसँग सेयर गर्नुहोस्",
    "Leaderboard": "लिडरबोर्ड",
    "Who received the rewards": "कसले पुरस्कार प्राप्त गर्यो",
    "Income calculator": "आम्दानी क्याल्कुलेटर",
    "active users, expected revenue": "सक्रिय प्रयोगकर्ताहरू, अपेक्षित आम्दानी",
    "claimed": "दावी गरियो",
    "Received": "प्राप्त भयो",

    // Promotion Page
    "Bonus Value": "बोनस मूल्य",
    "Min Deposit": "न्यूनतम निक्षेप",
    "Rollover": "रोलओभर",
    "Status": "स्थिति",
    "Active": "सक्रिय",
    "Deposit & Claim": "जम्मा गर्नुहोस् र दावी गर्नुहोस्",
    "Close": "बन्द गर्नुहोस्",
    "View All Promotions": "सबै प्रवर्द्धनहरू हेर्नुहोस्",

    // Bet History Page
    "Exclusion turnover list": "अपवर्जन टर्नओभर सूची",
    "Live": "लाइभ",
    "Slot": "स्लट",
  },
};

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem("npr_lang") || "en";
    } catch {
      return "en";
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("npr_lang", newLang);
    } catch {
      // ignore
    }
  };

  // Translation function: t("Deposit") or t("Deposit", "निक्षेप")
  const t = (enText, npText) => {
    if (!enText) return "";
    if (lang === "np") {
      if (npText) return npText;
      return translations.np[enText] || enText;
    }
    return enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      t: (key) => key,
    };
  }
  return ctx;
};

export default LanguageContext;

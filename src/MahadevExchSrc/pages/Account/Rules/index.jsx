import { useState } from 'react';

const rulesData = {
  english: [
    {
      title: "SCORECARD RULES:",
      rules: [
        "Live scores and other data on this site is sourced from third party feeds and may be subject to time delays and/or be inaccurate. If you rely on this data to place bets, you do so at your own risk. Our exchange does not accept responsibility for loss suffered as a result of reliance on this data.",
        "If Any Dispute in Fancy Results, then the Company Decision Will be Final."
      ]
    },
    {
      title: "CHEAT RULES:",
      rules: [
        "In Betfair & Fancy markets, If anyone is suspected using ground commentary or ground line or courtsiding(being in ground while betting), company will void all winning bets(without providing any proof). This is a zero tolerance policy and no arguments will be entertained. The bets will be voided after the match is completed. Company's decision will be final decision."
      ]
    },
    {
      title: "SCORECARD RULES:",
      rules: [
        "Live scores and other data on this site is sourced from third party feeds and may be subject to time delays and/or be inaccurate. If you rely on this data to place bets, you do so at your own risk. Our exchange does not accept responsibility for loss suffered as a result of reliance on this data.",
        "If Any Dispute in Fancy Results, then the Company Decision Will be Final."
      ]
    },
    {
      title: "CHEAT RULES:",
      rules: [
        "In Betfair & Fancy markets, If anyone is suspected using ground commentary or ground line or courtsiding(being in ground while betting), company will void all winning bets(without providing any proof). This is a zero tolerance policy and no arguments will be entertained. The bets will be voided after the match is completed. Company's decision will be final decision."
      ]
    },
    {
      title: "SCORECARD RULES:",
      rules: [
        "Live scores and other data on this site is sourced from third party feeds and may be subject to time delays and/or be inaccurate. If you rely on this data to place bets, you do so at your own risk. Our exchange does not accept responsibility for loss suffered as a result of reliance on this data.",
        "If Any Dispute in Fancy Results, then the Company Decision Will be Final."
      ]
    },
    {
      title: "CHEAT RULES:",
      rules: [
        "In Betfair & Fancy markets, If anyone is suspected using ground commentary or ground line or courtsiding(being in ground while betting), company will void all winning bets(without providing any proof). This is a zero tolerance policy and no arguments will be entertained. The bets will be voided after the match is completed. Company's decision will be final decision."
      ]
    },
    {
      title: "SCORECARD RULES:",
      rules: [
        "Live scores and other data on this site is sourced from third party feeds and may be subject to time delays and/or be inaccurate. If you rely on this data to place bets, you do so at your own risk. Our exchange does not accept responsibility for loss suffered as a result of reliance on this data.",
        "If Any Dispute in Fancy Results, then the Company Decision Will be Final."
      ]
    },
    {
      title: "CHEAT RULES:",
      rules: [
        "In Betfair & Fancy markets, If anyone is suspected using ground commentary or ground line or courtsiding(being in ground while betting), company will void all winning bets(without providing any proof). This is a zero tolerance policy and no arguments will be entertained. The bets will be voided after the match is completed. Company's decision will be final decision."
      ]
    },
    // Add more sections as needed
  ],
  hindi: [
    {
      title: "स्कोरकार्ड नियम:",
      rules: [
        "इस साइट पर लाइव स्कोर और अन्य डेटा तृतीय पक्ष फ़ीड से प्राप्त किया जाता है और समय में देरी और/या अशुद्ध हो सकता है। यदि आप बेट लगाने के लिए इस डेटा पर भरोसा करते हैं, तो आप अपने जोखिम पर ऐसा करते हैं। हमारा एक्सचेंज इस डेटा पर निर्भरता के परिणामस्वरूप हुए नुकसान के लिए जिम्मेदारी स्वीकार नहीं करता है।",
        "यदि फैंसी परिणामों में कोई विवाद है, तो कंपनी का निर्णय अंतिम होगा।"
      ]
    },
    {
      title: "धोखाधड़ी नियम:",
      rules: [
        "बेटफेयर और फैंसी मार्केट्स में, यदि किसी पर ग्राउंड कमेंट्री या ग्राउंड लाइन या कोर्टसाइडिंग (सट्टेबाजी करते समय मैदान में होना) का उपयोग करने का संदेह है, तो कंपनी सभी जीतने वाली बेट्स को रद्द कर देगी (कोई प्रमाण प्रदान किए बिना)। यह एक शून्य सहनशीलता नीति है और कोई तर्क नहीं सुना जाएगा। मैच पूरा होने के बाद बेट्स रद्द कर दी जाएंगी। कंपनी का निर्णय अंतिम निर्णय होगा।"
      ]
    },
    {
      title: "स्कोरकार्ड नियम:",
      rules: [
        "इस साइट पर लाइव स्कोर और अन्य डेटा तृतीय पक्ष फ़ीड से प्राप्त किया जाता है और समय में देरी और/या अशुद्ध हो सकता है। यदि आप बेट लगाने के लिए इस डेटा पर भरोसा करते हैं, तो आप अपने जोखिम पर ऐसा करते हैं। हमारा एक्सचेंज इस डेटा पर निर्भरता के परिणामस्वरूप हुए नुकसान के लिए जिम्मेदारी स्वीकार नहीं करता है।",
        "यदि फैंसी परिणामों में कोई विवाद है, तो कंपनी का निर्णय अंतिम होगा।"
      ]
    },
    {
      title: "धोखाधड़ी नियम:",
      rules: [
        "बेटफेयर और फैंसी मार्केट्स में, यदि किसी पर ग्राउंड कमेंट्री या ग्राउंड लाइन या कोर्टसाइडिंग (सट्टेबाजी करते समय मैदान में होना) का उपयोग करने का संदेह है, तो कंपनी सभी जीतने वाली बेट्स को रद्द कर देगी (कोई प्रमाण प्रदान किए बिना)। यह एक शून्य सहनशीलता नीति है और कोई तर्क नहीं सुना जाएगा। मैच पूरा होने के बाद बेट्स रद्द कर दी जाएंगी। कंपनी का निर्णय अंतिम निर्णय होगा।"
      ]
    },
    {
      title: "स्कोरकार्ड नियम:",
      rules: [
        "इस साइट पर लाइव स्कोर और अन्य डेटा तृतीय पक्ष फ़ीड से प्राप्त किया जाता है और समय में देरी और/या अशुद्ध हो सकता है। यदि आप बेट लगाने के लिए इस डेटा पर भरोसा करते हैं, तो आप अपने जोखिम पर ऐसा करते हैं। हमारा एक्सचेंज इस डेटा पर निर्भरता के परिणामस्वरूप हुए नुकसान के लिए जिम्मेदारी स्वीकार नहीं करता है।",
        "यदि फैंसी परिणामों में कोई विवाद है, तो कंपनी का निर्णय अंतिम होगा।"
      ]
    },
    {
      title: "धोखाधड़ी नियम:",
      rules: [
        "बेटफेयर और फैंसी मार्केट्स में, यदि किसी पर ग्राउंड कमेंट्री या ग्राउंड लाइन या कोर्टसाइडिंग (सट्टेबाजी करते समय मैदान में होना) का उपयोग करने का संदेह है, तो कंपनी सभी जीतने वाली बेट्स को रद्द कर देगी (कोई प्रमाण प्रदान किए बिना)। यह एक शून्य सहनशीलता नीति है और कोई तर्क नहीं सुना जाएगा। मैच पूरा होने के बाद बेट्स रद्द कर दी जाएंगी। कंपनी का निर्णय अंतिम निर्णय होगा।"
      ]
    },
    {
      title: "स्कोरकार्ड नियम:",
      rules: [
        "इस साइट पर लाइव स्कोर और अन्य डेटा तृतीय पक्ष फ़ीड से प्राप्त किया जाता है और समय में देरी और/या अशुद्ध हो सकता है। यदि आप बेट लगाने के लिए इस डेटा पर भरोसा करते हैं, तो आप अपने जोखिम पर ऐसा करते हैं। हमारा एक्सचेंज इस डेटा पर निर्भरता के परिणामस्वरूप हुए नुकसान के लिए जिम्मेदारी स्वीकार नहीं करता है।",
        "यदि फैंसी परिणामों में कोई विवाद है, तो कंपनी का निर्णय अंतिम होगा।"
      ]
    },
    {
      title: "धोखाधड़ी नियम:",
      rules: [
        "बेटफेयर और फैंसी मार्केट्स में, यदि किसी पर ग्राउंड कमेंट्री या ग्राउंड लाइन या कोर्टसाइडिंग (सट्टेबाजी करते समय मैदान में होना) का उपयोग करने का संदेह है, तो कंपनी सभी जीतने वाली बेट्स को रद्द कर देगी (कोई प्रमाण प्रदान किए बिना)। यह एक शून्य सहनशीलता नीति है और कोई तर्क नहीं सुना जाएगा। मैच पूरा होने के बाद बेट्स रद्द कर दी जाएंगी। कंपनी का निर्णय अंतिम निर्णय होगा।"
      ]
    },
    // Add more sections as needed
  ]
};

export default function Rules() {
  const [language, setLanguage] = useState('english');

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'hindi' : 'english');
  };

  return (
    <div className="bg-gray p-2">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rules</h1>
        <div>
          <button
            className={`px-4 py-2 ${language === 'english' ? 'bg-lightblue text-white' : 'bg-gray-300'}`}
            onClick={() => setLanguage('english')}
          >
            English
          </button>
          <button
            className={`px-4 py-2 ${language === 'hindi' ? 'bg-lightblue text-white' : 'bg-gray-300'}`}
            onClick={() => setLanguage('hindi')}
          >
            Hindi
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-[600px] overflow-y-auto">
        {rulesData[language].map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-md font-semibold mb-2">{section.title}</h2>
            <ol className="list-decimal list-inside text-sm">
              {section.rules.map((rule, ruleIndex) => (
                <li key={ruleIndex} className="mb-2">{rule}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { t } from "../../utils/language";

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-center text-gray-300 mb-[55px]">

      {/* Disclaimer */}
      <div className="bg-[#2b2b2b] py-[15px] px-[20px] text-[10.5px] leading-2 text-[#ffffff80]">

        <p className="max-w-[700px] mx-auto">
          {t(
            "playbangla777 is operated by playbangla777 N.V., a limited liability company registered under the laws of Curacao. Company registration number 25678905 and is licensed and regulated by Curacao authorities.",
            "playbangla777 পরিচালিত হয় playbangla777 N.V. দ্বারা, যা কুরাসাও আইনের অধীনে নিবন্ধিত একটি সীমিত দায়বদ্ধতা কোম্পানি। কোম্পানি রেজিস্ট্রেশন নম্বর 25678905 এবং এটি কুরাসাও কর্তৃপক্ষ দ্বারা লাইসেন্সপ্রাপ্ত ও নিয়ন্ত্রিত।"
          )}
        </p>

        <p className="max-w-[700px] mx-auto mt-2">
          {t(
            "Users are advised not to contact untrusted sources for playbangla777.com accounts, as this is an online platform and users can only register on their own. Deposit only through system-generated or official support team provided accounts.",
            "ব্যবহারকারীদের অনুরোধ করা হচ্ছে playbangla777.com অ্যাকাউন্টের জন্য কোনো অবিশ্বস্ত উৎসের সাথে যোগাযোগ না করতে, কারণ এটি একটি অনলাইন সাইট এবং ব্যবহারকারীরা শুধুমাত্র নিজে নিজে নিবন্ধন করতে পারবেন। শুধুমাত্র সিস্টেম দ্বারা তৈরি করা বা আমাদের অফিসিয়াল সাপোর্ট টিম দ্বারা প্রদত্ত অ্যাকাউন্টে ডিপোজিট করুন।"
          )}
        </p>

      </div>

      {/* Social icons */}
      <div className="flex justify-center gap-4 py-4 pt-8">

        <div className="w-[35px] h-[35px] rounded-full bg-[#3b5998] flex items-center justify-center">
          <FaFacebookF className="text-white text-[22px]" />
        </div>

        <div className="w-[35px] h-[35px] rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
          <FaInstagram className="text-white text-[22px]" />
        </div>

      </div>

      {/* Responsible text */}
      <p className="text-[#ffffff80] text-[12px] pb-2">
        {t(
          "Gambling can be addictive. Please play responsibly.",
          "জুয়া আসক্তিকর হতে পারে। অনুগ্রহ করে দায়িত্বশীলভাবে খেলুন।"
        )}
      </p>

      {/* Copyright */}
      <p className="text-[#ffffff80] text-[12px] pb-6">
        {t(
          "Copyright © 2019 playbangla777.com All rights reserved.",
          "কপিরাইট © 2019 playbangla777.com সর্বস্বত্ব সংরক্ষিত।"
        )}
      </p>

    </footer>
  );
};

export default Footer;
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import RulesAndRegulationsContent from "./RulesAndRegulationsContent";

const PrivacyPolicy = () => (
  <div>
    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 mb-2 rounded-[2px] tracking-wide">
      1. PRIVACY
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      OUR EXCHANGE is committed to protecting your personal information. This
      Privacy Policy lets you know what information we collect when you use our
      services, why we collect this information and how we use the collected
      information.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Please note that this Privacy Policy will be agreed between you and OUR
      EXCHANGE. (&lsquo;We&rsquo;, &lsquo;Us&rsquo; or &lsquo;Our&rsquo;, as appropriate). This Privacy Policy is an
      integrated part of OUR EXCHANGE&rsquo;s Terms and Conditions.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We may periodically make changes to this Privacy Policy and will notify you
      of these changes by posting the modified terms on our platforms. We
      recommend that you revisit this Privacy Policy regularly.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      2. INFORMATION COLLECTED
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We consider information that may be used to identify an individual,
      including, but not limited to, first and last name, date of birth, home or
      other physical address, email address, phone number or other relevant
      information to be Personal Information (&lsquo;Personal Information&rsquo;). You may
      be asked to provide Personal Information when you use our website, register
      for an account or use our services. The Personal Information that we
      collect may include information such as: contact information (including
      telephone number), shipping information, billing information, transaction
      history, website usage preferences, and feedback regarding the Services.
      This information is held by us on servers based in various location from
      time to time and elsewhere from time to time. When you interact with the
      services, our servers keep an activity log unique to you that collects
      certain administrative and traffic information including: source IP
      address, time of access, date of access, web page(s) visited, language
      use, software crash reports and type of browser used. This information is
      essential for the provision and quality of our services. We do not collect
      Personal Information about you without your knowledge.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      3. MEANS OF COLLEC.. AND PROCE.. DATA
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We may automatically collect certain data as discussed above and receive
      Personal Information about you where you provide such information through
      the services or other communications and interactions on the OUR EXCHANGE
      site. We may also receive Personal Information from online vendors and
      service providers, and from customer lists lawfully acquired from
      third-party vendors. In addition, we may engage the services of third-party
      service providers to provide technical support process your online
      transactions and maintain your account. We will have access to any
      information you provide to such vendors, service providers and third-party
      e-commerce services, and we will use the Personal Information as set out in
      this Privacy Policy below. This information will only be disclosed to third
      parties outside the company in accordance with this Privacy Policy. We take
      steps to ensure that our arrangements with third-party service providers and
      online vendors protect your privacy.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      4. INFORMATION USE
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We use the Personal Information we collect from you to deliver our
      Services, to provide customer support, to undertake necessary security and
      identify verification checks, to process any of your online transactions,
      to assist your participation in third-party promotions, meet certain
      business requirements and for any other purpose related to the operation
      of the Services. As such, we may share your Personal Information with our
      carefully selected partners (including any other parties that have data
      sharing arrangements with the latter).
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Your Personal Information may also be used by us to provide you with:(1)
      promotional offers and information regarding our products and services;
      and (2) promotional offers and information regarding the products and
      services of our partners, in order to enlarge the range of provided
      products and improve our customer service. From time-to-time, we may
      request information from you via surveys or contests. Participation in
      these surveys or contests is completely voluntary and you have the choice
      of whether or not to disclose such information. Information requested may
      include contact information (such as name, correspondence address and
      telephone number), and demographic information (such as zip or postal code
      or age). By accepting any contest prize or winnings from us, you consent
      to use of your name for advertising and promotional purposes without
      additional compensation, except where prohibited by law. Unless you have
      elected not to receive promotional information, we may also use your
      Personal Information (including your email address and phone number) to
      provide you with information regarding our products, services and
      promotions, including other gaming products (including online poker,
      casino, betting, backgammon) and products and services from third parties
      carefully selected by us.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      5. CERTAIN EXCLUDED DISCLOSURES
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We may disclose your Personal Information if required to do so by law, or
      if we believe in good faith that such action is necessary to: (1) comply
      with any legal process served on us, any of our sites or the services or in
      circumstances where we are under a substantially similar legal obligation;
      (2) protect and defend our rights or property; or (3) act to protect the
      personal safety of users of the services or the public. If, in our sole
      determination, you are found to have cheated or attempted to defraud us, the
      company , or any other user of the services in any way including but not
      limited to game manipulation or payment fraud, or if we suspect you of
      fraudulent payment, including use of stolen credit cards, or any other
      fraudulent activity (including any chargeback or other reversal of a
      payment) or prohibited transaction (including money laundering), we reserve
      the right to share this information (together with your identity) with other
      online gaming sites, banks, credit card companies, appropriate agencies and
      relevant authorities. (4) For the purpose of research on the prevention of
      addiction, data can be made anonymous and passed on to the respective
      institutions.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      6. ACCESS
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      You may &lsquo;opt out&rsquo; of receiving any promotional communications either by
      choosing to opt out via your account settings available on our sites or the
      services or in an email you receive from us, or at any time by sending an
      email, or by writing to us at Customer Service.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      In addition, You may contact us if you: 1) want to confirm the accuracy of
      the Personal Information we have collected about you; 2) would like to
      update your Personal Information; and/or 3) have any complaint regarding
      our use of your Personal Information. If requested, we will (1) update any
      information you have provided to us, in case you prove the necessity for
      such changes or (2) mark any information to prohibit future use for
      marketing purposes. For the avoidance of doubt, nothing in this Privacy
      Policy shall prevent us from retaining your Personal Information where we
      are required to do so by law.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      7. COOKIES
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      When accessing our services, we may store information on your device. This
      information is referred to as cookies, which are small text files that are
      stored on your device when you visit online pages that record your
      preferences. We also use Local Shared Objects or &lsquo;flash cookies&rsquo;. &lsquo;Flash
      cookies&rsquo; are similar to browser cookies. They allow us to remember things
      about your visits across our sites.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Neither cookies nor flash cookies can be used to access or use other
      information on your computer. We only use these methods to track your use
      of our services. Cookies help us monitor traffic to the site, improve our
      services and make it easier and/or more relevant for your use. We use
      flash cookies and third party cookies to help us show you more relevant and
      desirable advertisements.
    </p>

    <h5 className="font-bold text-[13px] text-[#23282c] mt-2.5 mb-1">
      <strong>Strictly necessary cookies</strong>
    </h5>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Strictly necessary cookies are essential to allow a user move around a
      website and use its features, such as accessing secure areas of the website
      or making financial transactions. Without these cookies, we would not be
      able to make our websites work efficiently.
    </p>

    <h5 className="font-bold text-[13px] text-[#23282c] mt-2.5 mb-1">
      <strong>During the registration process</strong>
    </h5>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      These cookies will hold information collected during your registration and
      will allow us to recognize you as a customer and provide you with the
      services you require. We may also use this data to better understand your
      interests while online and to enhance your visits to our platforms.
    </p>

    <h5 className="font-bold text-[13px] text-[#23282c] mt-2.5 mb-1">
      <strong>On our website</strong>
    </h5>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      For visitors to our website, we use cookies to collect information. Our
      servers use three different types of cookies:
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      A &lsquo;session-based&rsquo; cookie: This type of cookie is only allocated to your
      computer for the duration of your visit to our website. A session-based
      cookie helps you move around our website faster and, if you&rsquo;re a registered
      customer, it allows us to give you information that is more relevant to
      you. This cookie automatically expires when you close your browser.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      A &lsquo;persistent&rsquo; cookie: This type of cookie will remain on your computer for
      a period of time set for each cookie. Flash cookies are also persistent.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      &lsquo;Analytical&rsquo; cookies: This type of cookie allows us to recognize and count
      the number of visitors to our site and see how visitors use our services.
      These helps us improve the way our sites work, for example, by ensuring you
      can find what you are looking for easily.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      You have the ability to accept or decline cookies. Most web browsers
      automatically accept cookies, but, if you prefer, you can usually modify
      your browser setting to decline cookies. The Help menu on the menu bar of
      most browsers will tell you how to prevent your browser from accepting new
      cookies, how to have the browser notify you when you receive a new cookie
      and how to disable cookies altogether.
    </p>

    <h5 className="font-bold text-[13px] text-[#23282c] mt-2.5 mb-1">
      <strong>Flash cookies</strong>
    </h5>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      You can modify your Flash Player settings to prevent the use of flash
      cookies. The Settings Manager of your Flash Player allows you manage your
      preferences. To disallow flash cookies from all third party content go to
      the &lsquo;Global Storage Settings&rsquo; panel of the Settings Manager and de-select
      the check box labelled &lsquo;Allow third party flash content to store
      information on your computer&rsquo; and close the Settings Manager. Alternatively
      you can also adjust your settings for specific websites you visit through
      the &lsquo;Website Storage Settings&rsquo; panel which is also found in the Settings
      Manager.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      If you are using an old version of Flash Player or older web browser, the
      Settings Manager may not be available to you. We recommend that you ensure
      that you refresh your Flash Player and browser to the latest available
      versions.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      If you choose to decline cookies, you may not be able to experience all of
      the interactive features on our sites.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      8.CONSENT TO USE OF ELEC. SER. PROV.
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      In order to play real money games on our services, you will be required to
      send money to and receive money from us. We may use third-party electronic
      payment systems to process such financial transactions. By accepting this
      Privacy Policy, you expressly consent to Personal Information necessary
      for the processing of transactions including, where necessary, the transfer
      of information outside of your country. We take steps to ensure that our
      arrangements with payments systems protect your privacy.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      9. CONSENT TO SECURITY REVIEW
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We reserve the right to conduct a security review at any time to validate
      the registration data provided by you and to verify your use of the
      services and your financial transactions for potential breach of our Terms
      and Conditions and of applicable law. By using our services and thereby
      agreeing to our Terms and Conditions you authorize us to use your Personal
      Information and to disclose your Personal Information to third parties for
      the purposes of validating the information you provide during your use of
      our services, including, where necessary, the transfer of information
      outside of your country. Security reviews may include but are not limited
      to ordering a credit report and/or otherwise verifying the information you
      provide against third-party databases. In addition, to facilitate these
      security reviews, you agree to provide such information or documentation as
      we may request.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      10. SECURITY
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We understand the importance of security and the techniques needed to
      secure information. We store all of the Personal Information we receive
      directly from you in an encrypted and password-protected database residing
      within our secure network behind active state-of-the-art firewall
      software. (Our Services support SSL). We also take measures to ensure our
      subsidiaries, agents, affiliates and suppliers employ adequate security
      measures.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      11. PROTECTION OF MINORS
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Our Services are not intended for or directed at persons under the age of
      eighteen (18) (or the lawful age in their respective jurisdiction). Any
      person who provides their information to us through any part of the
      services signifies to us that they are eighteen (18) years of age (or the
      lawful age in their respective jurisdiction) or older. It is our policy to
      uncover attempts by minors to access our services which may involve having
      to initiate a security review. If we become aware that a minor has
      attempted to or has submitted personal information via our services, we
      will not accept their information and will take steps to purge the
      information from our records.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      12. INTERNATIONAL TRANSFERS
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Personal Information collected on the services may be stored and processed
      in any country in which we or our affiliates, suppliers or agents maintain
      facilities. By using our services, you expressly consent to any transfer of
      information outside of your country (including to countries that may not be
      assessed as having adequate privacy laws). Nevertheless, we take steps to
      ensure that our agents, affiliates and suppliers comply with our standards
      of privacy regardless of their location.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      13. THIRD-PARTY PRACTICES
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We cannot ensure the protection of any information that you provide to a
      third-party online site that links to or from the services or any
      information collected by any third party administering our affiliate
      program (if applicable) or any other program, since these third-party
      online sites are owned and operated independently from us. Any information
      collected by these third parties is governed by the privacy policy, if any,
      of such third party.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      14. LEGAL DISCLAIMER
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      The Services operate &lsquo;AS-IS&rsquo; and &lsquo;AS-AVAILABLE&rsquo; without liability of
      any kind. We are not responsible for events beyond our direct control.
      Due to the complex and ever-changing nature of our technology and business,
      we cannot guarantee nor do we claim that there will be error-free
      performance regarding the privacy of your Personal Information, and we
      will not be liable for any indirect, incidental, consequential or punitive
      damages relating to the use or release of said Personal Information.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      15. CONSENT TO PRIVACY POLICY
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Your use of our services constitutes an agreement to our Privacy Policy.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      This is our entire and exclusive Privacy Policy and it supersedes any
      earlier version. This Privacy Policy should be read in conjunction with our
      Terms and Conditions and any additional applicable terms posted on our
      platforms. We may periodically make changes to this Privacy Policy and
      will notify you of these changes by posting the modified terms on our
      Platforms. Your continued use of our services following any changes to this
      Privacy Policy constitutes your acceptance of the changes. We recommend
      that you revisit this Privacy Policy regularly.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      16. Other web sites
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Our web site may contain links to other web sites, which are outside our
      control and are not covered by this Privacy Policy. If you access other
      sites using the links provided, the operators of these sites may collect
      information from you, which will be used by them in accordance with their
      privacy policy, which may differ from ours. We are not responsible. Solely
      the operators of these websites shall be responsible for their
      functionality or possible errors on the linked sites.
    </p>
  </div>
);

const RulesAndRegulations = () => <RulesAndRegulationsContent />;

const Kyc = () => (
  <div>
    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 mb-2 rounded-[2px] tracking-wide">
      1. KNOW YOUR CUSTOMER POLICY
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      To maintain the highest level of security, we require all our members to
      provide us with certain documentation in order to validate their accounts.
      Please note that the identification procedures shall be done before a user
      starts operating and using services of our merchants.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      2. WHY DO I NEED TO PROVIDE DOCUMENTATION?
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We are committed to providing a socially responsible platform for online
      gaming. All of our members must be 18 or older and we are bound by our
      licensing agreement to verify this. Secondly, as a respected online and
      global company it is in our interests to guarantee maximum security on all
      transactions.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      3. WHAT DOCUMENTS DO I NEED TO PROVIDE?
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-1 font-bold">
      PROOF OF ID:
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      A color copy of a valid government issued form of ID (Driver&apos;s License,
      Passport, State ID, Aadhaar or Military ID).
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-1 font-bold">
      PROOF OF ADDRESS:
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      A copy of a recent utility bill showing your address. Note: If your
      government ID shows your address, you do not need to provide further proof
      of address.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      4. HOW DO I KNOW MY DOCUMENTS ARE SAFE?
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      The security of your documentation is of paramount importance. All files
      are protected with the highest level of encryption at every step of the
      review process. All documentation received is treated with the utmost
      respect and confidentiality.
    </p>
  </div>
);

const TermsAndConditions = () => (
  <div>
    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 mb-2 rounded-[2px] tracking-wide">
      1. INTRODUCTION
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      These terms and conditions and the documents referred to set out the basis
      upon which the website and its related services will be provided to you.
      Please read these terms very carefully as they form a binding legal
      agreement between you and OUR EXCHANGE.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      By opening an account and using the Service you agree to be bound by these
      terms, together with any amendment which may be published from time to
      time.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      2. ACCOUNT REGISTRATION
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      In order to place bets on the website, you must open an account. You must
      be at least 18 years old and legally capable of entering into binding
      contracts. You agree to provide accurate registration information and keep
      it up to date.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      3. BETTING AND WAGERING
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      All bets placed through your account are valid once confirmed. It is your
      responsibility to ensure that all details of your bets are correct before
      placing them. We reserve the right to void any bets if there is evidence of
      match-fixing, fraud, or system errors.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      4. TERMINATION
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We reserve the right to close or suspend your account at any time and for
      any reason, including where we suspect that you have engaged in fraudulent,
      illegal or inappropriate activity.
    </p>
  </div>
);

const ResponsibleGambling = () => (
  <div>
    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 mb-2 rounded-[2px] tracking-wide">
      1. RESPONSIBLE GAMBLING POLICY
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      OUR EXCHANGE is committed to endorsing responsible wagering among its
      customers as well as promoting the awareness of problem gambling and
      improving prevention, intervention and treatment.
    </p>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      Our Responsible Gambling Policy sets out our commitment to minimizing the
      negative effects of problem gambling and to promoting responsible gambling
      practices.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      2. PLAYER SECURITY & PROTECTION
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      We take responsibility for the security of our players. Protection of the
      players is based on forbidding the attendance of minors from participation
      in games and the protection of privacy, which involves responsible
      processing of personal data and payments.
    </p>

    <h3 className="bg-[#e9ecef] text-[#1a3650] font-bold text-[14px] text-center py-1.5 px-3 my-2 rounded-[2px] tracking-wide">
      3. PROTECTION OF MINORS
    </h3>
    <p className="text-[13px] text-[#23282c] leading-[1.55] mb-2 text-left">
      OUR EXCHANGE does not allow minors (persons under the age of 18) to
      participate in games and make bets. That&apos;s why the confirmation of having
      reached the age of majority is a mandatory requirement during
      registration.
    </p>
  </div>
);

const AuraPolicyModal = ({ isOpen, title, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const renderContent = () => {
    switch (title) {
      case "Privacy Policy":
        return <PrivacyPolicy />;
      case "Rules and Regulations":
        return <RulesAndRegulations />;
      case "KYC":
        return <Kyc />;
      case "Terms and Conditions":
        return <TermsAndConditions />;
      case "Responsible Gambling":
        return <ResponsibleGambling />;
      default:
        return null;
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999999] flex items-start justify-center pt-[48px] pb-6 px-3 bg-[#000000aa]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-[92vw] max-w-[420px] max-h-[calc(88vh-48px)] bg-white rounded-[4px] shadow-[0_5px_25px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-black/10"
            initial={{ y: "-120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-120%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 300,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-3 text-[13px] text-[#23282c]">
              {renderContent()}
            </div>

            {/* Footer with OK Button */}
            <div className="border-t border-[#d8d8d8] bg-white py-2 px-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[105px] h-[30px] px-6 border border-black bg-white text-black font-bold text-[13px] rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-gray-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center select-none"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default AuraPolicyModal;

export const safetyGuides = [
  {
    id: "fake-screenshots",
    title: {
      en: "Fake Payment Screenshots",
      ne: "नक्कली भुक्तानी स्क्रिनसटहरू"
    },
    shortDesc: {
      en: "Learn to spot edited or fake payment images.",
      ne: "सम्पादित वा नक्कली भुक्तानी तस्बिरहरू चिन्न सिक्नुहोस्।"
    },
    badge: "Most Common in Nepal",
    icon: "Image",
    fullContent: {
      en: `Scammers frequently use photo editing apps (like Photoshop or mobile screenshot generators) to alter genuine receipts from eSewa, Khalti, or mobile banking apps.

Common Red Flags to Watch For:
• Inconsistent Fonts: The transaction amount or recipient name uses a slightly different font weight, size, or color than the rest of the text.
• Misaligned Reference IDs: Reference numbers that do not follow standard platform formatting (e.g., eSewa references are typically 10-14 digits, Khalti transaction codes follow specific alphanumeric lengths).
• Wrong Date Formats: Mixing Bikram Sambat (B.S.) with Gregorian (A.D.) dates in ways the official app does not format.
• Compression Artifacts: Blurry pixels or halos around the numbers while the rest of the receipt looks crisp.

Rule of Gold for Merchants:
Never treat a customer's screenshot as proof of payment. Open your merchant portal or wallet application and verify the credit entry in your statement.`,
      ne: `ठगहरूले eSewa, Khalti वा मोबाइल बैंकिङका वास्तविक रसिदहरूलाई फोटो सम्पादन एपहरू प्रयोग गरेर रकम वा नाम परिवर्तन गर्ने गर्दछन्।

मुख्य चेतावनीका संकेतहरू:
• फन्टको अमिल्दोपन: कारोबार रकम वा प्रापकको नाम बाँकी पाठ भन्दा अलि फरक वा नमिलेको देखिन्छ।
• अमिल्दो रेफरेन्स नम्बर: सामान्य प्रणाली अनुसार नभएको वा अंक संख्या गडबड भएको।
• मितिको ढाँचा: विक्रम संवत् (B.S.) र इस्वी संवत् (A.D.) को ढाँचा वास्तविक एपसँग मेल नखाने।
• फोटो सम्पादनको दाग: रकम भएको ठाउँमा मात्र धमिलो वा अस्वाभाविक देखिने।

व्यापारीहरूको लागि सुनौलो नियम:
ग्राहकले पठाएको स्क्रिनसटलाई कहिल्यै भुक्तानीको अन्तिम प्रमाण नमान्नुहोस्। सधैं आफ्नो आफ्नै वालेट वा बैंक स्टेटमेन्ट खोलेर रकम जम्मा भएको यकिन गर्नुहोस्।`
    },
    checklist: {
      en: [
        "Open your own app independently",
        "Check account statement / transaction ledger",
        "Match the Sender Name and Exact Amount",
        "Do not hand over goods until ledger reflects the credit"
      ],
      ne: [
        "आफ्नो वालेट वा बैंक एप छुट्टै खोल्नुहोस्",
        "स्टेटमेन्ट वा कारोबार इतिहास जाँच गर्नुहोस्",
        "पठाउनेको नाम र ठ्याक्कै रकम मिलाउनुहोस्",
        "खातामा रकम नआएसम्म सामान हस्तान्तरण नगर्नुहोस्"
      ]
    }
  },
  {
    id: "qr-substitution",
    title: {
      en: "QR Code Substitution",
      ne: "QR कोड प्रतिस्थापन ठगी"
    },
    shortDesc: {
      en: "How scammers replace physical counter QR codes.",
      ne: "पसलमा राखिएका QR कोडहरू ठगहरूले कसरी बदल्छन्।"
    },
    badge: "Physical Retail Risk",
    icon: "QrCode",
    fullContent: {
      en: `In physical retail shops in Kathmandu, Pokhara, and other commercial hubs, scammers have pasted their own printed QR stickers over legitimate merchant Fonepay or NepalPay stands.

How it works:
A scammer visits during busy shop hours and discreetly pastes their private personal wallet QR sticker over your shop's counter stand. Customers scan the sticker and transfer funds directly to the criminal.

Preventive Steps:
• Check your physical QR stand every morning before opening.
• Place physical QR stands inside tamper-evident acrylic stands or near the cash register where staff have direct eye contact.
• Use Smart Soundboxes (Audio alerts that announce every successful payment aloud).`,
      ne: `काठमाडौं, पोखरा लगायतका बजारहरूमा पसलको काउन्टरमा राखिएका आधिकारिक Fonepay वा NepalPay को QR माथि ठगहरूले आफ्नो निजी QR स्टिकर टाँसिदिने घटनाहरू बढेका छन्।

यसबाट बच्ने उपायहरू:
• हरेक बिहान पसल खोल्दा काउन्टरको QR स्टिकर हातले छामेर जाँच गर्नुहोस्।
• QR स्ट्यान्डलाई सुरक्षित ठाउँमा राख्नुहोस् जहाँ कर्मचारीको प्रत्यक्ष निगरानी रहोस्।
• भुक्तानी भएको तुरुन्त आवाज आउने स्मार्ट साउन्डबक्स (Smart Soundbox) प्रयोग गर्नुहोस्।`
    },
    checklist: {
      en: [
        "Daily physical inspection of QR stickers",
        "Listen for Smart Soundbox voice announcements",
        "Keep QR display within direct staff eyesight",
        "Match incoming customer names to your terminal"
      ],
      ne: [
        "दैनिक भौतिक QR स्टिकरको निरीक्षण गर्नुहोस्",
        "स्मार्ट साउन्डबक्सको आवाज सुनेर मात्र ढुक्क हुनुहोस्",
        "काउन्टर भित्र सुरक्षित निगरानीमा QR राख्नुहोस्",
        "ग्राहकको नाम र तपाईंको टर्मिनलमा आएको नाम भिडाउनुहोस्"
      ]
    }
  },
  {
    id: "phishing-impersonation",
    title: {
      en: "Phishing & Impersonation",
      ne: "फिसिङ र छद्मभेषी ठगी"
    },
    shortDesc: {
      en: "Avoid fake messages and caller tricks.",
      ne: "नक्कली सन्देश र ठग फोन कलहरूबाट बच्नुहोस्।"
    },
    badge: "Social Engineering",
    icon: "UserX",
    fullContent: {
      en: `Scammers call or message pretending to be representatives of eSewa Customer Support, Khalti KYC verification, or bank managers.

Common Tactics:
• "Your wallet is blocked due to KYC expiration": They send an urgent link asking you to enter your MPIN, OTP, or password.
• "You won a lottery / cashback prize": They ask you to approve a transaction or scan a QR code to "receive" prize money. Note: Scanning a QR code or entering MPIN always DEDUCTS money, it never receives money.

Remember:
No genuine bank, eSewa, or Khalti representative will ever ask for your MPIN, OTP, or password.`,
      ne: `ठगहरूले eSewa, Khalti वा बैंकको कर्मचारी बनेर फोन वा ह्वाट्सएपमा सम्पर्क गर्छन्।

सामान्य युक्तिहरू:
• "तपाईंको KYC म्याद सकिएर खाता बन्द हुँदैछ": उनीहरूले तुरुन्त MPIN, OTP वा पासवर्ड माग्ने लिङ्क पठाउँछन्।
• "तपाईंले चिठ्ठा वा क्यासब्याक जित्नुभयो": पुरस्कार रकम प्राप्त गर्न QR स्क्यान गर्न वा MPIN हाल्न भन्छन्। याद गर्नुहोस्: MPIN हाल्नु वा QR स्क्यान गर्नु भनेको पैसा पठाउनु हो, प्राप्त गर्नु होइन।

याद राख्नुहोस्:
कुनै पनि वास्तविक बैंक वा वालेटले तपाईंको MPIN, OTP वा पासवर्ड कहिल्यै माग्दैन।`
    },
    checklist: {
      en: [
        "Never share MPIN or SMS OTP with anyone",
        "Scanning QR code sends money, does not receive it",
        "Do not click unsolicited KYC update links",
        "Report suspicious caller numbers to official helplines"
      ],
      ne: [
        "आफ्नो MPIN वा SMS OTP कसैसँग कहिल्यै सेयर नगर्नुहोस्",
        "QR स्क्यान गर्दा पैसा काटिन्छ, आउँदैन",
        "अपरिचित लिङ्कहरू मार्फत KYC अपडेट नगर्नुहोस्",
        "शंकास्पद नम्बरहरू आधिकारिक हेल्पलाईनमा रिपोर्ट गर्नुहोस्"
      ]
    }
  },
  {
    id: "suspicious-wallet-messages",
    title: {
      en: "Suspicious Wallet Messages",
      ne: "शंकास्पद वालेट सन्देशहरू"
    },
    shortDesc: {
      en: "Recognize fake alerts and notifications.",
      ne: "नक्कली एसएमएस अलर्ट र सूचनाहरू पहिचान गर्नुहोस्।"
    },
    badge: "SMS Spoofing",
    icon: "MessageSquareWarning",
    fullContent: {
      en: `Scammers often send SMS messages from regular mobile numbers (e.g., +977-98XXXXXXXX) claiming:
"Payment of NPR 4,500 received from Ram Shrestha. Available balance NPR 24,000."

How to differentiate:
• Authentic SMS in Nepal comes from registered shortcodes or alphanumeric sender IDs such as "eSewa", "Khalti", "NABIL", "NICA", "KBL", or "38000" / "31003".
• Genuine alerts never originate from regular 10-digit mobile phone numbers.
• Even if an SMS uses a spoofed sender name, SMS does not equal money in your account. Always check your actual app balance.`,
      ne: `ठगहरूले साधारण १० अंकको मोबाइल नम्बर (+977-98XXXXXXXX) बाट नक्कली एसएमएस पठाउने गर्छन्, जस्तै:
"Ram Shrestha बाट NPR 4,500 प्राप्त भयो। मौज्दात रकम NPR 24,000।"

फरक कसरी छुट्याउने:
• नेपालमा आधिकारिक एसएमएस "eSewa", "Khalti", "NABIL", "NICA" वा ३८००० जस्ता दर्ता भएका सर्टकोडबाट मात्र आउँछ।
• कुनै पनि आधिकारिक वालेट वा बैंकले साधारण १० अंकको मोबाइल नम्बरबाट कारोबारको एसएमएस पठाउँदैन।
• एसएमएस आए पनि एप खोलेर वास्तविक मौज्दात जाँच नगरी सामान नपठाउनुहोस्।`
    },
    checklist: {
      en: [
        "Check Sender ID: Official shortcode vs 10-digit mobile number",
        "Ignore SMS claiming money arrived from personal numbers",
        "Always cross-check in your mobile banking transaction history",
        "Beware of fake SMS sender spoofing tools"
      ],
      ne: [
        "एसएमएस पठाउने आइडी हेर्नुहोस्: आधिकारिक कोड कि साधारण मोबाइल नम्बर?",
        "व्यक्तिगत नम्बरबाट आएको भुक्तानी सन्देशलाई विश्वास नगर्नुहोस्",
        "मोबाइल बैंकिङको स्टेटमेन्टमा गएर कारोबार यकिन गर्नुहोस्",
        "नक्कली एसएमएस बनाउने वेबसाइटहरूबाट सचेत रहनुहोस्"
      ]
    }
  },
  {
    id: "fake-online-store-requests",
    title: {
      en: "Fake Online Store Requests",
      ne: "अनलाइन अर्डर र ओभरपेमेन्ट ठगी"
    },
    shortDesc: {
      en: "Common scam tactics in online shopping.",
      ne: "अनलाइन किनमेल र डेलिभरीमा हुने सामान्य ठगी।"
    },
    badge: "E-Commerce Fraud",
    icon: "ShoppingBag",
    fullContent: {
      en: `For Instagram sellers and online boutique merchants in Nepal, the "Overpayment Refund Scam" and "Urgent Rider Dispatch" are rising sharply.

Scenario 1: Overpayment scam
The buyer claims: "I was supposed to send Rs 2,000 but I accidentally sent Rs 12,000. Here is the screenshot. Please refund Rs 10,000 immediately." The screenshot is fake, and if you send Rs 10,000, you lose your own money.

Scenario 2: Rush courier dispatch
The scammer insists that an InDrive or Pathao rider is already standing outside and threatens to cancel the big order unless the package is handed over before you can check your bank balance.`,
      ne: `इन्स्टाग्राम, फेसबुक वा टिकटकमा व्यापार गर्ने साना नेपाली उद्यमीहरूलाई लक्षित गरी "ओभरपेमेन्ट (बढी रकम पठाएको बहाना)" ठगी भइरहेको छ।

दृश्य १: बढी रकम पठाएको बहाना
ग्राहकले भन्छ: "मैले रु २,००० पठाउनुपर्नेमा भुलवश रु १२,००० पठाएछु। यो हेर्नुहोस् स्क्रिनसट। कृपया बढी भएको रु १०,००० फिर्ता पठाइदिनुहोस्।" स्क्रिनसट नक्कली हुन्छ, र तपाईंले पैसा फिर्ता पठाएमा तपाईंको आफ्नै पैसा गुम्छ।

दृश्य २: हतारमा राइडर पठाउने दबाब
पठाओ वा इनड्राइभको राइडर आइपुग्यो भन्दै बैंक खाता जाँच गर्ने मौका नै नदिई सामान पठाउन चर्को दबाब दिइन्छ।`
    },
    checklist: {
      en: [
        "Never refund supposed overpayments without verifying your bank statement",
        "Do not allow delivery riders to take parcels before confirmed payment",
        "Politely insist on your standard verification procedure",
        "Record customer contact number and delivery rider details"
      ],
      ne: [
        "बैंक स्टेटमेन्टमा वास्तविक रकम नदेखी कुनै रकम फिर्ता नगर्नुहोस्",
        "भुक्तानी सुनिश्चित नभएसम्म डेलिभरी राइडरलाई सामान नदिनुहोस्",
        "हतार नगर्नुहोस्, आफ्नो सुरक्षा प्रक्रिया पालना गर्नुहोस्",
        "ग्राहकको फोन नम्बर र राइडरको विवरण सुरक्षित राख्नुहोस्"
      ]
    }
  },
  {
    id: "safe-verification",
    title: {
      en: "Safe Payment Verification",
      ne: "सुरक्षित भुक्तानी प्रमाणीकरण"
    },
    shortDesc: {
      en: "Steps to confirm payments safely.",
      ne: "भुक्तानी सुरक्षित रूपमा पुष्टि गर्ने तरिकाहरू।"
    },
    badge: "Best Practice Standard",
    icon: "ShieldCheck",
    fullContent: {
      en: `Establishing a standard operating procedure for digital payment verification protects your business from 99% of fraud attempts.

The 4-Step Verification Standard:
1. Independent Login: Never click links provided by the customer. Open your banking or eSewa/Khalti app directly from your home screen.
2. Statement Inspection: Go to Statements / Transaction History. Confirm the exact amount has a green positive credit indicator.
3. Reference Match: Compare the transaction ID from your own app with the customer's reference claim.
4. Record Keeping: Retain transaction reference for order fulfillment.

If any doubt remains, call your bank's merchant support helpline or ask the customer to wait until next business day clearance.`,
      ne: `डिजिटल भुक्तानी प्रमाणीकरणको सही नियम पालना गर्नाले ९९% ठगीबाट बच्न सकिन्छ।

४-चरणको प्रमाणीकरण मापदण्ड:
१. स्वतन्त्र लगइन: ग्राहकले पठाएको कुनै पनि लिङ्क नखोल्नुहोस्। आफ्नै फोनको आधिकारिक एप खोल्नुहोस्।
२. स्टेटमेन्ट निरीक्षण: स्टेटमेन्ट वा कारोबार इतिहासमा गई रकम क्रेडिट भएको हेर्नुहोस्।
३. रेफरेन्स रुजु: तपाईंको एपमा देखिएको ट्रान्जिक्सन आइडी र ग्राहकले दाबी गरेको आइडी भिडाउनुहोस्।
४. रेकर्ड सुरक्षित राख्नुहोस्: अर्डर र कारोबारको रेफरेन्स सुरक्षित राख्नुहोस्।

कुनै शंका लागेमा, बैंक वा वालेटको आधिकारिक सपोर्टमा बुझेर मात्र निर्णय लिनुहोस्।`
    },
    checklist: {
      en: [
        "Always initiate app launch independently",
        "Verify in statement, not just summary balance",
        "Verify sender name and transaction code",
        "Establish zero-dispatch policy for unconfirmed transactions"
      ],
      ne: [
        "सधैं आफ्नै फोनबाट आधिकारिक एप खोल्नुहोस्",
        "केवल मुख्य ब्यालेन्स मात्र नभई स्टेटमेन्ट हेर्नुहोस्",
        "पठाउने व्यक्तिको नाम र कारोबार कोड रुजु गर्नुहोस्",
        "रकम जम्मा भएको पुष्टि नभएसम्म सामान नपठाउने नियम बनाउनुहोस्"
      ]
    }
  }
];

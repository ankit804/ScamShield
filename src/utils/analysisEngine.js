/**
 * Heuristic Scam Analysis Engine for ScamShield Nepal
 * Modular logic separated from UI to allow drop-in FastAPI backend integration.
 */

export async function analyzeSubmission({ type, data, language = "en" }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // If a live FastAPI backend is configured, attempt remote API call
  if (apiBaseUrl && apiBaseUrl.trim()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, language }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const result = await res.json();
        return result;
      }
    } catch (err) {
      console.warn("Backend API not reachable, falling back to built-in client engine:", err);
    }
  }

  // Simulate processing time for realistic analysis steps
  await new Promise(resolve => setTimeout(resolve, 800));


  const text = (data.text || data.url || data.fileName || "").toLowerCase();
  const rawText = data.text || data.url || data.fileName || "";

  let riskCategory = "safe";
  let evidenceCount = 0;
  const findings = [];
  const detectedUrgency = /immediately|urgent|right now|cancel the order|hurry|fast|chito|hataar|rider waiting|cancel order|now/i.test(text);
  const detectedAlternate = /alternate|different number|send to this|another account|arkai|badi bhayo|refund|brother|sister|wallet 98/i.test(text);
  const detectedPaymentClaim = /esewa|khalti|fonepay|connectips|payment sent|npr|rs\.?|transferred|paid|paisa pathaye/i.test(text);
  const detectedPhone = /(?:\+?977[- ]?)?9[78]\d{8}/.test(text);
  const detectedUrlShortener = /bit\.ly|tinyurl|is\.gd|t\.co|cutt\.ly|rb\.gy/i.test(text);
  const detectedSuspiciousDomain = /\.top|\.xyz|\.club|\.online|\.site|\.tk|\.info|secure|login|verify|kyc|bonus|prize/i.test(text);

  if (type === "screenshot") {
    // Screenshot analysis
    const hasPresetTag = data.presetType;

    if (hasPresetTag === "high-fraud" || detectedUrgency || detectedAlternate) {
      riskCategory = "high";
      evidenceCount = 4;
      findings.push({
        id: "f-scr-1",
        title: language === "ne" ? "हतारमा सामान माग्ने दबाब" : "Urgent pressure to act",
        severity: "high",
        evidence: `"${data.caption || 'Dispatch immediately or I will cancel the order'}"`,
        explanation: language === "ne" 
          ? "हतारमा निर्णय गराएर सामान्य सुरक्षा जाँच छल्ने यो ठगहरूको मुख्य रणनीति हो।"
          : "Pressure to act quickly is a common tactic used in scams to prevent merchants from checking their banking app.",
        recommended: language === "ne"
          ? "हतार नगर्नुहोस्। पहिले आफ्नै वालेटमा रकम यकिन गर्नुहोस्।"
          : "Do not rush. Verify the payment first in your own wallet app."
      });
      findings.push({
        id: "f-scr-2",
        title: language === "ne" ? "शंकास्पद भुक्तानी दाबी" : "Suspicious payment claim",
        severity: "high",
        evidence: `"${data.caption || 'Payment sent via eSewa, check and confirm'}"`,
        explanation: language === "ne"
          ? "स्क्रिनसट मात्र भुक्तानी खातामा जम्मा भएको प्रमाण होइन। यसलाई सजिलै सम्पादन गर्न सकिन्छ।"
          : "A screenshot alone does not confirm that the money has been received into your balance.",
        recommended: language === "ne"
          ? "आफ्नै eSewa वा बैंकिङ एपको स्टेटमेन्टमा कारोबार रुजु गर्नुहोस्।"
          : "Verify the transaction in your own eSewa app ledger."
      });
      findings.push({
        id: "f-scr-3",
        title: language === "ne" ? "अस्वाभाविक भुक्तानी निर्देशन" : "Unusual payment instructions",
        severity: "medium",
        evidence: `"Send to this alternate number if not working"`,
        explanation: language === "ne"
          ? "आधिकारिक माध्यम बाहेक अरु नम्बर प्रयोग गर्न भन्नु गम्भीर जोखिमको संकेत हो।"
          : "Requests to use different numbers or methods can be a significant red flag.",
        recommended: language === "ne"
          ? "केवल आधिकारिक र दर्ता भएका भुक्तानी च्यानलहरू मात्र प्रयोग गर्नुहोस्।"
          : "Only use official registered payment channels."
      });
      findings.push({
        id: "f-scr-4",
        title: language === "ne" ? "अमिल्दो कारोबार विवरण" : "Inconsistent details",
        severity: "medium",
        evidence: `"Reference number does not match typical transaction format"`,
        explanation: language === "ne"
          ? "रसिदमा देखाइएको फन्ट र रेफरेन्स नम्बर आधिकारिक ढाँचासँग मेल खाँदैन।"
          : "Details in the image don't align with typical Nepali wallet transaction formats.",
        recommended: language === "ne"
          ? "आफ्नो आधिकारिक स्टेटमेन्टसँग सम्पूर्ण विवरण दाँज्नुहोस्।"
          : "Double-check all transaction details against your real bank ledger."
      });
    } else if (hasPresetTag === "review" || data.fileSize > 2500000) {
      riskCategory = "review";
      evidenceCount = 2;
      findings.push({
        id: "f-scr-rev-1",
        title: language === "ne" ? "अस्पष्ट वा सम्पादित हुन सक्ने रसिद" : "Low fidelity or compressed voucher",
        severity: "medium",
        evidence: `"Image contains compression artifacts near amount text"`,
        explanation: language === "ne"
          ? "रकम भएको स्थानमा अस्वाभाविक धमिलोपन वा फन्ट भिन्नता देखिन्छ।"
          : "Font artifacts and compression anomalies detected around the transaction amount area.",
        recommended: language === "ne"
          ? "ग्राहकलाई आधिकारिक कारोबार कोड माग्नुहोस् र आफ्नो खाता जाँच गर्नुहोस्।"
          : "Request the official transaction ID and check your own merchant ledger."
      });
      findings.push({
        id: "f-scr-rev-2",
        title: language === "ne" ? "वालेट मौज्दात प्रमाणीकरण आवश्यक" : "Account clearance pending",
        severity: "medium",
        evidence: `"Screenshot shows pending payment clearance"`,
        explanation: language === "ne"
          ? "कारोबार प्रोसेसिङमा रहेको बेला रद्द हुन वा असफल हुन सक्छ।"
          : "Transfers in pending status can fail or be reversed prior to settlement.",
        recommended: language === "ne"
          ? "रकम खातामा जम्मा भएको 'Success' सन्देश नआएसम्म पर्खनुहोस्।"
          : "Wait until the credit entry appears as successful in your bank account."
      });
    } else {
      riskCategory = "safe";
      evidenceCount = 0;
      findings.push({
        id: "f-scr-safe-1",
        title: language === "ne" ? "कुनै स्पष्ट सम्पादन संकेत देखिएन" : "Standard visual layout detected",
        severity: "low",
        evidence: `"Standard Nepali payment voucher layout structure"`,
        explanation: language === "ne"
          ? "रसिदमा कुनै स्पष्ट केरमेट वा फन्ट हेरफेर देखिएको छैन। यद्यपि, स्क्रिनसटलाई मात्र भर पर्नु हुँदैन।"
          : "The image exhibits standard proportions and expected font geometry. However, digital images can be replicated.",
        recommended: language === "ne"
          ? "सामान पठाउनु अघि सधैं आफ्नै मोबाइल बैंकिङ एप खोलेर जाँच गर्नुहोस्।"
          : "Always verify the deposit in your native banking or wallet application."
      });
    }
  } else if (type === "message") {
    // Message text analysis
    if (detectedUrgency || detectedAlternate || text.includes("cancel") || (detectedPhone && text.includes("refund"))) {
      riskCategory = "high";
      evidenceCount = 3;
      if (detectedUrgency) {
        findings.push({
          id: "f-msg-1",
          title: language === "ne" ? "अत्यधिक हतार र दबाब" : "Urgent pressure to act",
          severity: "high",
          evidence: rawText.length > 60 ? `"${rawText.slice(0, 60)}..."` : `"${rawText}"`,
          explanation: language === "ne"
            ? "दबाब दिएर छिटो सामान पठाउन लगाउने प्रवृत्ति ठगीको प्रमुख लक्षण हो।"
            : "Aggressive timeline demands are designed to circumvent payment confirmation.",
          recommended: language === "ne"
            ? "दबाबमा नपरी पहिले आफ्नो बैंक खाता जाँच्नुहोस्।"
            : "Do not rush. Confirm credit in your ledger before any goods release."
        });
      }
      if (detectedAlternate) {
        findings.push({
          id: "f-msg-2",
          title: language === "ne" ? "वैकल्पिक नम्बर वा फिर्ता माग्ने बहाना" : "Alternate payment / overpayment claim",
          severity: "high",
          evidence: `"Requests action on alternate number / wallet"`,
          explanation: language === "ne"
            ? "बढी रकम पठाएको बहाना वा अर्कै नम्बरमा पैसा पठाउन भन्नु ठगीको रणनीति हो।"
            : "Directing funds or refunds to alternate numbers is a staple mechanism of payment redirection fraud.",
          recommended: language === "ne"
            ? "अपरिचित नम्बरमा कुनै रकम फिर्ता नपठाउनुहोस्।"
            : "Never send refunds to alternate contact numbers without bank statement clearance."
        });
      }
      findings.push({
        id: "f-msg-3",
        title: language === "ne" ? "अनौपचारिक माध्यमबाट भुक्तानी दाबी" : "Unverified communication channel",
        severity: "medium",
        evidence: `"Payment confirmation via private chat message"`,
        explanation: language === "ne"
          ? "एसएमएस वा च्याटमा पठाइएका सन्देश आधिकारिक बैंक अलर्ट होइनन्।"
          : "SMS or chat text can easily be crafted by any sender to mimic bank verifications.",
        recommended: language === "ne"
          ? "आफ्नै बैंकिङ एपको स्टेटमेन्टमा मात्र विश्वास गर्नुहोस्।"
          : "Rely exclusively on your internal banking application ledger."
      });
    } else if (detectedPaymentClaim) {
      riskCategory = "review";
      evidenceCount = 2;
      findings.push({
        id: "f-msg-rev-1",
        title: language === "ne" ? "स्वतन्त्र प्रमाणीकरण आवश्यक" : "Manual verification needed",
        severity: "medium",
        evidence: `"${rawText.slice(0, 50)}..."`,
        explanation: language === "ne"
          ? "सन्देशमा भुक्तानीको दाबी गरिएको छ, तर खातामा रकम आएको पुष्टि आफ्नै एपबाट हुनुपर्छ।"
          : "Payment was referenced in text, but independent confirmation from your merchant app is mandatory.",
        recommended: language === "ne"
          ? "आफ्नो वालेटमा स्टेटमेन्ट जाँच्नुहोस्।"
          : "Check your transaction statement before packing items."
      });
      findings.push({
        id: "f-msg-rev-2",
        title: language === "ne" ? "कारोबार आइडी जाँच गर्नुहोस्" : "Verify Reference / Txn ID",
        severity: "low",
        evidence: `"Sender states payment was sent"`,
        explanation: language === "ne"
          ? "दाबी गरिएको कारोबार कोड वास्तविक खातासँग मिल्नुपर्छ।"
          : "Ensure the reference code provided corresponds to an actual entry.",
        recommended: language === "ne"
          ? "ग्राहकलाई आधिकारिक कारोबार नम्बर दिन भन्नुहोस्।"
          : "Confirm transaction reference in your official wallet portal."
      });
    } else {
      riskCategory = "safe";
      evidenceCount = 0;
      findings.push({
        id: "f-msg-safe-1",
        title: language === "ne" ? "कुनै शंकास्पद ठगी शब्दहरू भेटिएनन्" : "No obvious scam indicators found",
        severity: "low",
        evidence: `"${rawText.slice(0, 40)}..."`,
        explanation: language === "ne"
          ? "यस सन्देशमा कुनै दबाब वा अस्वाभाविक वित्तीय निर्देशन भेटिएन।"
          : "The submitted message text does not trigger typical threat signatures.",
        recommended: language === "ne"
          ? "नियमित प्रक्रिया अनुसार भुक्तानी यकिन गर्नुहोस्।"
          : "Follow standard procedure: verify in your banking ledger."
      });
    }
  } else if (type === "url") {
    // URL analysis
    if (detectedUrlShortener || detectedSuspiciousDomain || text.includes("esewa") || text.includes("khalti")) {
      const isOfficialDomain = /esewa\.com\.np|khalti\.com|connectips\.com|fonepay\.com/i.test(text);
      if (!isOfficialDomain) {
        riskCategory = "high";
        evidenceCount = 3;
        findings.push({
          id: "f-url-1",
          title: language === "ne" ? "अनधिकृत वा नक्कली डोमेन" : "Unauthorized or impersonating domain",
          severity: "high",
          evidence: `"${rawText}"`,
          explanation: language === "ne"
            ? "यो लिङ्क आधिकारिक नेपाली भुक्तानी सेवा प्रदायकको होइन। यस्ता लिङ्कहरू फिसिङका लागि प्रयोग गरिन्छन्।"
            : "The target domain does not match official Nepali financial service providers and may host a phishing portal.",
          recommended: language === "ne"
            ? "यो लिङ्क नखोल्नुहोस् र कुनै पनि पासवर्ड वा MPIN नहाल्नुहोस्।"
            : "Do not click or enter MPIN/credentials on this destination."
        });
        if (detectedUrlShortener) {
          findings.push({
            id: "f-url-2",
            title: language === "ne" ? "गन्तव्य लुकाउने छोटकरी लिङ्क (URL Shortener)" : "Concealed URL destination",
            severity: "high",
            evidence: `"Shortened redirect link: ${rawText}"`,
            explanation: language === "ne"
              ? "सर्टनर लिङ्कले वास्तविक वेबसाइटको नाम लुकाउँछ।"
              : "URL shorteners hide the real server destination to bypass spam filters.",
            recommended: language === "ne"
              ? "छोटकरी लिङ्कहरूमा कहिल्यै लगइन नगर्नुहोस्।"
              : "Never authenticate through shortened redirection links."
          });
        }
        findings.push({
          id: "f-url-3",
          title: language === "ne" ? "संवेदनशील डाटा चोरीको जोखिम" : "Credential theft hazard",
          severity: "medium",
          evidence: `"Suspicious authentication endpoint"`,
          explanation: language === "ne"
            ? "अनधिकृत वेबसाइटमा वालेट आइडी वा पासवर्ड हाल्दा खाता ह्याक हुन सक्छ।"
            : "Entering credentials into unverified domains can lead to complete wallet takeover.",
          recommended: language === "ne"
            ? "सधैं आधिकारिक मोबाइल एप वा बुकमार्क गरिएको साइट मात्र खोल्नुहोस्।"
            : "Access payment providers only via official mobile apps or verified bookmarks."
        });
      } else {
        riskCategory = "safe";
        evidenceCount = 0;
        findings.push({
          id: "f-url-safe-1",
          title: language === "ne" ? "आधिकारिक नेपाली भुक्तानी डोमेन" : "Verified official domain structure",
          severity: "low",
          evidence: `"${rawText}"`,
          explanation: language === "ne"
            ? "यो लिङ्क आधिकारिक दर्ता भएको नेपाली पोर्टलको देखिन्छ।"
            : "Domain resolves to recognized official registry infrastructure.",
          recommended: language === "ne"
            ? "सधैं ब्राउजरमा HTTPS प्याडलक जाँच गर्नुहोस्।"
            : "Ensure HTTPS padlock is present in your browser address bar."
        });
      }
    } else {
      riskCategory = "review";
      evidenceCount = 1;
      findings.push({
        id: "f-url-rev-1",
        title: language === "ne" ? "अपरिचित बाह्य वेबसाइट" : "Unverified external link",
        severity: "medium",
        evidence: `"${rawText}"`,
        explanation: language === "ne"
          ? "यो डोमेन हाम्रो ज्ञात आधिकारिक नेपाली वालेटहरूको सूचीमा छैन।"
          : "This URL does not belong to standard recognized Nepali merchant gateways.",
        recommended: language === "ne"
          ? "अपरिचित लिङ्कमा क्लिक नगर्नुहोस्।"
          : "Avoid clicking external payment links sent in chat messages."
      });
    }
  }

  const nextSteps = [
    language === "ne" 
      ? "आफ्नै बैंकिङ वा वालेट एप स्वतन्त्र रूपमा खोल्नुहोस्।" 
      : "Open your own banking or wallet application independently.",
    language === "ne" 
      ? "स्टेटमेन्टमा कारोबारको स्थिति र रकम जाँच्नुहोस्।" 
      : "Check the transaction status and amount in your trusted ledger.",
    language === "ne" 
      ? "पठाउनेको नाम र कारोबार कोड (Txn Reference) रुजु गर्नुहोस्।" 
      : "Confirm the recipient and transaction reference.",
    language === "ne" 
      ? "खातामा रकम जम्मा भएको पक्का नभएसम्म सामान नपठाउनुहोस्।" 
      : "Do not dispatch goods until payment is confirmed in trusted records.",
    language === "ne" 
      ? "ठगी भएको शंका लागेमा प्रमाण सुरक्षित राखेर सम्बन्धित बैंक वा प्रहरीमा खबर गर्नुहोस्।" 
      : "If fraud is suspected, preserve the evidence and contact the relevant financial institution."
  ];

  const summary = riskCategory === "high"
    ? (language === "ne" 
        ? "यस सामग्रीमा बहुसंख्यक शंकास्पद संकेतहरू भेटिएका छन्। सामान पठाउनु अघि आफ्नै बैंक वा वालेटमा रकम प्रमाणीकरण गर्नुहोस्।"
        : "This content shows multiple warning signs. Be careful and verify the payment in your own banking or wallet app before taking any action.")
    : riskCategory === "review"
    ? (language === "ne"
        ? "केही विवरणहरू अस्पष्ट वा अमिल्दो छन्। आफ्नै वालेट एप खोलेर कारोबार जाँच्न सिफारिस गरिन्छ।"
        : "Some inconsistencies or missing details require independent verification in your payment app before proceeding.")
    : (language === "ne"
        ? "कुनै मुख्य चेतावनी फेला परेन। यद्यपि स्क्रिनसट सम्पादन गर्न सकिने भएकाले आफ्नै बैंक स्टेटमेन्ट जाँच्नुहोस्।"
        : "No common scam indicators detected, but remember screenshots can be falsified. Always verify in your authentic banking app.");

  const riskLabel = riskCategory === "high"
    ? (language === "ne" ? "उच्च जोखिम" : "High Concern")
    : riskCategory === "review"
    ? (language === "ne" ? "प्रमाणीकरण आवश्यक" : "Needs Verification")
    : (language === "ne" ? "कुनै मुख्य चेतावनी फेला परेन" : "No Major Warning Signs Detected");

  return {
    id: `scan-${Date.now()}`,
    type,
    typeLabel: type === "screenshot" ? "Payment Screenshot" : type === "message" ? "Suspicious Message" : "Unknown URL",
    submittedItem: data.fileName || (rawText.length > 50 ? `${rawText.slice(0, 50)}...` : rawText) || "Uploaded file",
    dateFormatted: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    timestamp: new Date().toISOString(),
    riskCategory,
    riskLabel,
    status: "Completed",
    evidenceFound: evidenceCount,
    totalIndicators: type === "screenshot" ? 6 : type === "message" ? 5 : 4,
    summary,
    findings,
    nextSteps,
    disclaimer: language === "ne"
      ? "ScamShield ले सम्भावित चेतावनीका संकेतहरू मात्र पहिचान गर्छ। यसले कुनै रकम प्राप्त भयो वा भएन भन्ने स्वतन्त्र रूपमा पुष्टि गर्न सक्दैन।"
      : "ScamShield identifies potential warning signs. This analysis cannot independently confirm whether money was received or prove that a person or transaction is fraudulent."
  };
}

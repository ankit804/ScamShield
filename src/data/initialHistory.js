export const initialHistory = [
  {
    id: "scan-1",
    type: "screenshot",
    typeLabel: "Payment Screenshot",
    submittedItem: "eSewa payment image (NPR 2,500)",
    dateFormatted: "Apr 22, 2025 14:32",
    timestamp: "2025-04-22T14:32:00Z",
    riskCategory: "high",
    riskLabel: "High",
    status: "Completed",
    evidenceFound: 4,
    totalIndicators: 6,
    summary: "This content shows multiple warning signs. Be careful and verify the payment in your own banking or wallet app before taking any action.",
    findings: [
      {
        id: "f-1",
        title: "Urgent pressure to act",
        severity: "high",
        evidence: "Dispatch immediately or I will cancel the order",
        explanation: "Pressure to act quickly is a common tactic used in scams to bypass normal verification routines.",
        recommended: "Do not rush. Verify the payment first in your own wallet app."
      },
      {
        id: "f-2",
        title: "Suspicious payment claim",
        severity: "high",
        evidence: "Payment sent via eSewa, check and confirm",
        explanation: "A screenshot alone does not confirm that the money has been received into your balance.",
        recommended: "Verify the transaction in your own eSewa merchant app."
      },
      {
        id: "f-3",
        title: "Unusual payment instructions",
        severity: "medium",
        evidence: "Send to this alternate number if not working",
        explanation: "Requests to use different numbers or unofficial channels can be a significant red flag.",
        recommended: "Only use official registered payment channels."
      },
      {
        id: "f-4",
        title: "Inconsistent details",
        severity: "medium",
        evidence: "Reference number does not match standard amount format",
        explanation: "Details in the message and screenshot don't align with typical transaction structures.",
        recommended: "Double-check all transaction details against your real bank ledger."
      }
    ],
    nextSteps: [
      "Open your own banking or wallet application independently.",
      "Check the transaction status and amount in your statement.",
      "Confirm the recipient and transaction reference.",
      "Do not dispatch goods until payment is confirmed in trusted records.",
      "If fraud is suspected, preserve the evidence and contact the relevant financial institution."
    ]
  },
  {
    id: "scan-2",
    type: "message",
    typeLabel: "Suspicious Message",
    submittedItem: "Payment received from 9841000000... (SMS claim)",
    dateFormatted: "Apr 22, 2025 11:20",
    timestamp: "2025-04-22T11:20:00Z",
    riskCategory: "high",
    riskLabel: "High",
    status: "Completed",
    evidenceFound: 3,
    totalIndicators: 5,
    summary: "Incoming SMS claimed payment was processed from a 10-digit mobile number rather than an official bank or eSewa shortcode.",
    findings: [
      {
        id: "f-201",
        title: "Unofficial SMS Sender ID",
        severity: "high",
        evidence: "Sent from personal mobile number +977-9841234567 instead of registered sender ID",
        explanation: "Official eSewa or bank notifications are delivered through registered shortcodes (e.g. 38000, eSewa), never private SIM numbers.",
        recommended: "Disregard payment claims sent from private numbers."
      },
      {
        id: "f-202",
        title: "Demands immediate goods release",
        severity: "high",
        evidence: "Rider is waiting outside, please give package right now",
        explanation: "Creating false urgency to pressure the merchant into skipping account verification.",
        recommended: "Insist on confirming bank balance before handing over goods."
      },
      {
        id: "f-203",
        title: "Unverifiable Balance Claim",
        severity: "medium",
        evidence: "Claimed available balance: NPR 35,400",
        explanation: "Spoofed SMS texts commonly append fake remaining balances to look authentic.",
        recommended: "Check your genuine account statement directly."
      }
    ],
    nextSteps: [
      "Open your mobile banking app independently.",
      "Look for recent credit entries in your official statement.",
      "Inform the customer politely that goods are released upon confirmed ledger credit."
    ]
  },
  {
    id: "scan-3",
    type: "url",
    typeLabel: "Unknown URL",
    submittedItem: "https://bit.ly/esewa-verify-now",
    dateFormatted: "Apr 21, 2025 16:45",
    timestamp: "2025-04-21T16:45:00Z",
    riskCategory: "high",
    riskLabel: "High",
    status: "Completed",
    evidenceFound: 4,
    totalIndicators: 5,
    summary: "Shortened link redirecting to an unauthorized domain mimicking official Nepali wallet login screens.",
    findings: [
      {
        id: "f-301",
        title: "URL Shortener concealing destination",
        severity: "high",
        evidence: "bit.ly/esewa-verify-now",
        explanation: "URL shorteners conceal the real server destination and are frequently used in phishing campaigns.",
        recommended: "Never enter your login credentials or MPIN on shortened links."
      },
      {
        id: "f-302",
        title: "Domain Impersonation attempt",
        severity: "high",
        evidence: "Target resolves to non-esewa domain: secure-nepal-kyc.top",
        explanation: "The official eSewa web portal operates solely on esewa.com.np. Unofficial domains steal customer passwords.",
        recommended: "Do not visit the website. Clear browser cache if entered."
      },
      {
        id: "f-303",
        title: "Urgent account suspension threat",
        severity: "medium",
        evidence: "Verify your KYC within 24 hours or your account will be frozen",
        explanation: "Fear tactics are used to prompt quick compliance without checking official communication channels.",
        recommended: "Contact eSewa customer service at official 1660-01-02121 or info@esewa.com.np."
      }
    ],
    nextSteps: [
      "Do not enter MPIN, OTP, or password on external links.",
      "Bookmark official banking websites directly.",
      "Report phishing links to Nepal Police Cyber Bureau or the wallet provider."
    ]
  },
  {
    id: "scan-4",
    type: "screenshot",
    typeLabel: "Payment Screenshot",
    submittedItem: "Khalti payment (NPR 4,200)",
    dateFormatted: "Apr 21, 2025 13:10",
    timestamp: "2025-04-21T13:10:00Z",
    riskCategory: "review",
    riskLabel: "Needs Review",
    status: "Completed",
    evidenceFound: 2,
    totalIndicators: 5,
    summary: "Receipt shows minor font compression anomalies and a missing Nepali timestamp, requiring verification in your merchant portal.",
    findings: [
      {
        id: "f-401",
        title: "Receipt Timestamp Discrepancy",
        severity: "medium",
        evidence: "Timestamp displays 12-hour format without AM/PM designation",
        explanation: "Official Khalti transaction receipts follow consistent time formatting.",
        recommended: "Check your Khalti merchant dashboard for the matching transaction ID."
      },
      {
        id: "f-402",
        title: "Unconfirmed Transaction State",
        severity: "low",
        evidence: "Status banner shows pending clearance in customer view",
        explanation: "A transaction in pending status can fail or be cancelled by the payment gateway.",
        recommended: "Wait until the funds settle with 'Success' status in your own account."
      }
    ],
    nextSteps: [
      "Open your Khalti Merchant or consumer app.",
      "Confirm if transaction ID exists in your ledger.",
      "If not reflected after 15 minutes, ask customer to check their bank deduction status."
    ]
  },
  {
    id: "scan-5",
    type: "message",
    typeLabel: "Suspicious Message",
    submittedItem: "Please send money fast (InDrive courier claim)",
    dateFormatted: "Apr 20, 2025 10:05",
    timestamp: "2025-04-20T10:05:00Z",
    riskCategory: "review",
    riskLabel: "Review Recommended",
    status: "Completed",
    evidenceFound: 2,
    totalIndicators: 4,
    summary: "Customer requested sending excess money back to an alternate digital wallet number before payment settled.",
    findings: [
      {
        id: "f-501",
        title: "Third-party payment redirection",
        severity: "medium",
        evidence: "Please refund Rs 2,000 extra to my brother's wallet 9811223344",
        explanation: "Overpayment refund requests are a classic fraud mechanism where the original payment is fake or clawed back.",
        recommended: "Never refund money until original deposit is 100% cleared in your official statement."
      }
    ],
    nextSteps: [
      "Do not send money to alternate numbers.",
      "Verify funds in your primary bank account first.",
      "Consult your senior manager or merchant support if pressured."
    ]
  },
  {
    id: "scan-6",
    type: "screenshot",
    typeLabel: "Payment Screenshot",
    submittedItem: "ConnectIPS transfer receipt (NPR 18,500)",
    dateFormatted: "Apr 19, 2025 17:15",
    timestamp: "2025-04-19T17:15:00Z",
    riskCategory: "safe",
    riskLabel: "No Major Warnings",
    status: "Completed",
    evidenceFound: 0,
    totalIndicators: 6,
    summary: "Visual structure, reference format, and typography match authentic ConnectIPS transaction vouchers. Remember that images can still be falsified.",
    findings: [
      {
        id: "f-601",
        title: "Standard Transaction Layout",
        severity: "low",
        evidence: "ConnectIPS reference ID matches standard 16-character alphanumeric pattern",
        explanation: "No obvious digital tampering, font misalignment, or compression artifacts detected.",
        recommended: "Standard best practice: still cross-check your bank mobile app credit ledger."
      }
    ],
    nextSteps: [
      "Log into your mobile banking app to confirm the funds.",
      "Check statement for reference number matching customer voucher.",
      "Proceed with order fulfillment once credited."
    ]
  }
];

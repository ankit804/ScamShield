export const sampleScenarios = {
  screenshots: [
    {
      id: "fake-esewa-2500",
      title: "eSewa Fake Receipt (NPR 2,500.00)",
      description: "Edited receipt with altered amount, font discrepancies, and false timestamp",
      riskType: "high-fraud",
      previewData: {
        app: "eSewa",
        status: "Payment Successful",
        amount: "NPR 2,500.00",
        amountInWords: "Two Thousand Five Hundred Only",
        refNo: "12356598",
        date: "2081-10-12 14:32",
        recipient: "Ankit Online Store (9801234567)",
        isSimulated: true
      },
      textRepresentation: "Payment Successful NPR 2,500.00 Reference No: 12356598 Date: 2081-10-12 14:32 To: Ankit Online Store"
    },
    {
      id: "khalti-review-4200",
      title: "Khalti Unsettled Voucher (NPR 4,200.00)",
      description: "Pending state voucher with compression artifacts and missing 2FA verification",
      riskType: "review",
      previewData: {
        app: "Khalti",
        status: "Payment Initiated (Pending Settlement)",
        amount: "NPR 4,200.00",
        amountInWords: "Four Thousand Two Hundred Only",
        refNo: "KH-9844-3310",
        date: "2081-10-14 11:15",
        recipient: "Boutique Collection",
        isSimulated: true
      },
      textRepresentation: "Payment Initiated NPR 4,200.00 Ref: KH-9844-3310 Pending settlement"
    },
    {
      id: "genuine-fonepay-1500",
      title: "Genuine ConnectIPS / Fonepay Voucher",
      description: "Authentic layout format with valid 16-digit alphanumeric reference",
      riskType: "safe",
      previewData: {
        app: "Fonepay / ConnectIPS",
        status: "Transaction Successful",
        amount: "NPR 1,500.00",
        amountInWords: "One Thousand Five Hundred Only",
        refNo: "NBL-20250422-99812",
        date: "2025-04-22 10:20:14",
        recipient: "Registered Merchant QR",
        isSimulated: true
      },
      textRepresentation: "Transaction Successful NPR 1,500.00 Ref: NBL-20250422-99812 ConnectIPS Network"
    }
  ],
  messages: [
    {
      id: "msg-urgent-esewa",
      title: "Urgent Courier Rush (English)",
      risk: "high",
      text: "Dispatch immediately or I will cancel the order! Payment sent via eSewa 9841234567, check and confirm. InDrive rider is already outside waiting. Send receipt to this alternate number 9801234567 if not working."
    },
    {
      id: "msg-nepali-rush",
      title: "शंकास्पद हतार सन्देश (Nepali)",
      risk: "high",
      text: "नमस्ते, मैले इसेवा मार्फत रु २,५०० पठाएको छु। स्क्रिनसट हेर्नुहोस् र तुरुन्तै सामान पठाइदिनुहोस्। राइडर आइसकेको छ, ढिलो भए अर्डर रद्द गर्छु।"
    },
    {
      id: "msg-overpayment-refund",
      title: "Overpayment Scam Claim",
      risk: "high",
      text: "Hello, I accidentally sent NPR 12,000 instead of NPR 2,000 to your bank account! Please urgently transfer back the extra NPR 10,000 to my brother's Khalti account 9811223344 right now."
    },
    {
      id: "msg-normal-inquiry",
      title: "Normal Merchant Inquiry",
      risk: "safe",
      text: "Hi, I have initiated payment for Order #492 via mobile banking. Please check your ledger when convenient and let me know when it is packed. Thank you!"
    }
  ],
  urls: [
    {
      id: "url-bitly-phishing",
      title: "Shortened Phishing Link (High Concern)",
      url: "https://bit.ly/esewa-urgent-kyc-verify",
      risk: "high"
    },
    {
      id: "url-fake-fonepay",
      title: "Fake Reward Portal (High Concern)",
      url: "https://fonepay-cashback-claim.online/login",
      risk: "high"
    },
    {
      id: "url-official-esewa",
      title: "Official eSewa Portal (Verified Domain)",
      url: "https://esewa.com.np",
      risk: "safe"
    }
  ]
};

/**
 * Generates and downloads a clean FinTech security audit report for ScamShield Nepal
 */
export function generateAuditReport(result, language = 'en') {
  const isNe = language === 'ne';

  const reportText = `
================================================================================
SCAMSHIELD NEPAL — PAYMENT SAFETY & FRAUD RISK AUDIT REPORT
================================================================================
Generated Date: ${new Date().toLocaleString()}
Reference ID: ${result.id}
Input Category: ${result.typeLabel}
Submitted Item: ${result.submittedItem}
Overall Risk Level: ${result.riskLabel.toUpperCase()}
Evidence Indicators: ${result.evidenceFound} of ${result.totalIndicators} flags identified

--------------------------------------------------------------------------------
RISK SUMMARY
--------------------------------------------------------------------------------
${result.summary}

--------------------------------------------------------------------------------
DETECTED WARNING SIGNS & EVIDENCE
--------------------------------------------------------------------------------
${result.findings.map((f, idx) => `
[${idx + 1}] ${f.title.toUpperCase()} (Severity: ${f.severity.toUpperCase()})
- Extracted Evidence: ${f.evidence}
- Security Explanation: ${f.explanation}
- Recommended Action: ${f.recommended}
`).join('\n')}

--------------------------------------------------------------------------------
RECOMMENDED VERIFICATION STEPS
--------------------------------------------------------------------------------
${result.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

--------------------------------------------------------------------------------
FINANCIAL TECHNOLOGY LEGAL & SAFETY DISCLAIMER
--------------------------------------------------------------------------------
${result.disclaimer}

This document is generated for illustrative fraud prevention guidance only.
Always consult your bank or wallet provider (eSewa / Khalti / ConnectIPS) directly.
================================================================================
`;

  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ScamShield-Report-${result.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

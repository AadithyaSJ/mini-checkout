# Defect Report: Mini Checkout

## 1. Overview

This document records any defects, anomalies, or deviations identified during the manual and automated testing cycles of the **Mini Checkout** application.

---

## 2. Defect Status Summary

- **Total Defects Identified:** 0
- **Critical (P1):** 0
- **High (P2):** 0
- **Medium (P3):** 0
- **Low (P4):** 0

---

## 3. Observation Details

No defects were observed during the executed test cases.

All functional areas operated in accordance with requirements:
1. **Product Pricing & Catalog**: Prices for `P001` (Wireless Headphones: ₹1,499.00) and `P002` (Smart Watch: ₹2,499.00) remained immutable and could not be overridden by user input.
2. **Cart Calculations**: Line subtotals and the overall order total calculated correctly using integer paise without rounding or IEEE-754 floating-point inaccuracies.
3. **Quantity Floor Enforcement**: Quantities were prevented from reaching zero or negative values.
4. **Input Validation**: Whitespace-only and empty customer names were rejected, error messages correctly associated with inputs via `aria-describedby` and `aria-invalid`, and existing inputs preserved.
5. **Duplicate Submission Protection**: The synchronous submission lock successfully mitigated race conditions during rapid double-clicks, ensuring only a single order confirmation and reference were created.
6. **Error Recovery**: An invalid submission attempt did not permanently lock the checkout; valid subsequent input was processed without issues.

---

## 4. Test Environment Verification

- **Operating System:** Windows 11 (win32 10.0.26100)
- **Node.js Runtime:** v22.22.2
- **Playwright Test Runner:** v1.50+
- **Execution Browser:** Chromium 159.0.8154.6 (Desktop Chrome)
- **Execution Mode:** Headless & Headed (manual verification)

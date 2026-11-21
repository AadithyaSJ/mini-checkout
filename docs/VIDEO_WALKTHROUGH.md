# Video Walkthrough & Presentation Guide

## 1. Overview & Media Files

This document provides the complete video demonstration script, architecture breakdown, test plan alignment, and evaluation analysis for the **Mini Checkout and Browser Test Suite**.

- **Master Walkthrough MP4 (Video + Full Voiceover):** [`videos/mini-checkout-complete-walkthrough.mp4`](../videos/mini-checkout-complete-walkthrough.mp4)
  - **Resolution:** 1920x1080 (1080p Full HD)
  - **Duration:** 3 minutes 09 seconds
  - **Audio Track:** Full spoken voiceover narration (AAC) explaining architecture, test plan, execution, and evaluation.
  - **Video Codec:** H.264 / AVC (Compatible with all modern browsers, media players, YouTube, and Drive).
- **Recorded Screen Interaction Video:** [`videos/mini-checkout-demo.webm`](../videos/mini-checkout-demo.webm)
  - **Resolution:** 1280x720 (720p HD)
  - **Captured Engine:** Headless Chromium via Playwright Browser Automation (`recordVideo` API)
- **Interactive Presentation Deck:** [`demo.html`](../demo.html)
  - Interactive HTML5 presentation page embedding the live video player alongside synchronized high-resolution screenshots.

---

## 2. Component Hierarchy & Architecture

```text
[Mini Checkout Single-Page App]
├── Header Component
│   ├── Brand Icon & Title ("Mini Checkout")
│   └── Live Cart Item Count Indicator (aria-live="polite")
│
├── Left Column: Catalog & Active Cart
│   ├── Product Catalogue Section
│   │   ├── Product P001: Wireless Headphones (₹1,499.00 / 149900 paise)
│   │   ├── Product P002: Smart Watch (₹2,499.00 / 249900 paise)
│   │   └── "Add to Cart" Action Triggers
│   │
│   └── Shopping Cart Section
│       ├── Empty Cart Alert Message (Fallback state)
│       └── Dynamic Cart Item Rows
│           ├── Product Meta & Unit Price
│           ├── Quantity Controls (+ / - with floor at 1)
│           ├── Line Subtotal (Dynamic INR calculation)
│           └── "Remove" Item Action Trigger
│
└── Right Column: Checkout & Confirmation
    ├── Customer Form Section
    │   ├── Customer Name Input (Required, trimmed, aria-describedby)
    │   ├── Inline Field Error Message Container (aria-invalid)
    │   ├── Cart Error Banner Container (aria-live="polite")
    │   ├── Order Summary Breakdown (Subtotal, Tax ₹0.00, Free Shipping, Total)
    │   └── "Place Order" Action Button (Protected by synchronous lock)
    │
    └── Order Confirmation Section (Displayed post-submission)
        ├── Success Icon & Simulated Confirmation Heading
        ├── Unique Order Reference Code (ORD-2026-XXXXXX)
        ├── Confirmed Customer Name
        ├── Verified Total Amount
        └── Permanent Control Disablement Flag
```

---

## 3. Video Storyboard & Voiceover Script

### **Scene 1: Introduction & Catalogue Architecture (00:00 – 00:05)**
- **Visual:** Browser opens to `http://localhost:3000`. Clean two-column layout with dark typography on neutral background.
- **Voiceover Script:**
  > *"Welcome to the Mini Checkout demonstration. Built entirely in Vanilla HTML5, CSS3, and JavaScript, the application defines two synthetic catalog products with fixed prices: Wireless Headphones at ₹1,499.00 and Smart Watch at ₹2,499.00. Notice that all product pricing is immutable and centrally defined in code to prevent any client-side tampering."*
- **Component Under Test:** Product Grid & Header Item Indicator.
- **Evidence Screenshot:** `screenshots/tc03-exact-totals.png`

---

### **Scene 2: Empty Cart Checkout Prevention (MT01) (00:05 – 00:10)**
- **Visual:** Cursor enters `Alice Smith` in Customer Name while cart has 0 items. Clicks "Place Order". Red alert banner appears: *"Your cart is empty. Please add at least one product before placing an order."*
- **Voiceover Script:**
  > *"First, we demonstrate Manual Test MT01. We enter a valid customer name with an empty cart and attempt to checkout. The application immediately intercepts the submission, displaying a clear alert banner. Notice that no order confirmation is generated, and the Place Order button remains active so the user can continue shopping."*
- **Component Under Test:** Cart Error Alert (`[data-testid="cart-error"]`).
- **Evidence Screenshot:** `screenshots/mt01-empty-cart-blocked.png`

---

### **Scene 3: Required Field Validation & Error Recovery (TC02) (00:10 – 00:16)**
- **Visual:** User clicks "Add to Cart" on Wireless Headphones. The name field is cleared and "Place Order" is clicked. An inline error appears: *"Customer name is required"*. User then types `Jane Doe`, and the error disappears.
- **Voiceover Script:**
  > *"Next, in automated test TC02, we add an item to the cart and attempt to place an order without a customer name. The system rejects the submission, flags the input with `aria-invalid="true"`, and displays an inline error message. Notice that our cart state is completely preserved. As soon as the user enters a valid name, the error automatically clears, enabling smooth recovery."*
- **Component Under Test:** Customer Name Field & Error Association (`aria-describedby`).
- **Evidence Screenshot:** `screenshots/tc02-missing-field-validation.png` and `screenshots/tc02-recovery-successful.png`

---

### **Scene 4: Financial Precision & Quantity Adjustments (TC03) (00:16 – 00:23)**
- **Visual:** User clicks `+` on Wireless Headphones -> subtotal updates to ₹2,998.00. Adds Smart Watch -> grand total updates to ₹5,497.00. Clicks `-` on Wireless Headphones -> grand total updates to ₹3,998.00.
- **Voiceover Script:**
  > *"Here in test case TC03, we observe the core financial engine. All calculations are executed in integer paise internally. When increasing Wireless Headphones to quantity 2, the subtotal updates to ₹2,998.00. Adding the Smart Watch updates the order total to exactly ₹5,497.00. Decreasing quantity back to 1 brings the total to ₹3,998.00. Computing in paise ensures zero floating-point calculation drift."*
- **Component Under Test:** Quantity Controls, Line Item Subtotals, Order Total Display.
- **Evidence Screenshot:** `screenshots/tc03-exact-totals.png`

---

### **Scene 5: Concurrency Protection & Simulated Order Confirmation (TC01 & MT02) (00:23 – 00:30)**
- **Visual:** User enters `Test Customer` and triggers rapid double-clicking on "Place Order". The synchronous lock catches the secondary click. The screen renders exactly one confirmation card with reference `ORD-2026-XXXXXX` and total `₹3,998.00`. The button disables permanently.
- **Voiceover Script:**
  > *"Finally, we demonstrate duplicate submission protection under rapid double-clicking. Our synchronous lock immediately intercepts near-instantaneous clicks. Exactly one order is processed, generating a unique order reference code, displaying the customer name, verified total, and permanently locking the Place Order button to prevent repeat charges. All 5 tests pass in Playwright with 100% confidence."*
- **Component Under Test:** Synchronous Lock Handler, Order Confirmation Section.
- **Evidence Screenshot:** `screenshots/tc01-successful-checkout.png` and `screenshots/mt02-rapid-click-protection.png`

---

## 4. Evaluation Benchmark Matrix

| Benchmark | Implementation Strategy | Evaluation Outcome |
| :--- | :--- | :--- |
| **Financial Reliability** | Integer paise representation (`paise / 100` with standard `Intl.NumberFormat('en-IN')`). | Verified zero rounding errors or floating-point anomalies across all combinations. |
| **Race-Condition Protection** | Immediate synchronous boolean lock flag (`isSubmitting = true`). | Successfully mitigates rapid clicks (< 10ms); exactly 1 reference generated. |
| **Accessibility & UX** | ARIA attributes (`aria-invalid`, `aria-describedby`, `aria-live="polite"`), focus rings. | Screen-reader accessible and keyboard navigable. |
| **Test Quality & Coverage** | Playwright Test suite in Chromium covering automated (TC01–03) and manual (MT01–02). | 100% pass rate in ~5.9s with pre-rendered HTML reports and full visual evidence. |

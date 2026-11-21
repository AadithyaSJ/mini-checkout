# Mini Checkout and Browser Test Suite

A polished, minimal, responsive single-page ecommerce checkout application built with Vanilla HTML5, CSS3, and JavaScript, paired with an automated browser test suite powered by **Playwright Test**.

---

## 1. Project Overview

The **Mini Checkout** project demonstrates production-grade full-stack testing and development practices for a client-side checkout experience. The application provides fixed-price product browsing, dynamic cart state management with integer paise calculations (preventing floating-point currency errors), robust form validation, duplicate submission protection via a synchronous lock, and simulated order confirmation.

The accompanying test suite validates end-to-end functionality, calculations, concurrency guards, and edge cases with Playwright.

---

## 2. Features

- **Product Catalogue**: Centrally defined synthetic products with immutable pricing:
  - `P001`: Wireless Headphones — ₹1,499.00
  - `P002`: Smart Watch — ₹2,499.00
- **Cart Management**: Add items, adjust quantities, remove items, and enforce quantity boundaries (minimum quantity of 1; cannot be negative or zero).
- **Exact Financial Calculations**: All line totals and the grand total are calculated in integer paise internally to avoid floating-point math issues and formatted in INR (`₹X,XXX.00`).
- **Customer Form Validation**:
  - Required customer name.
  - Whitespace trimming before validation; rejects empty or blank submissions.
  - Value preservation upon validation errors.
  - Clear inline error feedback linked via `aria-describedby` and `aria-invalid`.
- **Empty Cart Prevention**: Blocks order submission if the cart contains zero items with a clear warning alert.
- **Synchronous Duplicate Submission Protection**: An immediate synchronous lock prevents rapid double-clicks from generating multiple orders or references.
- **Order Confirmation**: Displays a unique reference (`ORD-2026-XXXXXX`), customer name, and exact order total, while disabling further actions on the placed order.
- **Clean, Minimal UI**: Neutral palette, dark typography, subtle green accent for success, accessible button focus rings, and fully responsive grid layout.

---

## 3. Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Automation Engine**: Playwright (`@playwright/test`).
- **Assertions**: Playwright `expect` Web-First API with auto-waiting.
- **Test Reporting**: Playwright HTML Reporter & List Reporter.
- **Package Manager**: npm.
- **Local Server**: Lightweight native Node.js HTTP server (zero external server dependencies).

---

## 4. Project Structure

```text
mini-checkout/
├── index.html              # Main single-page application structure
├── styles.css              # Custom styling, responsive layout, accessible focus rings
├── app.js                  # State management, calculations, validation, submission lock
├── server.js               # Zero-dependency local static HTTP server
├── package.json            # Scripts and dependencies
├── playwright.config.js     # Playwright configuration (webServer, reporter, chromium)
├── .gitignore              # Ignored artifacts (node_modules, reports)
│
├── tests/
│   └── checkout.spec.js    # Automated Playwright test suite (TC01 - TC03, MT01, MT02)
│
├── docs/
│   ├── TEST_PLAN.md        # Comprehensive test strategy and risk prioritization
│   ├── TEST_RESULTS.md     # Execution results, pass rates, and environment details
│   └── DEFECT_REPORT.md    # Defect tracking record
│
├── screenshots/            # Actual test evidence captured during browser execution
│   ├── tc01-successful-checkout.png
│   ├── tc02-missing-field-validation.png
│   ├── tc02-recovery-successful.png
│   ├── tc03-exact-totals.png
│   ├── mt01-empty-cart-blocked.png
│   └── mt02-rapid-click-protection.png
│
└── README.md               # Setup and documentation
```

---

## 5. Prerequisites

- **Node.js**: Version 18.0.0 or higher (Tested on Node v22.22.2).
- **npm**: Version 9.0.0 or higher.
- Operating System: Windows, macOS, or Linux.

---

## 6. Installation Instructions

Clone or open the repository in your terminal, navigate to `mini-checkout`, and install the dependencies:

```bash
cd mini-checkout
npm install
npx playwright install chromium
```

---

## 7. Application Startup Instructions

To run the application locally for manual interaction:

```bash
npm start
```

The application will start on:
```text
http://localhost:3000/
```
Open this URL in any modern web browser. To terminate the server, press `Ctrl + C`.

---

## 8. Browser Test Execution

Run the complete automated Playwright test suite:

```bash
npx playwright test
```

### Additional Test Execution Options:

- **Run in headed browser (visible window)**:
  ```bash
  npm run test:headed
  ```
- **Run in Playwright UI Mode (interactive debugger)**:
  ```bash
  npm run test:ui
  ```
- **Run a specific test case**:
  ```bash
  npx playwright test -g "TC01"
  ```

*Note: Playwright is configured with an automated `webServer` hook in `playwright.config.js`. It will automatically spin up the static server on port 3000 if not already running and shut it down after tests finish.*

---

## 9. HTML Report Generation

Playwright generates an interactive HTML report on every test run. To view the report:

```bash
npm run show-report
# Or alternatively:
npx playwright show-report
```

This opens a local browser page displaying step-by-step traces, duration, assertions, and embedded screenshots.

---

## 10. Test Coverage

The test suite covers both critical automated paths and edge cases:

1. **TC01: Successful Checkout**
   - Multi-item cart population (`P001` + `P002`).
   - Increasing quantity for `P001` to 2.
   - Form fill with `Test Customer`.
   - Total verification: `₹5,497.00`.
   - Order placement and confirmation assertions (name, order reference `ORD-2026-XXXXXX`, amount).
   - Verifies exactly 1 confirmation exists and Place Order button is disabled.

2. **TC02: Missing Required Field**
   - Attempting checkout without customer name.
   - Verifying inline error message and `aria-invalid="true"`.
   - Verifying checkout is blocked and cart contents are preserved.
   - Filling valid name `Jane Doe` to verify error clearing and subsequent successful submission.

3. **TC03: Quantity and Exact Total**
   - Verifying single unit price (`₹1,499.00`).
   - Incrementing quantity to 2 and validating subtotal (`₹2,998.00`).
   - Adding second product (`P002`) and validating grand total (`₹5,497.00`).
   - Decrementing quantity back to 1 and validating updated grand total (`₹3,998.00`).

4. **MT01: Empty Cart Checkout Prevention**
   - Attempting to submit order with 0 items in cart.
   - Asserts inline error alert displays and no order confirmation is generated.

5. **MT02: Rapid Double-Click Concurrency Protection**
   - Rapidly fires two click events concurrently to verify the synchronous submission lock.
   - Confirms only a single order confirmation and single unique order reference are generated.

---

## 11. Manual Testing Instructions

To manually verify the edge-case scenarios:

### Manual Test 01 (MT01): Empty Cart Checkout
1. Start the server (`npm start`) and open `http://localhost:3000`.
2. Do not add any items to the cart.
3. Enter `Alice Smith` into the Customer Name field.
4. Click the **Place Order** button.
5. **Expected Outcome**: An alert displays *"Your cart is empty. Please add at least one product before placing an order."*, and no order confirmation is created.

### Manual Test 02 (MT02): Rapid Double-Click
1. Refresh `http://localhost:3000`.
2. Add Wireless Headphones and Smart Watch to the cart.
3. Enter `Speedy Submitter` into the Customer Name field.
4. Rapidly double-click the **Place Order** button in quick succession (< 100ms).
5. **Expected Outcome**: Only one order confirmation appears on screen with a single `ORD-2026-XXXXXX` reference, and the button becomes disabled.

---

## 12. Known Limitations

- **Simulated Checkout**: No real financial payment processing or bank authentication is performed; the transaction confirmation is simulated on the client side.
- **Client-Side State**: State is held in memory for the single-page application session and resets on page reload (by design for isolated test execution).
- **Synthetic Catalogue**: Catalog is fixed to the two required products (`P001` and `P002`) without external product API fetching.

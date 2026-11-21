# Mini Checkout and Browser Test Suite

A polished, minimal, responsive single-page ecommerce checkout application built with Vanilla HTML5, CSS3, and JavaScript, paired with an automated browser test suite powered by **Playwright Test**.

---

## 1. Project Overview

The **Mini Checkout** project demonstrates production-grade full-stack testing and development practices for a client-side checkout experience. The application provides fixed-price product browsing, dynamic cart state management with integer paise calculations (preventing floating-point currency errors), robust form validation, duplicate submission protection via a synchronous lock, and simulated order confirmation.

The accompanying test suite validates end-to-end functionality, financial calculations, concurrency guards, and edge cases with Playwright.

---

## 2. Features

- **Product Catalogue**: Centrally defined synthetic products with immutable pricing:
  - `P001`: Wireless Headphones — ₹1,499.00 (`149900` paise)
  - `P002`: Smart Watch — ₹2,499.00 (`249900` paise)
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
- **Automation Engine**: Playwright (`@playwright/test` v1.65.1).
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
│   ├── mt02-rapid-click-protection.png
│   ├── manual-mt01-empty-cart.png
│   └── manual-mt02-rapid-double-click.png
│
└── README.md               # Setup and documentation
```

---

## 5. Evaluation Metrics & Quality Standards

The project was engineered and evaluated against the following core QA & Full-Stack benchmarks:

| Evaluation Metric | Target Standard | Achieved Outcome | Verification Method |
| :--- | :--- | :--- | :--- |
| **Financial Accuracy** | Zero IEEE-754 currency calculation drift. | Exact calculation in integer paise (`149900` + `249900` = `399800` paise -> `₹3,998.00`). | Automated (`TC03`) |
| **Concurrency Protection** | Race-condition immunity under rapid clicking (< 10ms). | Synchronous submission lock immediately blocks secondary events; exactly 1 confirmation and 1 order reference generated. | Automated & Manual (`MT02`) |
| **Input Validation & Recovery** | Rejection of empty/blank strings; state preservation. | Rejects whitespace-only names, sets `aria-invalid`, retains field value, clears error on typing, allows recovery. | Automated (`TC02`) |
| **Cart Floor Integrity** | Minimum quantity boundary of 1. | Disables decrement button at quantity = 1; handler guards against negative or zero values. | Automated & Manual (`TC03`) |
| **Test Independence** | Zero state leakage between test runs. | Each test executes in an isolated browser context against a fresh DOM state; no shared cart state. | Playwright Test runner |
| **Execution Performance** | Fast, deterministic test execution. | All 5 automated browser tests pass in **~5.9 seconds** with zero flakiness. | Automated runner logs |

---

## 6. Test Plan Overview

A dedicated, comprehensive test plan is documented in [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

### Scope
- **In-Scope**: Product catalog rendering, cart mutations, quantity limits, currency formatting, form validation, error recovery, synchronous double-click protection, and order confirmation generation.
- **Out-of-Scope**: Real payment gateways, server databases, backend order queues, user authentication, and multi-user inventory.

### Risk Prioritization Matrix
- **Priority 1 (Critical)**: Total calculation errors, duplicate submissions, and invalid order checkout.
- **Priority 2 (High)**: Missing required name validation, cart state preservation on error, and quantity boundary leaks.
- **Priority 3 (Medium)**: Add/remove product behaviour and confirmation content accuracy.
- **Priority 4 (Low)**: Visual styling, responsive layout shifts, and focus ring accessibility.

---

## 7. Test Results Summary

Complete execution logs, browser version metadata, and pass rates are recorded in [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md).

- **Execution Date**: 2026-11-21
- **Platform**: Windows 11 Pro (Node.js v22.22.2, Playwright v1.65.1)
- **Target Browser**: Chromium (Chrome for Testing 159.0.8154.6 / v1255)
- **Total Tests Executed**: 5
- **Passed**: 5 (100%)
- **Failed**: 0 (0%)
- **Defects Discovered**: 0 (See [`docs/DEFECT_REPORT.md`](docs/DEFECT_REPORT.md))

### Automated Specifications Matrix

| Test ID | Scenario | Priority | Execution Time | Result |
| :--- | :--- | :---: | :---: | :---: |
| **TC01** | Successful Checkout (Multi-product, Qty 2, Total ₹5,497.00, Confirmation & Unique Ref) | P1 | 1.2s | **PASSED** |
| **TC02** | Missing Required Field (Name Validation, Cart Preservation & Resubmission Recovery) | P2 | 588ms | **PASSED** |
| **TC03** | Quantity and Exact Total (₹1,499.00 -> ₹2,998.00 -> ₹5,497.00 -> ₹3,998.00) | P1 | 583ms | **PASSED** |
| **MT01-Auto** | Automated Verification: Empty Cart Checkout Prevention | P1 | 458ms | **PASSED** |
| **MT02-Auto** | Automated Verification: Rapid Double-Click Concurrency Protection | P1 | 533ms | **PASSED** |

---

## 8. Visual Test Evidence & Screenshots

All screenshots were generated during actual headless and headed Chromium test runs and are stored in the [`screenshots/`](screenshots/) directory:

| Screenshot File | Associated Scenario | Proven Behaviour / State Captured |
| :--- | :--- | :--- |
| `tc01-successful-checkout.png` | **TC01: Successful Checkout** | Order confirmation card showing customer name `Test Customer`, unique reference (`ORD-2026-XXXXXX`), verified total `₹5,497.00`, and disabled Place Order button. |
| `tc02-missing-field-validation.png` | **TC02: Validation Failure** | Inline validation error message ("Customer name is required"), input field in error state (`aria-invalid="true"`), and intact cart contents. |
| `tc02-recovery-successful.png` | **TC02: Recovery Resubmission** | Successful checkout after correcting customer name to `Jane Doe`; validation error cleared, order placed successfully. |
| `tc03-exact-totals.png` | **TC03: Exact Financial Math** | Multi-item cart with adjusted quantities validating exact line subtotal `₹1,499.00` and grand total `₹3,998.00`. |
| `mt01-empty-cart-blocked.png` | **MT01: Empty Cart Blocked (Automated)** | Alert error banner *"Your cart is empty. Please add at least one product before placing an order."*; no order confirmation displayed. |
| `mt02-rapid-click-protection.png` | **MT02: Concurrency Lock (Automated)** | Synchronous protection lock preventing double-order; exactly one confirmation displayed with single reference code. |
| `manual-mt01-empty-cart.png` | **MT01: Empty Cart Blocked (Manual)** | Live browser manual run verification showing error alert when submitting an empty cart. |
| `manual-mt02-rapid-double-click.png` | **MT02: Rapid Double-Click (Manual)** | Live browser manual run verification dispatching rapid clicks (< 10ms), demonstrating single confirmation `ORD-2026-AL7WN7`. |

---

## 9. Prerequisites & Installation

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (Tested on Node v22.22.2).
- **npm**: Version 9.0.0 or higher.
- Operating System: Windows, macOS, or Linux.

### Installation
Clone the repository and install dependencies:

```bash
cd mini-checkout
npm install
npx playwright install chromium
```

---

## 10. Application Startup Instructions

To start the application locally for manual interaction:

```bash
npm start
```

The application will start on:
```text
http://localhost:3000/
```
Open this URL in any modern web browser. To terminate the server, press `Ctrl + C`.

---

## 11. Browser Test Execution

Run the complete automated Playwright test suite:

```bash
npm test
```
*(or `npx playwright test`)*

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
- **Run manual verification script**:
  ```bash
  npm run test:manual
  ```

*Note: Playwright is configured with an automated `webServer` hook in `playwright.config.js`. It will automatically spin up the static server on port 3000 if not already running and shut it down after tests finish.*

---

## 12. Interactive HTML Report

Playwright generates an interactive HTML report on every test run. To view the report:

```bash
npm run show-report
# Or alternatively:
npx playwright show-report
```

This opens a local browser page displaying step-by-step traces, duration, assertions, and embedded screenshots.

---

## 13. Manual Testing Verification

To manually verify the edge-case scenarios in a live browser:

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

## 14. Known Limitations

- **Simulated Checkout**: No real financial payment processing or bank authentication is performed; transaction confirmation is simulated on the client side.
- **Client-Side State**: State is held in memory for the single-page application session and resets on page reload (by design for isolated test execution).
- **Synthetic Catalogue**: Catalog is fixed to the two required products (`P001` and `P002`) without external product API fetching.

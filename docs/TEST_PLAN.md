# Test Plan: Mini Checkout and Browser Test Suite

## 1. Executive Summary

This document specifies the software test plan for the **Mini Checkout** single-page application. The purpose of this plan is to establish the test strategy, scope, risk prioritization, test criteria, and detailed test cases to ensure the accuracy of financial calculations, resilience against duplicate submissions, integrity of cart state, and user-facing validation.

---

## 2. Scope of Testing

### 2.1 In-Scope
The test suite covers end-to-end user checkout flows, UI reactivity, validation mechanisms, and state calculation:
- **Product Catalogue**: Display of fixed-price synthetic items (`P001` Wireless Headphones, `P002` Smart Watch).
- **Cart Management**: Adding products, removing products, increasing and decreasing quantity, and boundary limits (preventing negative or zero quantities).
- **Pricing & Currency Calculations**: Line item subtotals, order total calculations in integer paise, and INR currency formatting (`₹X,XXX.00`).
- **Form Validation & State Retention**: Required customer name field validation, whitespace trimming, field error association (`aria-describedby`, `aria-invalid`), and form state preservation on rejection.
- **Order Placement & Concurrency Protection**: Synchronous submission lock, prevention of duplicate orders on rapid double-clicks, button disablement post-success, generation of unique order references (`ORD-2026-XXXXXX`), and simulated order confirmation display.

### 2.2 Out-of-Scope
- Real payment gateway integration (Stripe, Razorpay, etc.).
- Server-side backend order processing and webhooks.
- Multi-user inventory management and warehouse synchronization.
- Customer authentication, user accounts, and session cookies.
- Persistent databases (e.g., PostgreSQL, MongoDB).
- External third-party microservices.

---

## 3. Risk Analysis & Prioritization

Testing efforts are prioritized based on business impact and financial risk:

| Priority | Level | Description | Key Focus Areas |
| :--- | :--- | :--- | :--- |
| **P1** | **Critical** | Financial discrepancies, accidental double-charging, invalid submission. | - Incorrect order totals or line subtotals.<br>- Duplicate order submission via rapid clicks.<br>- Submission of invalid or unverified orders. |
| **P2** | **High** | Core user journey blockers, data integrity failures. | - Missing required fields (blank / whitespace-only names).<br>- Cart state preservation upon validation failure.<br>- Quantity calculation errors and negative boundaries. |
| **P3** | **Medium** | Usability and state consistency. | - Add/remove product behaviour.<br>- Minimum quantity floor enforcement.<br>- Accuracy of rendered confirmation details (name, total, reference). |
| **P4** | **Low** | Aesthetic and device presentation. | - Responsive desktop vs. mobile layouts.<br>- Basic accessibility attributes and focus rings.<br>- Visual consistency across typography and buttons. |

---

## 4. Test Environment & Tools

- **Application Platform**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Local Static Server**: Node.js HTTP server (`http://localhost:3000`).
- **Test Automation Framework**: Playwright Test (`@playwright/test`).
- **Test Runner & Reporter**: Playwright Test Runner with List & HTML reporters.
- **Assertion Engine**: Playwright `expect` Web-First API with auto-waiting.
- **Target Browser**: Chromium (Headless & Headed modes).
- **Operating System**: Windows 11.

---

## 5. Test Case Specifications & Execution Matrix

| Test ID | Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Successful Checkout with Multiple Items | Application running at `http://localhost:3000`, clean browser context. | 1. Open checkout page.<br>2. Add Wireless Headphones.<br>3. Add Smart Watch.<br>4. Increase Wireless Headphones qty to 2.<br>5. Enter customer name: `Test Customer`.<br>6. Verify displayed total is `₹5,497.00`.<br>7. Click "Place Order". | - Checkout succeeds.<br>- Order confirmation card is visible.<br>- Exactly 1 confirmation exists.<br>- Customer name displays `Test Customer`.<br>- Order reference matches `ORD-2026-XXXXXX`.<br>- Final order total is `₹5,497.00`.<br>- "Place Order" button is disabled. | As expected. Confirmation card displayed with ref matching `ORD-2026-[A-Z0-9]{6}`, customer `Test Customer`, total `₹5,497.00`. Button disabled. Exactly 1 confirmation. | **PASSED** |
| **TC02** | Missing Required Field Validation & Error Recovery | Fresh checkout page, empty customer name field. | 1. Open fresh checkout page.<br>2. Add Wireless Headphones.<br>3. Leave customer name empty.<br>4. Click "Place Order".<br>5. Verify validation error appears.<br>6. Verify checkout has not succeeded.<br>7. Verify cart remains intact.<br>8. Enter valid customer name `Jane Doe`.<br>9. Click "Place Order". | - Checkout blocked when name missing.<br>- Inline field error "Customer name is required" displayed.<br>- Cart contents & quantity preserved (`1x P001`, `₹1,499.00`).<br>- Confirmation NOT shown.<br>- Entering valid name clears error.<br>- Subsequent submission succeeds. | As expected. Name error was visible with `aria-invalid="true"`. Cart preserved. Inputting valid name cleared error; subsequent submission successfully confirmed order. | **PASSED** |
| **TC03** | Quantity Adjustments & Exact Total Calculation | Fresh checkout page. | 1. Open fresh checkout page.<br>2. Add Wireless Headphones.<br>3. Verify total is `₹1,499.00`.<br>4. Increase quantity to 2.<br>5. Verify line subtotal is `₹2,998.00`.<br>6. Add Smart Watch.<br>7. Verify total is `₹5,497.00`.<br>8. Decrease Wireless Headphones quantity to 1.<br>9. Verify final total is `₹3,998.00`. | - Line item subtotals update instantaneously.<br>- Order total updates dynamically.<br>- Currency formatted accurately in INR.<br>- Integer paise math avoids floating-point errors. | As expected. Subtotals and grand totals dynamically calculated with exact INR currency formatting (`₹1,499.00` -> `₹2,998.00` -> `₹5,497.00` -> `₹3,998.00`). | **PASSED** |
| **MT01** | Empty Cart Checkout Prevention | Browser opened at `http://localhost:3000`, cart empty. | 1. Start with an empty cart.<br>2. Enter customer name: `Alice Smith`.<br>3. Click "Place Order".<br>4. Inspect page and DOM state. | - Checkout is blocked.<br>- Clear empty-cart validation message appears ("Your cart is empty...").<br>- No order reference generated.<br>- No order confirmation shown.<br>- Place order button remains enabled. | As expected. Cart alert displayed: "Your cart is empty. Please add at least one product before placing an order." Confirmation not shown. Button remains active. | **PASSED** |
| **MT02** | Rapid Double-Click Concurrency Protection | Fresh checkout session, products added to cart. | 1. Add both products to cart.<br>2. Enter customer name: `Speedy Submitter`.<br>3. Rapidly double-click "Place Order" within < 100ms.<br>4. Inspect order confirmation card and generated references. | - Synchronous submission lock immediately engages on first click.<br>- Exactly one order processed.<br>- Exactly one order reference generated.<br>- Exactly one confirmation card rendered.<br>- Place order button disabled. | As expected. Synchronous submission lock caught concurrent click. Exactly 1 confirmation rendered (`ORD-2026-AL7WN7`). Button disabled. | **PASSED** |

---

## 6. Exit & Acceptance Criteria

1. 100% of P1 and P2 test cases pass without failure.
2. Automated Playwright test suite passes in Chromium.
3. Zero calculation or currency formatting anomalies detected.
4. Duplicate submission lock prevents multiple order references under rapid clicking.
5. All actual test outcomes are documented with timestamped test execution and screenshot evidence.

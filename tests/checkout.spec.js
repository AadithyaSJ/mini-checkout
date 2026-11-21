// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Mini Checkout Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to fresh instance before each test
    await page.goto('/');
    await expect(page.getByTestId('product-list')).toBeVisible();
  });

  test('TC01: Successful Checkout', async ({ page }) => {
    // 1. Open the checkout page (handled by beforeEach)

    // 2. Add Wireless Headphones
    const addHeadphonesBtn = page.getByTestId('add-to-cart-P001');
    await expect(addHeadphonesBtn).toBeVisible();
    await addHeadphonesBtn.click();
    await expect(page.getByTestId('cart-item-P001')).toBeVisible();

    // 3. Add Smart Watch
    const addWatchBtn = page.getByTestId('add-to-cart-P002');
    await expect(addWatchBtn).toBeVisible();
    await addWatchBtn.click();
    await expect(page.getByTestId('cart-item-P002')).toBeVisible();

    // 4. Increase Wireless Headphones quantity to 2
    const increaseHeadphonesBtn = page.getByTestId('increase-qty-P001');
    await increaseHeadphonesBtn.click();
    await expect(page.getByTestId('quantity-P001')).toHaveText('2');
    await expect(page.getByTestId('subtotal-P001')).toHaveText('₹2,998.00');

    // 5. Enter customer name: Test Customer
    const nameInput = page.getByTestId('customer-name-input');
    await nameInput.fill('Test Customer');
    await expect(nameInput).toHaveValue('Test Customer');

    // 6. Verify the displayed order total is ₹5,497.00
    const orderTotal = page.getByTestId('order-total');
    await expect(orderTotal).toHaveText('₹5,497.00');

    // 7. Click Place Order
    const placeOrderBtn = page.getByTestId('place-order-button');
    await placeOrderBtn.click();

    // 8. Assert that the success confirmation is visible
    const confirmation = page.getByTestId('order-confirmation');
    await expect(confirmation).toBeVisible();

    // 9. Assert that the customer's name appears correctly
    const confirmedCustomerName = page.getByTestId('confirmed-customer-name');
    await expect(confirmedCustomerName).toHaveText('Test Customer');

    // 10. Assert that an order reference is displayed
    const confirmedReference = page.getByTestId('confirmed-order-reference');
    await expect(confirmedReference).toBeVisible();
    await expect(confirmedReference).toHaveText(/^ORD-2026-[A-Z0-9]{6}$/);

    // 11. Assert that the order amount is correct
    const confirmedTotal = page.getByTestId('confirmed-order-total');
    await expect(confirmedTotal).toHaveText('₹5,497.00');

    // 12. Assert that only one confirmation exists
    await expect(confirmation).toHaveCount(1);

    // Place Order button should also be disabled now
    await expect(placeOrderBtn).toBeDisabled();

    // Capture visual artifact for reporting
    await page.screenshot({ path: 'screenshots/tc01-successful-checkout.png', fullPage: true });
  });

  test('TC02: Missing Required Field', async ({ page }) => {
    // 1. Open a fresh checkout page (handled by beforeEach)

    // 2. Add Wireless Headphones
    await page.getByTestId('add-to-cart-P001').click();
    await expect(page.getByTestId('cart-item-P001')).toBeVisible();

    // 3. Leave the customer name empty
    const nameInput = page.getByTestId('customer-name-input');
    await expect(nameInput).toHaveValue('');

    // 4. Click Place Order
    const placeOrderBtn = page.getByTestId('place-order-button');
    await placeOrderBtn.click();

    // 5. Verify the validation message appears
    const nameError = page.getByTestId('name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Customer name is required');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');

    // 6. Verify the checkout has not succeeded
    const confirmation = page.getByTestId('order-confirmation');
    await expect(confirmation).not.toBeVisible();

    // 7. Verify the cart remains unchanged
    await expect(page.getByTestId('cart-item-P001')).toBeVisible();
    await expect(page.getByTestId('quantity-P001')).toHaveText('1');
    await expect(page.getByTestId('order-total')).toHaveText('₹1,499.00');

    // Capture visual artifact of validation error
    await page.screenshot({ path: 'screenshots/tc02-missing-field-validation.png', fullPage: true });

    // 8. Enter a valid customer name
    await nameInput.fill('Jane Doe');
    // Verify error cleared on input
    await expect(nameError).not.toBeVisible();

    // 9. Verify the user can successfully submit afterward
    await placeOrderBtn.click();
    await expect(confirmation).toBeVisible();
    await expect(page.getByTestId('confirmed-customer-name')).toHaveText('Jane Doe');
    await expect(page.getByTestId('confirmed-order-total')).toHaveText('₹1,499.00');

    // Capture visual artifact of recovery after validation
    await page.screenshot({ path: 'screenshots/tc02-recovery-successful.png', fullPage: true });
  });

  test('TC03: Quantity and Exact Total', async ({ page }) => {
    // 1. Open a fresh checkout page (handled by beforeEach)

    // 2. Add Wireless Headphones
    await page.getByTestId('add-to-cart-P001').click();
    await expect(page.getByTestId('cart-item-P001')).toBeVisible();

    // 3. Verify the initial total is ₹1,499.00
    const orderTotal = page.getByTestId('order-total');
    await expect(orderTotal).toHaveText('₹1,499.00');

    // 4. Increase quantity to 2
    await page.getByTestId('increase-qty-P001').click();
    await expect(page.getByTestId('quantity-P001')).toHaveText('2');

    // 5. Verify the line subtotal is ₹2,998.00
    await expect(page.getByTestId('subtotal-P001')).toHaveText('₹2,998.00');
    await expect(orderTotal).toHaveText('₹2,998.00');

    // 6. Add Smart Watch
    await page.getByTestId('add-to-cart-P002').click();
    await expect(page.getByTestId('cart-item-P002')).toBeVisible();

    // 7. Verify the order total is ₹5,497.00
    await expect(orderTotal).toHaveText('₹5,497.00');

    // 8. Decrease Wireless Headphones quantity to 1
    await page.getByTestId('decrease-qty-P001').click();
    await expect(page.getByTestId('quantity-P001')).toHaveText('1');
    await expect(page.getByTestId('subtotal-P001')).toHaveText('₹1,499.00');

    // 9. Verify the final order total is ₹3,998.00
    await expect(orderTotal).toHaveText('₹3,998.00');

    // Capture visual artifact of exact subtotal & total calculations
    await page.screenshot({ path: 'screenshots/tc03-exact-totals.png', fullPage: true });
  });

  test('Automated MT01: Empty Cart Checkout Prevention', async ({ page }) => {
    // 1. Start with an empty cart
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('₹0.00');

    // 2. Enter a valid customer name
    const nameInput = page.getByTestId('customer-name-input');
    await nameInput.fill('Alice Smith');

    // 3. Click Place Order
    const placeOrderBtn = page.getByTestId('place-order-button');
    await placeOrderBtn.click();

    // Assert checkout is blocked
    const cartError = page.getByTestId('cart-error');
    await expect(cartError).toBeVisible();
    await expect(cartError).toContainText('Your cart is empty');

    // No order reference generated, no confirmation shown
    await expect(page.getByTestId('order-confirmation')).not.toBeVisible();
    await expect(placeOrderBtn).toBeEnabled();

    // Capture visual artifact
    await page.screenshot({ path: 'screenshots/mt01-empty-cart-blocked.png', fullPage: true });
  });

  test('Automated MT02: Rapid Double-Click Protection', async ({ page }) => {
    // 1. Add both products
    await page.getByTestId('add-to-cart-P001').click();
    await page.getByTestId('add-to-cart-P002').click();

    // 2. Enter customer name
    const nameInput = page.getByTestId('customer-name-input');
    await nameInput.fill('Speedy Submitter');

    // 3. Rapidly double click Place Order
    const placeOrderBtn = page.getByTestId('place-order-button');
    await Promise.all([
      placeOrderBtn.click(),
      placeOrderBtn.click()
    ]);

    // 4. Assert exactly one confirmation exists
    const confirmation = page.getByTestId('order-confirmation');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCount(1);

    // 5. Assert only one order reference is generated
    const refCode = await page.getByTestId('confirmed-order-reference').textContent();
    expect(refCode).toMatch(/^ORD-2026-[A-Z0-9]{6}$/);

    // Place Order button is disabled
    await expect(placeOrderBtn).toBeDisabled();

    // Capture visual artifact
    await page.screenshot({ path: 'screenshots/mt02-rapid-click-protection.png', fullPage: true });
  });

});

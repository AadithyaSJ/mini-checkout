/**
 * Mini Checkout Application
 * Vanilla JavaScript Single-Page Checkout Engine
 */

(function () {
  'use strict';

  // ==========================================================================
  // Central Product Catalogue
  // Fixed pricing stored in integer paise to avoid floating-point math errors.
  // ==========================================================================
  const PRODUCTS = Object.freeze([
    {
      id: 'P001',
      name: 'Wireless Headphones',
      pricePaise: 149900, // ₹1,499.00
      description: 'High-fidelity audio with active noise cancellation.'
    },
    {
      id: 'P002',
      name: 'Smart Watch',
      pricePaise: 249900, // ₹2,499.00
      description: 'Fitness tracking, notifications, and vibrant AMOLED display.'
    }
  ]);

  // Quick lookup map by Product ID
  const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

  // ==========================================================================
  // Application State
  // ==========================================================================
  /**
   * Cart State: Array of { productId: string, quantity: number }
   */
  let cartState = [];

  // Synchronous submission lock & order placement state
  let isSubmitting = false;
  let isOrderPlaced = false;

  // ==========================================================================
  // DOM Element Selectors
  // ==========================================================================
  const productListEl = document.getElementById('product-list');
  const cartItemsContainerEl = document.getElementById('cart-items-container');
  const emptyCartMessageEl = document.getElementById('empty-cart-message');
  const cartCountBadgeEl = document.getElementById('cart-count-badge');
  const headerItemCountEl = document.getElementById('header-item-count');

  const checkoutFormEl = document.getElementById('checkout-form');
  const customerNameInputEl = document.getElementById('customer-name');
  const nameErrorEl = document.getElementById('name-error');
  const cartErrorEl = document.getElementById('cart-error');
  const summarySubtotalEl = document.getElementById('summary-subtotal');
  const orderTotalEl = document.getElementById('order-total');
  const placeOrderBtnEl = document.getElementById('place-order-btn');

  const orderConfirmationSectionEl = document.getElementById('order-confirmation');
  const confirmedOrderRefEl = document.getElementById('confirmed-order-reference');
  const confirmedCustomerNameEl = document.getElementById('confirmed-customer-name');
  const confirmedOrderTotalEl = document.getElementById('confirmed-order-total');

  // ==========================================================================
  // Currency Formatting Utilities
  // ==========================================================================
  /**
   * Formats an amount given in integer paise into standard INR currency string.
   * e.g., 149900 -> "₹1,499.00"
   * @param {number} paise
   * @returns {string}
   */
  function formatINR(paise) {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(rupees);
  }

  // ==========================================================================
  // Calculations
  // ==========================================================================
  /**
   * Computes the total order value in integer paise directly from cart state.
   * @returns {number}
   */
  function calculateTotalPaise() {
    return cartState.reduce((acc, item) => {
      const product = PRODUCT_MAP.get(item.productId);
      if (!product) return acc;
      return acc + product.pricePaise * item.quantity;
    }, 0);
  }

  /**
   * Computes total item count in cart.
   * @returns {number}
   */
  function calculateTotalItemsCount() {
    return cartState.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ==========================================================================
  // Renderers
  // ==========================================================================
  /**
   * Render the product catalog into the DOM.
   */
  function renderCatalogue() {
    productListEl.innerHTML = '';

    PRODUCTS.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.setAttribute('data-testid', `product-card-${product.id}`);

      card.innerHTML = `
        <div class="product-header">
          <div class="product-meta-row">
            <span class="product-id-tag">${escapeHTML(product.id)}</span>
          </div>
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <p class="product-desc">${escapeHTML(product.description)}</p>
        </div>
        <div class="product-footer">
          <span class="product-price" data-testid="product-price-${product.id}">${formatINR(product.pricePaise)}</span>
          <button
            type="button"
            class="btn-primary btn-sm"
            data-testid="add-to-cart-${product.id}"
            aria-label="Add ${escapeHTML(product.name)} to cart"
            data-product-id="${product.id}"
          >
            Add to Cart
          </button>
        </div>
      `;

      const addBtn = card.querySelector(`[data-testid="add-to-cart-${product.id}"]`);
      addBtn.addEventListener('click', () => {
        if (isOrderPlaced) return;
        addToCart(product.id);
      });

      productListEl.appendChild(card);
    });
  }

  /**
   * Render the active cart items.
   */
  function renderCart() {
    cartItemsContainerEl.innerHTML = '';
    const totalItems = calculateTotalItemsCount();

    // Update count badges
    const itemsText = totalItems === 1 ? '1 item' : `${totalItems} items`;
    cartCountBadgeEl.textContent = itemsText;
    headerItemCountEl.textContent = itemsText;

    if (cartState.length === 0) {
      emptyCartMessageEl.style.display = 'flex';
      cartItemsContainerEl.style.display = 'none';
      return;
    }

    emptyCartMessageEl.style.display = 'none';
    cartItemsContainerEl.style.display = 'flex';

    cartState.forEach((item) => {
      const product = PRODUCT_MAP.get(item.productId);
      if (!product) return;

      const lineTotalPaise = product.pricePaise * item.quantity;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.setAttribute('data-testid', `cart-item-${product.id}`);

      itemRow.innerHTML = `
        <div class="cart-item-details">
          <span class="cart-item-name">${escapeHTML(product.name)}</span>
          <span class="cart-item-unit-price" data-testid="unit-price-${product.id}">${formatINR(product.pricePaise)} each</span>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control-wrapper">
            <button
              type="button"
              class="qty-btn"
              data-testid="decrease-qty-${product.id}"
              aria-label="Decrease quantity of ${escapeHTML(product.name)}"
              ${item.quantity <= 1 || isOrderPlaced ? 'disabled' : ''}
            >−</button>
            <span
              class="qty-display"
              data-testid="quantity-${product.id}"
              aria-label="Quantity: ${item.quantity}"
            >${item.quantity}</span>
            <button
              type="button"
              class="qty-btn"
              data-testid="increase-qty-${product.id}"
              aria-label="Increase quantity of ${escapeHTML(product.name)}"
              ${isOrderPlaced ? 'disabled' : ''}
            >+</button>
          </div>
        </div>
        <div class="cart-item-subtotal-actions">
          <span class="cart-item-subtotal" data-testid="subtotal-${product.id}">${formatINR(lineTotalPaise)}</span>
          <button
            type="button"
            class="btn-remove-item"
            data-testid="remove-${product.id}"
            aria-label="Remove ${escapeHTML(product.name)} from cart"
            ${isOrderPlaced ? 'disabled' : ''}
          >Remove</button>
        </div>
      `;

      // Event Listeners
      const decreaseBtn = itemRow.querySelector(`[data-testid="decrease-qty-${product.id}"]`);
      const increaseBtn = itemRow.querySelector(`[data-testid="increase-qty-${product.id}"]`);
      const removeBtn = itemRow.querySelector(`[data-testid="remove-${product.id}"]`);

      decreaseBtn.addEventListener('click', () => {
        if (isOrderPlaced) return;
        decreaseQuantity(product.id);
      });

      increaseBtn.addEventListener('click', () => {
        if (isOrderPlaced) return;
        increaseQuantity(product.id);
      });

      removeBtn.addEventListener('click', () => {
        if (isOrderPlaced) return;
        removeFromCart(product.id);
      });

      cartItemsContainerEl.appendChild(itemRow);
    });
  }

  /**
   * Update the order summary section.
   */
  function updateOrderSummary() {
    const totalPaise = calculateTotalPaise();
    const formattedTotal = formatINR(totalPaise);

    summarySubtotalEl.textContent = formattedTotal;
    orderTotalEl.textContent = formattedTotal;
  }

  // ==========================================================================
  // Cart Actions
  // ==========================================================================
  function addToCart(productId) {
    clearCartError();

    const existingIndex = cartState.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      cartState[existingIndex].quantity += 1;
    } else {
      cartState.push({ productId, quantity: 1 });
    }

    renderCart();
    updateOrderSummary();
  }

  function removeFromCart(productId) {
    cartState = cartState.filter((item) => item.productId !== productId);
    renderCart();
    updateOrderSummary();
  }

  function increaseQuantity(productId) {
    const item = cartState.find((i) => i.productId === productId);
    if (!item) return;

    item.quantity += 1;
    renderCart();
    updateOrderSummary();
  }

  function decreaseQuantity(productId) {
    const item = cartState.find((i) => i.productId === productId);
    if (!item) return;

    // Prevent quantity from becoming zero or negative
    if (item.quantity > 1) {
      item.quantity -= 1;
      renderCart();
      updateOrderSummary();
    }
  }

  function disableCartInteractions() {
    // Disable all add buttons in catalogue
    const addBtns = productListEl.querySelectorAll('button');
    addBtns.forEach((btn) => {
      btn.disabled = true;
    });

    // Re-render cart to disable qty and remove buttons
    renderCart();
  }

  // ==========================================================================
  // Validation & Error Handling
  // ==========================================================================
  function showNameError(message) {
    nameErrorEl.textContent = message;
    nameErrorEl.style.display = 'block';
    customerNameInputEl.classList.add('input-has-error');
    customerNameInputEl.setAttribute('aria-invalid', 'true');
  }

  function clearNameError() {
    nameErrorEl.textContent = '';
    nameErrorEl.style.display = 'none';
    customerNameInputEl.classList.remove('input-has-error');
    customerNameInputEl.removeAttribute('aria-invalid');
  }

  function showCartError(message) {
    cartErrorEl.textContent = message;
    cartErrorEl.style.display = 'block';
  }

  function clearCartError() {
    cartErrorEl.textContent = '';
    cartErrorEl.style.display = 'none';
  }

  // ==========================================================================
  // Checkout & Submission Protection
  // ==========================================================================
  function handlePlaceOrder(event) {
    if (event) {
      event.preventDefault();
    }

    // Synchronous submission lock check:
    // If an operation is already in progress or an order was previously finalized, reject immediately.
    if (isSubmitting || isOrderPlaced) {
      return;
    }

    // Set synchronous lock immediately
    isSubmitting = true;

    try {
      // 1. Validate Cart (must have at least one product)
      if (cartState.length === 0) {
        showCartError('Your cart is empty. Please add at least one product before placing an order.');
        // Do not permanently lock checkout on validation error
        isSubmitting = false;
        return;
      }
      clearCartError();

      // 2. Validate Customer Name
      // Trim whitespace before validating
      const rawName = customerNameInputEl.value;
      const trimmedName = rawName.trim();

      if (!trimmedName) {
        showNameError('Customer name is required. Please enter a valid name.');
        // Preserve entered value (it may be whitespace or user's partial text)
        customerNameInputEl.focus();
        // Do not permanently lock checkout on validation error
        isSubmitting = false;
        return;
      }
      clearNameError();

      // 3. Mark order as permanently placed
      isOrderPlaced = true;

      // 4. Generate unique order reference (Format: ORD-2026-XXXXXX)
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderReference = `ORD-2026-${randomHex}`;

      // 5. Final order amount
      const finalTotalPaise = calculateTotalPaise();
      const formattedTotal = formatINR(finalTotalPaise);

      // 6. Disable checkout controls to prevent any further interaction
      placeOrderBtnEl.disabled = true;
      placeOrderBtnEl.classList.add('disabled');
      customerNameInputEl.disabled = true;
      disableCartInteractions();

      // 7. Display Confirmation
      displayOrderConfirmation(trimmedName, orderReference, formattedTotal);
    } catch (err) {
      console.error('Order processing error:', err);
      // Release lock on unexpected runtime error
      isSubmitting = false;
    }
  }

  function displayOrderConfirmation(customerName, orderReference, orderTotal) {
    confirmedCustomerNameEl.textContent = customerName;
    confirmedOrderRefEl.textContent = orderReference;
    confirmedOrderTotalEl.textContent = orderTotal;

    orderConfirmationSectionEl.style.display = 'block';

    // Scroll confirmation into view smoothly
    orderConfirmationSectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Event Bindings & Initialization
  // ==========================================================================
  function init() {
    renderCatalogue();
    renderCart();
    updateOrderSummary();

    // Listen for customer name input changes to clear/update errors live
    customerNameInputEl.addEventListener('input', () => {
      if (customerNameInputEl.value.trim().length > 0) {
        clearNameError();
      }
    });

    // Form submission
    checkoutFormEl.addEventListener('submit', handlePlaceOrder);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

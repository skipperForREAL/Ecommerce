// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const subtotalElement = document.getElementById('subtotal');
  const checkoutButton = document.getElementById('checkout-button');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. <a href="/">Continue shopping</a></p>';
    subtotalElement.textContent = '0.00';
    document.getElementById('tax').textContent = '0.00';
    document.getElementById('total').textContent = '0.00';
    
    // Disable checkout button when cart is empty
    checkoutButton.disabled = true;
    checkoutButton.style.opacity = '0.6';
    checkoutButton.style.cursor = 'not-allowed';
    checkoutButton.textContent = 'Cart is empty';
    
    return;
  }
  
  // Enable checkout button when cart has items
  checkoutButton.disabled = false;
  checkoutButton.style.opacity = '1';
  checkoutButton.style.cursor = 'pointer';
  checkoutButton.textContent = 'Proceed to Checkout';
  
  cartItemsContainer.innerHTML = '';
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="item-info">
        <h3>${item.name}</h3>
        <p>${item.price.toFixed(2)}</p>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
      </div>
      <div class="item-total">
        <p>${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    `;
    
    cartItemsContainer.appendChild(itemElement);
    subtotal += item.price * item.quantity;
  });
  
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;
  
  subtotalElement.textContent = `${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `${total.toFixed(2)}`;
  
  // Add event listeners to buttons
  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', handleQuantityChange);
  });
  
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', handleRemoveItem);
  });
  
  checkoutButton.addEventListener('click', proceedToCheckout);
}

function handleQuantityChange(e) {
  const id = e.target.dataset.id;
  const action = e.target.dataset.action;
  const item = cart.find(item => item.id === id);
  
  if (action === 'increase') {
    item.quantity += 1;
  } else if (action === 'decrease' && item.quantity > 1) {
    item.quantity -= 1;
  }
  
  saveCart();
  renderCart();
}

function handleRemoveItem(e) {
  const id = e.target.dataset.id;
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function proceedToCheckout() {
  // Double check cart isn't empty (just in case)
  if (cart.length === 0) {
    alert('Your cart is empty. Please add items before checking out.');
    return;
  }
  
  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

// Initialize the cart display
renderCart();
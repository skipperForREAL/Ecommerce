// Load Stripe and cart
const stripe = Stripe('');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render order summary
function renderOrderSummary() {
  const orderItemsContainer = document.getElementById('order-items');
  let subtotal = 0;
  
  if (cart.length === 0) {
    orderItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  
  orderItemsContainer.innerHTML = '';
  
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'order-item';
    itemElement.innerHTML = `
      <p>${item.name} x ${item.quantity}</p>
      <p>${(item.price * item.quantity).toFixed(2)}</p>
    `;
    orderItemsContainer.appendChild(itemElement);
    subtotal += item.price * item.quantity;
  });
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  document.getElementById('checkout-subtotal').textContent = `${subtotal.toFixed(2)}`;
  document.getElementById('checkout-tax').textContent = `${tax.toFixed(2)}`;
  document.getElementById('checkout-total').textContent = `${total.toFixed(2)}`;
  
  return total;
}

// Initialize Stripe Elements
function initializeStripe(total) {
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');
  
  const form = document.getElementById('submit-payment');
  
  form.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    
    if (error) {
      document.getElementById('card-errors').textContent = error.message;
      return;
    }
    
    // Call your backend to create a PaymentIntent
    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
        }),
      });
      
      const { clientSecret } = await response.json();
      
      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );
      
      if (confirmError) {
        document.getElementById('card-errors').textContent = confirmError.message;
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        alert('Payment successful!');
        localStorage.removeItem('cart');
        window.location.href = 'thank-you.html';
      }
    } catch (err) {
      console.error('Error:', err);
      document.getElementById('card-errors').textContent = 'An error occurred during payment.';
    }
  });
}

// Initialize the page
const total = renderOrderSummary();
initializeStripe(total);

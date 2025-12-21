
 document.addEventListener('DOMContentLoaded', async () => {

  // 1. Load Google user
  try {
    const userResponse = await fetch('https://moso-interior-site.onrender.com/current-user', {
      credentials: 'include'
    });
    
    if (userResponse.ok) {
      window.user = await userResponse.json();
      console.log(user);    
      // localStorage.setItem('userEmail', user.email); // אם רוצים לשמור  
      document.getElementById('welcome-msg').innerText = `Welcome back, ${user.fullname}` 
    
    } else {
      
      window.location.href = '../index.html';
      return;
    }
}
    catch (err) {
    console.error("Error fetching current user:", err);
    window.location.href = '../index.html';
    return;
  }

  // 2. Load orders
  await loadOrders();
 })

async function loadOrders() {
const container = document.getElementById('orders-container');
const noOrdersMsg = document.getElementById('no-orders-msg');
 
const userEmail = user.email

let orders = [];

try {
  // Fetch orders (cookies will be sent automatically because of credentials: 'include')
  const response = await fetch('https://moso-interior-site.onrender.com/order/user-orders', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    // <-- important! sends cookies with request
  });

  console.log();
  
  if (response.ok) {
    orders = await response.json();
  } 
  else if (response.status === 404) {
    orders = [];
  } 
  else if (response.status === 401) {
    // User not logged in or cookie expired
    noOrdersMsg.textContent = 'Session expired. Please log in again.';
    noOrdersMsg.style.display = 'block';
    container.innerHTML = '';
   
  } 
  else {
    throw new Error('Failed to fetch orders');
  }
} catch (err) {
  console.error('Fetch error:', err);
  orders = [];
}



if (!orders || orders.length === 0) {
  noOrdersMsg.textContent = 'No orders found for your account.';
  noOrdersMsg.style.display = 'block';
  container.innerHTML = '';

} else {
  noOrdersMsg.style.display = 'none';
}

orders.forEach((order, idx) => {
  const orderDiv = document.createElement('div');
  orderDiv.style.border = '1px solid #ccc';
  orderDiv.style.padding = '10px';
  orderDiv.style.marginBottom = '15px';
  orderDiv.style.borderRadius = '5px';
  orderDiv.style.background = '#f9f9f9';

  orderDiv.innerHTML = `
    <h4>Order #${idx + 1} - ID: ${order._id}</h4>
    <p>Status: ${order.status}</p>
    <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
    <p>Final Price: $${order.finalPrice}</p>
    <h4>Products:</h4>
    <ul>
      ${
        order.products && order.products.length > 0
          ? order.products
              .map(
                item => `
          <li>
            ${item.productId?.name || 'Unknown'} -
            $${item.productId?.price || 'N/A'} × ${item.quantity}
          </li>`
              )
              .join('\n')
          : '<li>No products in this order</li>'
      }
    </ul>
  `;

  container.appendChild(orderDiv);
});

 }








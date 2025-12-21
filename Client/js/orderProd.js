
let products = []; 
const productsPerPage = 4;
let currentPage = 1;
let totalPages = 0;


const cartItems = {};
let totalPrice = 0;
let amount = 0;

// get products list from server
async function getProducts() {
  try {
    const response = await fetch('https://moso-interior-site.onrender.com/product', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Network response was not ok');

    products = await response.json();
    console.log('All products:', products);

    renderProducts(currentPage);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// display products in page
function renderProducts(page) {
  totalPages = Math.ceil(products.length / productsPerPage);
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = products.slice(start, end);

  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = '';

  pageProducts.forEach(product => {
    const priceNumber = typeof product.price === 'string' 
      ? parseFloat(product.price.replace(/[^0-9.]/g,'')) 
      : product.price || 0;

    const isChecked = cartItems[product._id] ? 'checked-cart' : '';

    const col = document.createElement('div');
    col.className = 'col-lg-6 col-12';
    col.innerHTML = `
      <div class="shop-thumb">
        <div class="shop-image-wrap">
          <a href="shop-detail.html">
            <img src="../${product.imageUrl}" class="shop-image img-fluid" alt="${product.name}">
          </a>
          <div class="shop-icons-wrap">
            <div class="shop-icons d-flex flex-column align-items-center">
              <a href="#" class="shop-icon bi-heart" data-bs-toggle="button" aria-pressed="false"></a>
              <a href="#" 
                 class="add-to-cart-icon bi bi-cart-plus ${isChecked}" 
                 data-product-id="${product._id}" 
                 data-product-price="${priceNumber}" 
                 style="cursor: pointer;">
              </a>
            </div>
            <p class="shop-pricing mb-0 mt-3">
              <span class="badge custom-badge">${product.price}</span>
            </p>
          </div>
          <div class="shop-btn-wrap">
            <a href="shop-detail.html" class="shop-btn custom-btn btn d-flex align-items-center">Learn more</a>
          </div>
        </div>
        <div class="shop-body">
          <h4>${product.name}</h4>
        </div>
      </div>`;
    productsContainer.appendChild(col);
  });

 
  document.querySelectorAll('.add-to-cart-icon').forEach(icon => {
    icon.addEventListener('click', toggleCart);
  });

  updatePagination(page);
  updateCartSummary();
  updateSelectedProductIds();
}

// toggle cart 
function toggleCart(event) {
  event.preventDefault();
  const icon = event.currentTarget;
  const productId = icon.dataset.productId;

  if (cartItems[productId]) {
    delete cartItems[productId];
    icon.classList.remove('checked-cart');
  } else {
    cartItems[productId] = true;
    icon.classList.add('checked-cart');
  }

  updateCartSummary();
  updateSelectedProductIds();
}

// ---  update sum and amounts  ---
function updateCartSummary() {
  let sum = 0;
  let count = 0;
  for (let id in cartItems) {
    const product = products.find(p => p._id === id);
    if (product) {
      count++;
      const priceNumber = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/[^0-9.]/g,'')) 
        : product.price || 0;
      sum += priceNumber;
    }
  }

  document.getElementById('amount1').innerHTML = count;
  document.getElementById('price').innerHTML = '$' + sum.toLocaleString();
}

// --- pagination ---
function updatePagination(activePage) {
  const paginationUl = document.querySelector('.pagination');
  paginationUl.innerHTML = '';

  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${activePage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
  prevLi.onclick = (e) => {
    e.preventDefault();
    if (activePage > 1) {
      currentPage--;
      renderProducts(currentPage);
    }
  };
  paginationUl.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === activePage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.onclick = (e) => {
      e.preventDefault();
      currentPage = i;
      renderProducts(currentPage);
    };
    paginationUl.appendChild(li);
  }

  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${activePage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
  nextLi.onclick = (e) => {
    e.preventDefault();
    if (activePage < totalPages) {
      currentPage++;
      renderProducts(currentPage);
    }
  };
  paginationUl.appendChild(nextLi);
}

// --  list of products in cart ---
function updateSelectedProductIds() {
  const ul = document.getElementById('selected-product-ids');
  ul.innerHTML = '';
  Object.keys(cartItems).forEach(productId => {
    const product = products.find(p => p._id === productId);
    const li = document.createElement('li');
    li.textContent = product ? `${productId} - ${product.name}` : productId;
    ul.appendChild(li);
  });
}

// ---  order products ---
document.getElementById('orderBtn').addEventListener('click', async function(e) {
  e.preventDefault();

  const selectedProducts = Object.keys(cartItems)
    .map(productId => products.find(p => p._id === productId))
    .filter(Boolean);

  try {
    for (const item of selectedProducts) {
      let res = await fetch('https://moso-interior-site.onrender.com/cart/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
          productId: item._id,
          quantity: 1
        })
      });

      if (!res.ok) throw new Error('Failed to add item to cart');
    }

    
    for (let id in cartItems) delete cartItems[id];
    window.location.href = 'shopping-cart.html';
  } catch (err) {
    alert('Server error: ' + err.message);
  }
});

// ---  first load ---
document.addEventListener('DOMContentLoaded', function() {
  renderProducts(currentPage);
  document.getElementById('amount1').innerHTML = 0;
  document.getElementById('price').innerHTML = '$0';
  updateSelectedProductIds();
});

getProducts();
















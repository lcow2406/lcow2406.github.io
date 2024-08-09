let cart = [];
const taxRate = 0.04; // 4% tax rate

// Scroll to Cart section
function scrollToCart() {
    document.getElementById('shopping-cart').scrollIntoView({ behavior: 'smooth' });
}

// Fetch and display Home content
fetch('home.json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('homeContent').innerHTML = data.content;
    })
    .catch(error => console.error('Error fetching home content:', error));

// Fetch and display About content
fetch('about.json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('aboutContent').innerHTML = data.content;
    })
    .catch(error => console.error('Error fetching about content:', error));

// Fetch and display Products
fetch('products.json')
    .then(response => response.json())
    .then(products => {
        const productsContainer = document.getElementById('products');
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <h3>${product.name}</h3>
                    <p>Price: $${(product.price * (1 + taxRate)).toFixed(2)}</p>
                </div>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productsContainer.appendChild(productItem);
        });
    })
    .catch(error => console.error('Error fetching products:', error));

// Add item to cart
function addToCart(productId) {
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            const taxIncludedPrice = product.price * (1 + taxRate);
            const existingProduct = cart.find(item => item.id === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
                existingProduct.price = taxIncludedPrice; // Update price with tax
            } else {
                cart.push({ ...product, quantity: 1, price: taxIncludedPrice });
            }
            updateCart();
        })
        .catch(error => console.error('Error adding product to cart:', error));
}

// Update the cart display
function updateCart() {
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p>Price per item (with tax): $${item.price.toFixed(2)}</p>
                <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="decreaseQuantity(${item.id})">-</button>
                <button onclick="increaseQuantity(${item.id})">+</button>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    updateTotalQuantity();
}

// Increase item quantity
function increaseQuantity(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += 1;
        updateCart();
    }
}

// Decrease item quantity
function decreaseQuantity(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            removeFromCart(productId);
        }
    }
    updateCart();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update the total quantity in the cart icon
function updateTotalQuantity() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.totalQuantity').textContent = totalQuantity;
}

// Place Order and generate invoice
function placeOrder() {
    let totalAmount = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
    });

    const invoiceContent = `
    Thanks for shopping at Aliya's Central Vacuum Store!
    
    Order Summary:
    -----------------------------------
    ${cart.map(item => `${item.name} - Quantity: ${item.quantity}, Price (with tax): $${item.price.toFixed(2)}, Total: $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
    -----------------------------------
    Total Amount (with 4% tax): $${totalAmount.toFixed(2)}
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.txt';
    a.click();
    window.URL.revokeObjectURL(url);

    alert('Order placed successfully!');
    cart = [];
    updateCart();
}

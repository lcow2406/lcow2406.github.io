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
                    <p>Price: $${product.price.toFixed(2)}</p>
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
            const existingProduct = cart.find(item => item.id === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ 
                    ...product, 
                    quantity: 1, 
                    tax: product.price * taxRate, 
                    totalWithTax: product.price * (1 + taxRate) 
                });
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
                <p>Price per item: $${item.price.toFixed(2)}</p>
                <p>Tax per item: $${item.tax.toFixed(2)}</p>
                <p>Total with tax: $${item.totalWithTax.toFixed(2)}</p>
                <p>Total for ${item.quantity} items: $${(item.totalWithTax * item.quantity).toFixed(2)}</p>
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
    if (cart.length === 0) {
        alert("No products found in the cart to place an order.");
        return;
    }

    let totalAmount = 0;
    let totalItems = 0;
    let totalTax = 0;

    cart.forEach(item => {
        const itemTotal = item.totalWithTax * item.quantity;
        totalAmount += itemTotal;
        totalItems += item.quantity;
        totalTax += item.tax * item.quantity;
    });

    const summaryMessage = `
        Order placed successfully!\n
        Total Products: ${totalItems}\n
        Total Tax: $${totalTax.toFixed(2)}\n
        Total Amount (with 4% tax): $${totalAmount.toFixed(2)}
    `;

    alert(summaryMessage);

    // Clear cart after order is placed
    cart = [];
    updateCart();
}

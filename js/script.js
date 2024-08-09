document.addEventListener('DOMContentLoaded', function() {
    const sections = {
        home: 'json/home.json',
        products: 'products.json'
    };

    // Function to fetch and display content for sections
    function fetchAndDisplayContent(sectionId, fileName) {
        fetch(fileName)
            .then(response => response.json())
            .then(data => {
                const section = document.getElementById(sectionId);
                section.innerHTML = `
                    <h2>${data.title}</h2>
                    <p>${data.content}</p>
                `;
                section.classList.remove('hidden');
            })
            .catch(error => console.error('Error fetching content:', error));
    }

    // Function to show the selected section and hide others
    function showSection(id) {
        document.querySelectorAll('main section').forEach(section => {
            section.style.display = (section.id === id) ? 'block' : 'none';
        });
    }

    // Event listener for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', event => {
            event.preventDefault();
            const targetId = anchor.getAttribute('data-target');
            if (sections[targetId]) {
                fetchAndDisplayContent(targetId, sections[targetId]);
            }
            showSection(targetId);
        });
    });

    // Initially show the home section
    fetchAndDisplayContent('home', sections.home);

    // Function to fetch and display products
    async function fetchProducts() {
        try {
            const response = await fetch(sections.products);
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();
            displayProducts(products);
            updateCart();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Function to display products in the products section
    function displayProducts(products) {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" width="100" height="100">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button data-id="${product.id}">Add to Cart</button>
            `;
            productsContainer.appendChild(productElement);
        });

        // Attach event listeners to "Add to Cart" buttons
        document.querySelectorAll('#products-container button').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }

    // Function to display a popup notification
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 2000);
    }

    // Function to add a product to the cart
    function addToCart(productId) {
        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(p => p.id === productId);
        if (product) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProduct = cart.find(item => item.id === productId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            showPopup(`${product.name} added to cart`);
        }
    }

    // Function to update the cart display
    function updateCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartContainer = document.getElementById('cart-container');
        const totalPriceElement = document.getElementById('total-price');
        cartContainer.innerHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            const tax = item.price * 0.12; // 12% tax calculation
            const itemTotal = (item.price + tax) * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                <p>Tax: $${tax.toFixed(2)} (12%)</p>
                <p>Total: $${itemTotal.toFixed(2)}</p>
                <button data-id="${item.id}" class="decrease-quantity">-</button>
                <button data-id="${item.id}" class="remove-from-cart">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
            totalPrice += itemTotal;
        });

        totalPriceElement.textContent = `Total: $${totalPrice.toFixed(2)}`;

        // Add "Place Order" button if cart is not empty
        if (cart.length > 0) {
            const placeOrderButton = document.createElement('button');
            placeOrderButton.textContent = 'Place Order';
            placeOrderButton.className = 'place-order-button';
            cartContainer.appendChild(placeOrderButton);

            placeOrderButton.addEventListener('click', function() {
                placeOrder(cart);
            });
        }

        // Attach event listeners to decrease quantity and remove buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                changeQuantity(productId, -1);
            });
        });

        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }

    // Function to change the quantity of a product in the cart
    function changeQuantity(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
            cart[productIndex].quantity += change;
            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            const item = cart[productIndex];
            showPopup(`${item ? item.name : 'Product'} quantity updated. Remaining: ${item ? item.quantity : 0}`);
        }
    }

    // Function to remove a product from the cart
    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = cart.find(item => item.id === productId);
        if (product) {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            showPopup(`${product.name} removed from cart`);
        }
    }

    // Function to place the order and generate invoice
    function placeOrder(cart) {
        if (cart.length === 0) {
            showPopup('Your cart is empty.');
            return;
        }

        const invoice = generateInvoice(cart);

        // Display invoice in an alert
        alert(invoice);

        // Clear the cart
        localStorage.removeItem('cart');
        updateCart();
    }

    // Fetch products when the page is loaded
    fetchProducts();
});

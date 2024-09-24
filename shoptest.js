// Function to update cart count in the navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    
    // Update the cart count in the navbar across all pages
    const cartLink = document.querySelector('.nav-link[href="cart.html"]');
    if (cartLink) {
        cartLink.textContent = `Cart (${cartCount})`;
    }
}

// Function to add item to the cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Get product details
        const product = {
            name: document.querySelector('#modalProductName').value,
            price: parseFloat(document.querySelector('#modalProductPrice').value),
            qty: 1  // Default quantity is set to 1
        };

        // Get existing cart from localStorage or create a new one
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check if product is already in the cart
        const existingProduct = cart.find(item => item.name === product.name);
        if (existingProduct) {
            existingProduct.qty += 1;  // Increment quantity if already in cart
        } else {
            cart.push(product);  // Add new product to cart
        }

        // Update cart in localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update Cart Count
        updateCartCount();

        // Show confirmation message
        showConfirmationMessage(`${product.name} added to the cart.`);
    });
});

// Function to display the cart items on the Cart page
function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTableBody = document.querySelector('.shopping-cart tbody');
    
    // Clear the current cart table
    cartTableBody.innerHTML = '';

    // Add cart items to the table
    cart.forEach(item => {
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${(item.price * item.qty).toFixed(2)}</td>
                <td><button class="remove-item btn btn-danger rad-med" data-name="${item.name}">Remove</button></td>
            </tr>
        `;
        cartTableBody.insertAdjacentHTML('beforeend', row);
    });

    // Update the subtotal
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);
    document.getElementById('stotal').textContent = `$${subtotal}`;
}

// Remove item from cart
document.querySelector('.shopping-cart').addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-item')) {
        const productName = e.target.getAttribute('data-name');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Remove product from cart
        cart = cart.filter(item => item.name !== productName);

        // Update localStorage and re-display cart items
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();  // Update the navbar count when an item is removed
    }
});

// Empty the cart
function emptyCart() {
    document.getElementById('empty-cart').addEventListener('click', function (e) {
        e.preventDefault();
        // Confirmation dialog
        if (confirm("Are you sure you want to empty the cart?")) {
            // Remove cart data from localStorage
            localStorage.removeItem('cart');
            // Re-display the empty cart
            displayCartItems();
            updateCartCount();  // Update the navbar count when the cart is emptied
        }
    });
}

// Show confirmation message
function showConfirmationMessage(message) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'message rad-med';
    confirmationDiv.innerText = message;
    document.body.appendChild(confirmationDiv);
    
    // Remove the message after 2 seconds
    setTimeout(() => {
        confirmationDiv.remove();
    }, 2000);
}

// Event listeners to ensure correct functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();  // Call this on all pages to update cart count
    if (document.querySelector('.shopping-cart')) {
        displayCartItems();  // Only call this on the cart page
    }
    emptyCart(); // Initialize the empty cart button
});

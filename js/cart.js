// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.init();
    }

    init() {
        this.updateCartIcon();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.shoe-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.col, .col-');
                this.addToCart(productCard);
            });
        });

        // Cart icon click
        document.querySelector('.fa-cart-shopping').addEventListener('click', () => {
            this.toggleCart();
        });
    }

    addToCart(productCard) {
        const product = {
            id: Date.now(),
            name: productCard.querySelector('.heading-three').textContent,
            price: parseFloat(productCard.querySelector('.shoe-price').textContent.replace('$', '')),
            image: productCard.querySelector('img').src,
            quantity: 1
        };

        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }

        this.saveCart();
        this.updateCartIcon();
        this.showNotification('Product added to cart!');
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartIcon();
        this.updateCartDisplay();
        this.showNotification('Product removed from cart!');
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartIcon();
        this.updateCartDisplay();
        this.showNotification('Cart cleared!');
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.saveCart();
            this.updateCartIcon();
            this.updateCartDisplay();
        }
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartIcon() {
        const cartCount = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartIcon = document.querySelector('.fa-cart-shopping');
        if (cartCount > 0) {
            cartIcon.setAttribute('data-count', cartCount);
        } else {
            cartIcon.removeAttribute('data-count');
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    toggleCart() {
        let cartContainer = document.querySelector('.cart-container');
        
        if (!cartContainer) {
            cartContainer = this.createCartContainer();
        }

        cartContainer.classList.toggle('active');
        this.updateCartDisplay();
    }

    createCartContainer() {
        const cartContainer = document.createElement('div');
        cartContainer.className = 'cart-container';
        cartContainer.innerHTML = `
            <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button class="close-cart">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">Total: $<span>0</span></div>
                <button class="clear-cart-btn">Clear Cart</button>
                <button class="checkout-btn">Checkout</button>
            </div>
        `;

        document.body.appendChild(cartContainer);

        // Close cart button
        cartContainer.querySelector('.close-cart').addEventListener('click', () => {
            cartContainer.classList.remove('active');
        });

        // Clear cart button
        cartContainer.querySelector('.clear-cart-btn').addEventListener('click', () => {
            this.clearCart();
        });

        // Checkout button
        cartContainer.querySelector('.checkout-btn').addEventListener('click', () => {
            if (this.items.length > 0) {
                alert('Thank you for your purchase!');
                this.clearCart();
                cartContainer.classList.remove('active');
            }
        });

        return cartContainer;
    }

    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total span');
        
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="remove-item">&times;</button>
            </div>
        `).join('');

        // Add event listeners for quantity controls and remove buttons
        cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const isPlus = e.target.classList.contains('plus');
                const item = this.items.find(item => item.id === itemId);
                
                if (item) {
                    this.updateQuantity(itemId, item.quantity + (isPlus ? 1 : -1));
                }
            });
        });

        cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.removeFromCart(itemId);
            });
        });

        cartTotal.textContent = this.calculateTotal().toFixed(2);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
}); 
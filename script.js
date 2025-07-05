const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const address = document.getElementById("address");
const addressNumber = document.getElementById("address-number");
const addressComplement = document.getElementById("address-complement");
const addressWarn = document.getElementById("address-warn");
const cartModal = document.getElementById("cart-modal");
const cartTotal = document.getElementById("cart-total");
const cartItemsContainer = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const dateSpan = document.getElementById("date-span");
const paymentOptions = document.getElementsByName("payment-option");
const alertElement = document.getElementById("alert");
const closedAlert = document.getElementById("closed-alert");

let cart = [];

const openingTime = 8;
const closingTime = 23;

function isWithinOperatingHours() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= openingTime && hours < closingTime;
}

function updateDateSpanColor() {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= openingTime && hours < closingTime) {
        dateSpan.classList.remove("bg-red-600", "hover:bg-red-500");
        dateSpan.classList.add("bg-green-600", "hover:bg-green-500");
    } else {
        dateSpan.classList.remove("bg-green-600", "hover:bg-green-500");
        dateSpan.classList.add("bg-red-600", "hover:bg-red-500");
    }
}

updateDateSpanColor();
setInterval(updateDateSpanColor, 60000);

cartBtn.addEventListener("click", function () {
    if (isWithinOperatingHours()) {
        cartModal.classList.remove("hidden");
        cartModal.classList.add("flex");
    } else {
        closedAlert.classList.remove("hidden");
        setTimeout(() => closedAlert.classList.add("hidden"), 3000);
    }
});

cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
        cartModal.classList.remove("flex");
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.classList.add("hidden");
    cartModal.classList.remove("flex");
});

menu.addEventListener("click", function (event) {
    const parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price").replace(',', '.'));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    if (isWithinOperatingHours()) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCart();

        alertElement.textContent = `${name} adicionado ao carrinho! 😊`;
        alertElement.classList.remove("hidden");
        setTimeout(() => alertElement.classList.add("hidden"), 3000);
    } else {
        closedAlert.classList.remove("hidden");
        setTimeout(() => closedAlert.classList.add("hidden"), 3000);
    }
}

function removeFromCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center p-2 bg-white rounded-md shadow-md';
        cartItem.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
            <button class="remove-from-cart-btn bg-red-500 text-white px-2 py-1 rounded" data-index="${index}">Remover</button>
        `;
        cartItemsContainer.appendChild(cartItem);

        cartItem.querySelector('.remove-from-cart-btn').addEventListener('click', () => {
            removeFromCart(item.name);
        });
    });

    cartItemsContainer.style.maxHeight = '300px';
    cartItemsContainer.style.overflowY = 'auto';

    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    cartCounter.textContent = cart.length;
}

checkoutBtn.addEventListener("click", function () {
    const clientName = document.getElementById("client-name").value.trim();
    const nameWarn = document.getElementById("name-warn");
    const street = address.value.trim();
    const number = addressNumber.value.trim();
    const complement = addressComplement.value.trim();
    const paymentWarn = document.getElementById("payment-warn");

    // Verifica se o nome está preenchido
    if (!clientName) {
        nameWarn.classList.remove("hidden");
        return;
    } else {
        nameWarn.classList.add("hidden");
    }

    if (!street || !number) {
        addressWarn.classList.remove("hidden");
        return;
    }
    addressWarn.classList.add("hidden");

    let selectedPaymentOption = '';
    paymentOptions.forEach(option => {
        if (option.checked) {
            selectedPaymentOption = option.value;
        }
    });

    if (selectedPaymentOption === '') {
        paymentWarn.classList.remove("hidden");
        return;
    }
    paymentWarn.classList.add("hidden");

    const message = `Olá, me chamo *${clientName}* e gostaria de fazer o seguinte pedido:\n${cart.map(item =>
        `(x${item.quantity}) ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}`).join('\n')}`;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const encodedMessage = encodeURIComponent(`${message}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`);

    const fullAddress = `${street}, Nº ${number}${complement ? ' - ' + complement : ''}`;
    const encodedAddress = encodeURIComponent(`Endereço de Entrega: ${fullAddress}`);
    const encodedPayment = encodeURIComponent(`Forma de Pagamento: ${selectedPaymentOption}`);
    const encodedGPS = encodeURIComponent(`\n\n📍 Por favor, envie sua localização atual clicando no clipe ➤ e em "Localização".`);

    const whatsappURL = `https://wa.me/94992119890?text=${encodedMessage}%0A%0A${encodedAddress}%0A${encodedPayment}%0A${encodedGPS}`;

    window.open(whatsappURL, '_blank');
});


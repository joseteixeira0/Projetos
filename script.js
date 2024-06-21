const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const addressWarn = document.getElementById("address-warn");
const address = document.getElementById("address");
const cartModal = document.getElementById("cart-modal");
const cartTotal = document.getElementById("cart-total");
const cartItemsContainer = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const dateSpan = document.getElementById("date-span");
const paymentOptions = document.getElementsByName("payment-option");
const alertElement = document.getElementById('alert');
const closedAlert = document.getElementById('closed-alert');

let cart = [];

const openingTime = 15; // 15:00
const closingTime = 23; // 23:00

// Função para verificar se está dentro do horário de funcionamento
function isWithinOperatingHours() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= openingTime && hours < closingTime;
}

// Função para atualizar cor do date-span com base no horário
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

// Inicializar cor do date-span ao carregar a página
updateDateSpanColor();

// Atualizar a cor a cada 1 minuto (opcional)
setInterval(updateDateSpanColor, 60000); // Atualiza a cada minuto (60000 milissegundos)

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
    if (isWithinOperatingHours()) {
        cartModal.classList.remove("hidden");
        cartModal.classList.add("flex");
    } else {
        closedAlert.classList.remove('hidden');
        setTimeout(function () {
            closedAlert.classList.add('hidden');
        }, 3000); // Oculta o alerta após 3 segundos (ajuste conforme necessário)
    }
});

// Fechar modal quando clicar fora
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
        cartModal.classList.remove("flex");
    }
});

// Botão fechar
closeModalBtn.addEventListener("click", function () {
    cartModal.classList.add("hidden");
    cartModal.classList.remove("flex");
});

// Menu
menu.addEventListener("click", function (event) {
    const parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

// Função para adicionar ao carrinho
function addToCart(name, price) {
    if (isWithinOperatingHours()) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name,
                price,
                quantity: 1,
            });
        }
        updateCart(); // Atualizar o carrinho após adicionar o item

        // Exibe o alerta de pedido adicionado
        alertElement.textContent = `${name} adicionado ao carrinho! 😊`;
        alertElement.classList.remove('hidden');
        setTimeout(function () {
            alertElement.classList.add('hidden');
        }, 3000); // Oculta o alerta após 3 segundos (ajuste conforme necessário)
    } else {
        closedAlert.classList.remove('hidden');
        setTimeout(function () {
            closedAlert.classList.add('hidden');
        }, 3000); // Oculta o alerta após 3 segundos (ajuste conforme necessário)
    }
}

// Função para remover do carrinho
function removeFromCart(name) {
    const existingItemIndex = cart.findIndex(item => item.name === name);
    if (existingItemIndex !== -1) {
        const existingItem = cart[existingItemIndex];
        if (existingItem.quantity > 1) {
            existingItem.quantity--;
        } else {
            cart.splice(existingItemIndex, 1);
        }
        updateCart();
    }
}

// Função para atualizar o carrinho
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

        // Adiciona evento de clique para remover o item
        const removeButton = cartItem.querySelector('.remove-from-cart-btn');
        removeButton.addEventListener('click', function () {
            removeFromCart(item.name); // Passa o nome do item para a função
        });
    });

    // Ajusta a altura máxima do container dos itens do carrinho
    cartItemsContainer.style.maxHeight = '300px'; // Ajuste conforme necessário
    cartItemsContainer.style.overflowY = 'auto';  // Habilita a barra de rolagem vertical

    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    cartCounter.textContent = cart.length;
}

// Função para finalizar o pedido
checkoutBtn.addEventListener("click", function () {
    const addressValue = address.value.trim();
    if (!addressValue) {
        addressWarn.classList.remove("hidden");
        return;
    }
    addressWarn.classList.add("hidden");

    // Capturar a opção de pagamento selecionada
    let selectedPaymentOption = '';
    paymentOptions.forEach(option => {
        if (option.checked) {
            selectedPaymentOption = option.value;
        }
    });

    const message = `Olá, gostaria de fazer o seguinte pedido:\n${cart.map(item => `(x${item.quantity}) ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}`).join('\n')}`;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const encodedMessage = encodeURIComponent(`${message}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`);
    const encodedAddress = encodeURIComponent(`Endereço de Entrega: ${addressValue}`);
    const encodedPaymentOption = encodeURIComponent(`Forma de Pagamento: ${selectedPaymentOption}`);
    const whatsappURL = `https://wa.me/94992119890?text=${encodedMessage}%0A%0A${encodedAddress}%0A${encodedPaymentOption}`;

    window.open(whatsappURL, '_blank');
});

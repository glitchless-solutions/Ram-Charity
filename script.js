document.getElementById("year").textContent = new Date().getFullYear();

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggleBtn = document.getElementById('menu-toggle');
    const icon = toggleBtn.querySelector('.material-symbols-outlined');

    menu.classList.toggle('open');

    if (menu.classList.contains('open')) {
        icon.textContent = 'close';
    } else {
        icon.textContent = 'menu';
    }
}

document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('donationModal');
    // modal.classList.remove('animate-fade-in');
    // modal.classList.add('animate-fade-out');
    modal.classList.add('hidden');
});

function onPaymentMethodChange(value) {
    const creditCardSection = document.getElementById('creditCardSection');
    const chequeSection = document.getElementById('chequeSection');
    const creditInputs = creditCardSection.querySelectorAll("input");

    if (value === 'credit') {
        creditCardSection.classList.remove('hidden');
        chequeSection.classList.add('hidden');
        creditInputs.forEach(input => {
            input.disabled = false;
        });
    } else {
        creditCardSection.classList.add('hidden');
        chequeSection.classList.remove('hidden');
        creditInputs.forEach(input => {
            input.value = "";
            input.disabled = true;
        });
    }
}

document.getElementById("donationForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Stop page reload

    const form = e.target;
    const formData = new FormData(form);

    // Convert form data to a normal object
    const data = Object.fromEntries(formData.entries());

    // Get selected payment method
    const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value;

    // If credit card selected, manually collect card fields
    // if (paymentMethod === "credit") {
    //     data.cardNumber = document.getElementById("cardNumber").value;
    //     data.expiry = document.getElementById("expiry").value;
    //     data.cvv = document.getElementById("cvv").value;
    //     data.zip = document.getElementById("zip").value;
    // }

    console.log("Form Data:", data, form, formData);
});
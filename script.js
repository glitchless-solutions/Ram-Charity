const { response } = require("express");

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
            input.required = true;
        });
    } else {
        creditCardSection.classList.add('hidden');
        chequeSection.classList.remove('hidden');
        creditInputs.forEach(input => {
            input.value = "";
            input.disabled = true;
            input.required = false;
        });
    }
}

document.getElementById("donationForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Stop page reload

    const form = e.target;
    const formData = new FormData(form);

    // Convert form data to a normal object
    const data = Object.fromEntries(formData.entries());

    fetch('http://localhost:3000/donate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        if(result.success) {
                console.log("Form Data:", data, form, formData);

    const modal = document.getElementById('donationModal');
    modal.classList.add('hidden');

    document.getElementById('successModal').classList.remove('hidden');
    form.reset();
        } else {
            showErrorPopup("Database Error:" +result.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showErrorPopup("Could not connect to server. Check if Node.js is running.");
    });


});

function showErrorPopup(msg) {
    document.getElementById('errorMessage').innerText = msg;
    document.getElementById('errorModal').classList.remove('hidden');
}
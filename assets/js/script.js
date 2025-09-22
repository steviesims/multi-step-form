class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.isYearly = false;
        this.selectedPlan = null;
        this.selectedAddons = [];
        this.formData = {
            name: '',
            email: '',
            phone: '',
            plan: null,
            addons: [],
            isYearly: false
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Navigation buttons
        document.querySelector('.next-step').addEventListener('click', () => this.nextStep());
        document.querySelector('.go-back').addEventListener('click', () => this.prevStep());
        document.querySelector('.confirm').addEventListener('click', () => this.confirm());

        // Step 1: Form validation
        const formInputs = document.querySelectorAll('#name, #email, #phone');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // Step 2: Plan selection
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => this.selectPlan(card));
        });

        // Billing toggle
        document.getElementById('billing-toggle').addEventListener('change', (e) => {
            this.toggleBilling(e.target.checked);
        });

        // Step 3: Add-on selection
        document.querySelectorAll('.addon-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleAddon(e.target));
        });

        // Step 4: Change plan link
        document.querySelector('.change-plan').addEventListener('click', () => {
            this.goToStep(2);
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateUI();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    goToStep(step) {
        this.currentStep = step;
        this.updateUI();
    }

    confirm() {
        if (this.validateCurrentStep()) {
            this.currentStep = 5;
            this.updateUI();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return true; // Add-ons are optional
            case 4:
                return true; // Summary step
            default:
                return true;
        }
    }

    validateStep1() {
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        let isValid = true;

        if (!name.value.trim()) {
            this.showError(name);
            isValid = false;
        }

        if (!email.value.trim()) {
            this.showError(email);
            isValid = false;
        } else if (!this.isValidEmail(email.value)) {
            this.showError(email, 'Please enter a valid email address');
            isValid = false;
        }

        if (!phone.value.trim()) {
            this.showError(phone);
            isValid = false;
        }

        if (isValid) {
            this.formData.name = name.value;
            this.formData.email = email.value;
            this.formData.phone = phone.value;
        }

        return isValid;
    }

    validateStep2() {
        if (!this.selectedPlan) {
            alert('Please select a plan');
            return false;
        }
        return true;
    }

    validateField(field) {
        if (!field.value.trim()) {
            this.showError(field);
            return false;
        } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
            this.showError(field, 'Please enter a valid email address');
            return false;
        }
        this.clearError(field);
        return true;
    }

    showError(field, message = 'This field is required') {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        formGroup.classList.add('invalid');
        errorMessage.textContent = message;
    }

    clearError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('invalid');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    selectPlan(planCard) {
        // Remove previous selection
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new plan
        planCard.classList.add('selected');
        this.selectedPlan = {
            name: planCard.dataset.plan,
            price: parseInt(planCard.dataset.price)
        };
        this.formData.plan = this.selectedPlan;
    }

    toggleBilling(isYearly) {
        this.isYearly = isYearly;
        this.formData.isYearly = isYearly;

        // Update billing options visual state
        document.querySelectorAll('.billing-option').forEach(option => {
            option.classList.remove('active');
        });

        if (isYearly) {
            document.querySelector('.billing-option:last-child').classList.add('active');
        } else {
            document.querySelector('.billing-option:first-child').classList.add('active');
        }

        // Update plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            const priceElement = card.querySelector('.plan-price');
            const basePrice = parseInt(card.dataset.price);

            if (isYearly) {
                card.classList.add('yearly');
                priceElement.textContent = `$${basePrice * 10}/yr`;
            } else {
                card.classList.remove('yearly');
                priceElement.textContent = `$${basePrice}/mo`;
            }
        });

        // Update addon prices
        document.querySelectorAll('.addon-price').forEach(priceElement => {
            const addonItem = priceElement.closest('.addon-item');
            const checkbox = addonItem.querySelector('input[type="checkbox"]');
            const basePrice = parseInt(checkbox.dataset.price);

            if (isYearly) {
                priceElement.textContent = `+$${basePrice * 10}/yr`;
            } else {
                priceElement.textContent = `+$${basePrice}/mo`;
            }
        });

        this.updateSummary();
    }

    toggleAddon(checkbox) {
        const addonItem = checkbox.closest('.addon-item');
        const addonData = {
            name: checkbox.value,
            price: parseInt(checkbox.dataset.price),
            title: addonItem.querySelector('.addon-title').textContent
        };

        if (checkbox.checked) {
            addonItem.classList.add('selected');
            this.selectedAddons.push(addonData);
        } else {
            addonItem.classList.remove('selected');
            this.selectedAddons = this.selectedAddons.filter(addon => addon.name !== addonData.name);
        }

        this.formData.addons = this.selectedAddons;
        this.updateSummary();
    }

    updateSummary() {
        if (this.currentStep !== 4) return;

        const planNameElement = document.querySelector('.plan-name-summary');
        const planPriceElement = document.querySelector('.plan-price-summary');
        const selectedAddonsElement = document.querySelector('.selected-addons');
        const totalPriceElement = document.querySelector('.total-price');
        const totalLabelElement = document.querySelector('.total-label');

        if (this.selectedPlan) {
            const planPrice = this.isYearly ? this.selectedPlan.price * 10 : this.selectedPlan.price;
            const planName = this.selectedPlan.name.charAt(0).toUpperCase() + this.selectedPlan.name.slice(1);
            const period = this.isYearly ? 'Yearly' : 'Monthly';
            const periodShort = this.isYearly ? 'yr' : 'mo';

            planNameElement.textContent = `${planName} (${period})`;
            planPriceElement.textContent = `$${planPrice}/${periodShort}`;
        }

        // Update addons
        selectedAddonsElement.innerHTML = '';
        let total = this.selectedPlan ? (this.isYearly ? this.selectedPlan.price * 10 : this.selectedPlan.price) : 0;

        this.selectedAddons.forEach(addon => {
            const addonPrice = this.isYearly ? addon.price * 10 : addon.price;
            const periodShort = this.isYearly ? 'yr' : 'mo';

            const addonElement = document.createElement('div');
            addonElement.className = 'addon-summary';
            addonElement.innerHTML = `
                <span class="addon-name">${addon.title}</span>
                <span class="addon-price-summary">+$${addonPrice}/${periodShort}</span>
            `;
            selectedAddonsElement.appendChild(addonElement);
            total += addonPrice;
        });

        // Update total
        const periodShort = this.isYearly ? 'yr' : 'mo';
        const periodLong = this.isYearly ? 'year' : 'month';
        totalPriceElement.textContent = `+$${total}/${periodShort}`;
        totalLabelElement.textContent = `Total (per ${periodLong})`;
    }

    updateUI() {
        // Update sidebar
        document.querySelectorAll('.sidebar-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update content
        document.querySelectorAll('.wrapper').forEach((wrapper, index) => {
            wrapper.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update form actions
        const goBackBtn = document.querySelector('.go-back');
        const nextStepBtn = document.querySelector('.next-step');
        const confirmBtn = document.querySelector('.confirm');

        // Show/hide Go Back button
        goBackBtn.style.display = this.currentStep > 1 && this.currentStep < 6 ? 'block' : 'none';

        // Show/hide Next Step button
        nextStepBtn.style.display = this.currentStep < 4 ? 'block' : 'none';

        // Show/hide Confirm button
        confirmBtn.style.display = this.currentStep === 4 ? 'block' : 'none';

        // Hide form actions on thank you page
        const formActions = document.querySelector('.form-actions');
        formActions.style.display = this.currentStep === 5 ? 'block' : 'flex';
        formActions.style.opacity = this.currentStep === 5 ? '0' : '1';

        // Update summary if on step 4
        if (this.currentStep === 4) {
            this.updateSummary();
        }
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiStepForm();
});
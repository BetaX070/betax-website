// =========================================
// BetaX Technologies - WhatsApp Integration
// Send form data to WhatsApp
// =========================================

document.addEventListener('DOMContentLoaded', function () {
    initFormValidation();
    initWhatsAppSubmission();
});

// =========================================
// FORM VALIDATION
// =========================================
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="true"]');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', function () {
                validateField(this);
            });

            // Clear error on focus
            input.addEventListener('focus', function () {
                clearFieldError(this);
            });
        });

        // Form submission validation
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                sendToWhatsApp(form);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const fieldType = field.type;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(field)} is required`;
    }

    // Email validation
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation
    else if (fieldType === 'tel' && value) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(value)) {
            errorMessage = 'Please enter a valid phone number';
        }
    }

    // Minimum length validation
    else if (field.hasAttribute('minlength')) {
        const minLength = parseInt(field.getAttribute('minlength'));
        if (value.length < minLength) {
            errorMessage = `${getFieldLabel(field)} must be at least ${minLength} characters`;
        }
    }

    if (errorMessage) {
        showFieldError(field, errorMessage);
        return false;
    } else {
        clearFieldError(field);
        return true;
    }
}

// Get field label for error messages
function getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);

    field.classList.add('error');
    field.style.borderColor = '#EF4444';

    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;

    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.appendChild(error);
    } else {
        field.parentNode.insertBefore(error, field.nextSibling);
    }
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';

    const formGroup = field.closest('.form-group');
    const error = formGroup ? formGroup.querySelector('.form-error') : field.nextElementSibling;

    if (error && error.classList.contains('form-error')) {
        error.remove();
    }
}

// =========================================
// WHATSAPP INTEGRATION
// =========================================
function initWhatsAppSubmission() {
    // WhatsApp number (without + and country code)
    window.WHATSAPP_NUMBER = '2347035459321';
}

function sendToWhatsApp(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Sending...';

    // Collect form data
    const formData = new FormData(form);
    let message = '🔔 *New Form Submission from BetaX Website*\n\n';

    // Build WhatsApp message
    for (let [key, value] of formData.entries()) {
        if (value) {
            const label = form.querySelector(`[name="${key}"]`)?.closest('.form-group')?.querySelector('label')?.textContent || key;
            const cleanLabel = label.replace('*', '').trim();
            message += `*${cleanLabel}:* ${value}\n`;
        }
    }

    // Add timestamp
    message += `\n_Submitted: ${new Date().toLocaleString()}_`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${window.WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Show success message
    setTimeout(() => {
        showFormSuccess(form, 'Opening WhatsApp...');

        // Open WhatsApp in new window
        window.open(whatsappURL, '_blank');

        // Reset form
        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }, 1500);
    }, 500);
}

// Show success message
function showFormSuccess(form, message) {
    const success = document.createElement('div');
    success.className = 'form-success-message';
    success.style.cssText = `
        padding: 1rem 1.5rem;
        background: rgba(0, 71, 171, 0.1);
        border: 2px solid #0047AB;
        border-radius: 0.5rem;
        color: #0047AB;
        font-weight: 600;
        margin-top: 1rem;
        text-align: center;
    `;
    success.textContent = message;

    form.appendChild(success);

    // Remove after 5 seconds
    setTimeout(() => {
        success.style.transition = 'opacity 0.3s';
        success.style.opacity = '0';
        setTimeout(() => success.remove(), 300);
    }, 5000);
}

// =========================================
// SPECIFIC FORM HANDLERS
// =========================================

// Pre-fill product inquiry forms
function prefillProductForm(productName) {
    const productField = document.querySelector('[name="product"]');
    const subjectField = document.querySelector('[name="subject"]');

    if (productField) {
        productField.value = productName;
    }

    if (subjectField) {
        subjectField.value = `Inquiry about ${productName}`;
    }
}

// Export for use in other files
window.BetaXForms = {
    validateField,
    prefillProductForm,
    sendToWhatsApp
};

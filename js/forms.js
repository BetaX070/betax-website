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
    // Form Validation & Submission
    // Security: Track submission state to prevent double-submit
    let formSubmitting = false;
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

    // Email validation (improved pattern)
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation (improved pattern)
    else if (fieldType === 'tel' && value) {
        const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
        const digitCount = value.replace(/\D/g, '').length;
        if (!phoneRegex.test(value) || digitCount < 7) {
            errorMessage = 'Please enter a valid phone number (minimum 7 digits)';
        }
    }

    // Minimum length validation
    else if (field.hasAttribute('minlength')) {
        const minLength = parseInt(field.getAttribute('minlength'));
        if (value.length < minLength) {
            errorMessage = `${getFieldLabel(field)} must be at least ${minLength} characters`;
        }
    }

    // Maximum length validation (security: prevent DoS)
    else if (field.hasAttribute('maxlength')) {
        const maxLength = parseInt(field.getAttribute('maxlength'));
        if (value.length > maxLength) {
            errorMessage = `${getFieldLabel(field)} must not exceed ${maxLength} characters`;
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
async function initWhatsAppSubmission() {
    // Load WhatsApp number from contact.json (single source of truth)
    try {
        const response = await fetch('/_data/contact.json');
        if (response.ok) {
            const contactData = await response.json();
            if (contactData && contactData.phone) {
                // Remove all non-numeric characters
                window.WHATSAPP_NUMBER = contactData.phone.replace(/[^0-9]/g, '');
                return;
            }
        }
    } catch (error) {
        console.warn('Could not load phone from contact.json, using fallback');
    }

    // Fallback number (update _data/contact.json to change)
    window.WHATSAPP_NUMBER = '2347035459321';
}

// WhatsApp-based form submission
function handleWhatsAppSubmit(e) {
    e.preventDefault();

    // Security: Rate limiting - prevent double-submit
    if (formSubmitting) {
        console.log('Form already submitting...');
        return;
    }

    const form = e.target;

    // Validate all fields
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
        const isFieldValid = validateField(field);
        if (!isFieldValid) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    // Security: Set submitting flag
    formSubmitting = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Sending...'; // Use innerHTML for spinner
    }

    // Collect form data and sanitize/truncate
    const formData = new FormData(form);
    let message = `🔔 *New Form Submission from BetaX Website*\n\n`; // Reverted to original message prefix

    for (let [key, value] of formData.entries()) {
        // Use original getFieldLabel for consistency
        const label = getFieldLabel(form.querySelector(`[name="${key}"]`)) || key;
        const cleanLabel = label.replace('*', '').trim(); // Clean label as before
        // Security: Truncate long inputs to prevent URL overflow
        const truncatedValue = String(value).substring(0, 200);
        message += `*${cleanLabel}:* ${truncatedValue}\n`; // Use cleanLabel
    }

    // Add timestamp
    message += `\n_Submitted: ${new Date().toLocaleString()}_`;

    // Get WhatsApp number dynamically
    // Use the globally loaded WHATSAPP_NUMBER
    let whatsappNumber = window.WHATSAPP_NUMBER || '2347035459321'; // fallback if not loaded yet

    // Open WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    // Reset form and show success
    setTimeout(() => {
        form.reset();
        // Security: Reset submitting flag
        formSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
        showFormSuccess(form, 'Opening WhatsApp...'); // Use existing showFormSuccess
    }, 1000);
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

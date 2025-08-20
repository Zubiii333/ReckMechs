// ReckMechs - Booking Page Interactive Elements
document.addEventListener('DOMContentLoaded', function () {
    console.log('Booking Page JavaScript loaded');

    // Initialize all interactive elements
    initializeFormInteractions();
    initializeProgressTracking();
    initializeClearButton();
    initializeFormValidation();
});

// Progress Tracking
function initializeProgressTracking() {
    const form = document.getElementById('appointmentForm');
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const steps = document.querySelectorAll('.step');

    if (!form || !progressFill || !progressPercentage) return;

    const formFields = form.querySelectorAll('input[required], textarea[required], select[required]');

    function updateProgress() {
        let filledFields = 0;
        let totalFields = formFields.length;

        formFields.forEach(field => {
            if (field.value.trim() !== '') {
                filledFields++;
            }
        });

        const percentage = Math.round((filledFields / totalFields) * 100);
        progressFill.style.width = percentage + '%';
        progressPercentage.textContent = percentage + '%';

        // Update step indicators
        const currentStep = Math.ceil((filledFields / totalFields) * 4);
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }

    // Listen for input changes
    formFields.forEach(field => {
        field.addEventListener('input', updateProgress);
        field.addEventListener('change', updateProgress);
    });

    // Initial progress update
    updateProgress();
}

// Clear Button Functionality
function initializeClearButton() {
    const clearBtn = document.getElementById('clearBtn');
    const form = document.getElementById('appointmentForm');

    if (clearBtn && form) {
        clearBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear all form data?')) {
                form.reset();
                clearAllErrors();
                clearMechanicAvailability();

                // Reset progress
                const progressFill = document.getElementById('progressFill');
                const progressPercentage = document.getElementById('progressPercentage');
                const steps = document.querySelectorAll('.step');

                if (progressFill) progressFill.style.width = '0%';
                if (progressPercentage) progressPercentage.textContent = '0%';

                steps.forEach(step => {
                    step.classList.remove('active', 'completed');
                });

                // Focus first field
                const firstField = form.querySelector('input, textarea, select');
                if (firstField) firstField.focus();
            }
        });
    }
}

// Form Interactions and Enhancements
function initializeFormInteractions() {
    const appointmentDate = document.getElementById('appointmentDate');
    const mechanicSelect = document.getElementById('mechanicSelect');

    // Set minimum date to tomorrow
    if (appointmentDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        appointmentDate.min = tomorrow.toISOString().split('T')[0];
    }

    // Load mechanics when date changes - Requirement 2.3: Update availability when date changes
    if (appointmentDate && mechanicSelect) {
        appointmentDate.addEventListener('change', function () {
            if (this.value) {
                // Clear current mechanic selection when date changes
                mechanicSelect.value = '';
                clearFieldError(mechanicSelect);

                // Load new availability for selected date
                loadMechanicAvailability(this.value);
            } else {
                clearMechanicAvailability();
            }
        });
    }

    // Update availability display when mechanic is selected
    if (mechanicSelect) {
        mechanicSelect.addEventListener('change', function () {
            updateSelectedMechanicHighlight();
        });
    }

    // Form input enhancements
    addFormInputEnhancements();
}

// Form Validation Functions
function initializeFormValidation() {
    const appointmentForm = document.getElementById('appointmentForm');

    if (appointmentForm) {
        console.log('Form validation initialized');

        // Add form submit event listener
        appointmentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submitted, validating...');
            if (validateForm()) {
                console.log('Form validation passed');
                submitForm();
            } else {
                console.log('Form validation failed');
            }
        });

        // Add real-time validation for each field
        const fields = [
            { id: 'clientName', validator: validateName },
            { id: 'clientPhone', validator: validatePhone },
            { id: 'clientAddress', validator: validateAddress },
            { id: 'carLicense', validator: validateCarLicense },
            { id: 'carEngine', validator: validateCarEngine },
            { id: 'appointmentDate', validator: validateDate },
            { id: 'mechanicSelect', validator: validateMechanic }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                // Validate on blur (when user leaves field)
                element.addEventListener('blur', function () {
                    field.validator(this);
                });

                // Real-time validation and error clearing on input
                element.addEventListener('input', function () {
                    clearFieldError(this);

                    // Auto-format phone number input (remove non-digits)
                    if (field.id === 'clientPhone') {
                        const digitsOnly = this.value.replace(/\D/g, '');
                        if (this.value !== digitsOnly) {
                            this.value = digitsOnly;
                        }
                    }

                    // Auto-format engine number input (remove non-digits)
                    if (field.id === 'carEngine') {
                        const digitsOnly = this.value.replace(/\D/g, '');
                        if (this.value !== digitsOnly) {
                            this.value = digitsOnly;
                        }
                    }

                    // Immediate validation for specific fields that need real-time feedback
                    if (field.id === 'clientPhone' || field.id === 'carEngine') {
                        // Debounced validation to avoid excessive validation calls
                        clearTimeout(this.validationTimeout);
                        this.validationTimeout = setTimeout(() => {
                            field.validator(this);
                        }, 300);
                    }
                });

                // Validate date immediately when changed
                if (field.id === 'appointmentDate') {
                    element.addEventListener('change', function () {
                        field.validator(this);
                    });
                }

                // Validate mechanic selection immediately when changed
                if (field.id === 'mechanicSelect') {
                    element.addEventListener('change', function () {
                        field.validator(this);
                    });
                }
            }
        });
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    let errorCount = 0;
    const errorFields = [];

    // Validate all fields
    const validators = [
        { name: 'Full Name', validator: () => validateName(document.getElementById('clientName')) },
        { name: 'Phone Number', validator: () => validatePhone(document.getElementById('clientPhone')) },
        { name: 'Address', validator: () => validateAddress(document.getElementById('clientAddress')) },
        { name: 'License Number', validator: () => validateCarLicense(document.getElementById('carLicense')) },
        { name: 'Engine Number', validator: () => validateCarEngine(document.getElementById('carEngine')) },
        { name: 'Appointment Date', validator: () => validateDate(document.getElementById('appointmentDate')) },
        { name: 'Mechanic Selection', validator: () => validateMechanic(document.getElementById('mechanicSelect')) }
    ];

    validators.forEach(validatorObj => {
        if (!validatorObj.validator()) {
            isValid = false;
            errorCount++;
            errorFields.push(validatorObj.name);
        }
    });

    // Show validation summary if there are errors
    if (!isValid) {
        const errorMessage = `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}: ${errorFields.join(', ')}`;
        showFormMessage(errorMessage, 'error');

        // Focus on first invalid field
        const firstInvalidField = document.querySelector('.form-group.has-error input, .form-group.has-error textarea, .form-group.has-error select');
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

// Individual field validators
function validateName(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Full name is required');
        return false;
    }

    if (value.length < 2) {
        showFieldError(field, errorElement, 'Name must be at least 2 characters long');
        return false;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        showFieldError(field, errorElement, 'Name can only contain letters, spaces, hyphens, and apostrophes');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validatePhone(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Phone number is required');
        return false;
    }

    // Requirement 7.2: Phone number validation (numbers only)
    if (!/^\d+$/.test(value)) {
        showFieldError(field, errorElement, 'Phone number can only contain numbers');
        return false;
    }

    if (value.length < 10) {
        showFieldError(field, errorElement, 'Phone number must be at least 10 digits');
        return false;
    }

    if (value.length > 15) {
        showFieldError(field, errorElement, 'Phone number cannot exceed 15 digits');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validateAddress(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Address is required');
        return false;
    }

    if (value.length < 10) {
        showFieldError(field, errorElement, 'Please provide a complete address (minimum 10 characters)');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validateCarLicense(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Car license number is required');
        return false;
    }

    if (value.length < 3) {
        showFieldError(field, errorElement, 'License number must be at least 3 characters');
        return false;
    }

    // Basic alphanumeric validation
    if (!/^[A-Za-z0-9\-\s]+$/.test(value)) {
        showFieldError(field, errorElement, 'License number can only contain letters, numbers, hyphens, and spaces');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validateCarEngine(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Car engine number is required');
        return false;
    }

    if (value.length < 5) {
        showFieldError(field, errorElement, 'Engine number must be at least 5 characters');
        return false;
    }

    // Requirement 7.3: Car engine number validation (numbers only)
    if (!/^\d+$/.test(value)) {
        showFieldError(field, errorElement, 'Engine number can only contain numbers');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validateDate(field) {
    const value = field.value;
    const errorElement = document.getElementById(field.id + 'Error');

    if (!value) {
        showFieldError(field, errorElement, 'Appointment date is required');
        return false;
    }

    const selectedDate = new Date(value);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Requirement 7.4: Date validation to prevent past date selection
    if (selectedDate <= today) {
        showFieldError(field, errorElement, 'Appointment date must be a future date');
        return false;
    }

    // Check if date is too far in the future (e.g., 6 months)
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 6);

    if (selectedDate > maxDate) {
        showFieldError(field, errorElement, 'Appointment date cannot be more than 6 months in advance');
        return false;
    }

    clearFieldError(field);
    return true;
}

function validateMechanic(field) {
    const value = field.value;
    const errorElement = document.getElementById(field.id + 'Error');

    // Requirement 7.5: Mechanic selection validation
    if (!value) {
        showFieldError(field, errorElement, 'Please select a mechanic');
        return false;
    }

    clearFieldError(field);
    return true;
}

// Show field error
function showFieldError(field, errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    field.style.borderColor = 'var(--error-color)';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    field.parentElement.classList.remove('has-success');
    field.parentElement.classList.add('has-error');

    // Add accessibility attributes
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', field.id + 'Error');

    // Add shake animation for better user feedback
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

// Clear field error styling and show success state for valid fields
function clearFieldError(field) {
    const errorElement = document.getElementById(field.id + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.parentElement.classList.remove('has-error');

    // Remove accessibility attributes for errors
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    // Show success state if field has value and is valid
    if (field.value.trim() !== '') {
        field.parentElement.classList.add('has-success');
        field.style.borderColor = 'var(--success-color, #10b981)';
        field.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        field.setAttribute('aria-invalid', 'false');
    } else {
        field.parentElement.classList.remove('has-success');
    }
}

// Clear all errors
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const formGroups = document.querySelectorAll('.form-group');

    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });

    formGroups.forEach(group => {
        group.classList.remove('has-error', 'has-success');
    });

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    });
}

// Load mechanic availability for selected date
function loadMechanicAvailability(selectedDate) {
    const mechanicSelect = document.getElementById('mechanicSelect');
    const mechanicAvailability = document.getElementById('mechanicAvailability');

    // Show loading state with spinner
    mechanicAvailability.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading mechanic availability...</p>
        </div>
    `;

    // Make API call to get mechanic availability
    fetchMechanicAvailability(selectedDate)
        .then(mechanics => {
            displayMechanicAvailability(mechanics, selectedDate);
        })
        .catch(error => {
            console.error('Error loading mechanic availability:', error);
            mechanicAvailability.innerHTML = `
                <div class="error-state">
                    <p>Unable to load mechanic availability. Please try again.</p>
                    <button onclick="loadMechanicAvailability('${selectedDate}')" class="retry-button">Retry</button>
                </div>
            `;
        });
}

// Fetch mechanic availability from API
async function fetchMechanicAvailability(date) {
    try {
        const response = await fetch(`../backend/api/get_mechanics.php?date=${date}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            return data.mechanics || [];
        } else {
            throw new Error(data.message || 'Failed to fetch mechanic availability');
        }
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data for development
        return getMockMechanicData(date);
    }
}

// Mock data fallback for development
function getMockMechanicData(date) {
    // Simulate different availability based on date for testing
    const baseDate = new Date(date);
    const dayOfWeek = baseDate.getDay();

    // Create realistic availability patterns based on day of week
    const mechanics = [
        { id: 1, name: 'John Smith', max_slots: 4, specialties: ['Engine Repair', 'Diagnostics'] },
        { id: 2, name: 'Sarah Johnson', max_slots: 4, specialties: ['Brake Service', 'Tire Service'] },
        { id: 3, name: 'Mike Wilson', max_slots: 4, specialties: ['Battery & Electrical', 'Oil Change'] },
        { id: 4, name: 'Lisa Brown', max_slots: 4, specialties: ['Engine Repair', 'Brake Service'] },
        { id: 5, name: 'David Lee', max_slots: 4, specialties: ['Diagnostics', 'Tire Service'] }
    ];

    // Simulate different booking patterns based on day of week
    return mechanics.map(mechanic => {
        let bookedSlots = 0;

        // Simulate busier days (Monday, Friday) vs quieter days
        if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
            bookedSlots = Math.floor(Math.random() * 4); // 0-3 booked
        } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            bookedSlots = Math.floor(Math.random() * 2); // 0-1 booked (less busy)
        } else { // Tuesday-Thursday
            bookedSlots = Math.floor(Math.random() * 3); // 0-2 booked
        }

        // Add some randomness based on mechanic ID for variety
        bookedSlots = Math.min(4, bookedSlots + (mechanic.id % 2));

        return {
            ...mechanic,
            available_slots: Math.max(0, mechanic.max_slots - bookedSlots),
            booked_slots: bookedSlots
        };
    });
}

// Display mechanic availability
function displayMechanicAvailability(mechanics, selectedDate) {
    const mechanicSelect = document.getElementById('mechanicSelect');
    const mechanicAvailability = document.getElementById('mechanicAvailability');

    // Clear and populate mechanic select
    mechanicSelect.innerHTML = '<option value="">Choose a mechanic...</option>';

    // Sort mechanics by availability (available first, then by slot count)
    const sortedMechanics = mechanics.sort((a, b) => {
        if (a.available_slots === 0 && b.available_slots > 0) return 1;
        if (b.available_slots === 0 && a.available_slots > 0) return -1;
        return b.available_slots - a.available_slots;
    });

    // Display availability header - Requirement 2.1: Show mechanic availability information
    const formattedDate = formatDateForDisplay(selectedDate);
    const availableMechanics = mechanics.filter(m => m.available_slots > 0);
    const totalAvailableSlots = mechanics.reduce((sum, m) => sum + m.available_slots, 0);
    const totalSlots = mechanics.length * 4; // 4 slots per mechanic maximum

    let availabilityHTML = `
        <div class="availability-header">
            <h4>Mechanic Availability for ${formattedDate}</h4>
            <div class="availability-summary">
                <span class="total-mechanics">${mechanics.length} mechanics total</span>
                <span class="available-count">${availableMechanics.length} available</span>
                <span class="slot-count">${totalAvailableSlots}/${totalSlots} slots free</span>
            </div>
        </div>
        <div class="mechanics-list">
    `;

    sortedMechanics.forEach(mechanic => {
        // Add to select dropdown if available - Requirement 2.1: Show available slots out of 4 maximum
        if (mechanic.available_slots > 0) {
            const option = document.createElement('option');
            option.value = mechanic.id;
            option.textContent = `${mechanic.name} (${mechanic.available_slots}/4 slots available)`;
            mechanicSelect.appendChild(option);
        }

        // Determine availability status - Requirement 2.1: Show available slots out of 4 maximum
        const maxSlots = 4;
        const bookedSlots = maxSlots - mechanic.available_slots;
        let badgeClass = 'unavailable';
        let statusText = 'Fully Booked (0/4 available)';
        let availabilityIcon = '❌';

        // Requirement 2.2: Mark mechanic as unavailable when they have 4 appointments
        if (mechanic.available_slots === 0) {
            badgeClass = 'unavailable';
            statusText = 'Fully Booked (0/4 available)';
            availabilityIcon = '❌';
        } else if (mechanic.available_slots >= 3) {
            badgeClass = 'available';
            statusText = `${mechanic.available_slots}/4 slots available`;
            availabilityIcon = '✅';
        } else {
            badgeClass = 'limited';
            statusText = `${mechanic.available_slots}/4 slots available`;
            availabilityIcon = '⚠️';
        }

        // Add specialties if available
        const specialtiesHTML = mechanic.specialties ?
            `<div class="mechanic-specialties">Specialties: ${mechanic.specialties.join(', ')}</div>` : '';

        availabilityHTML += `
            <div class="mechanic-item" data-mechanic-id="${mechanic.id}">
                <div class="mechanic-info">
                    <div class="mechanic-header">
                        <span class="mechanic-name">${mechanic.name}</span>
                        <span class="availability-icon">${availabilityIcon}</span>
                    </div>
                    ${specialtiesHTML}
                </div>
                <div class="availability-status">
                    <span class="availability-badge ${badgeClass}">${statusText}</span>
                </div>
            </div>
        `;
    });

    availabilityHTML += '</div>';

    // Add refresh button
    availabilityHTML += `
        <div class="availability-actions">
            <button onclick="loadMechanicAvailability('${selectedDate}')" class="refresh-button">
                🔄 Refresh Availability
            </button>
        </div>
    `;

    mechanicAvailability.innerHTML = availabilityHTML;

    // Add click handlers for mechanic selection
    addMechanicSelectionHandlers();

    // Trigger validation for mechanic selection if it was previously selected
    const mechanicSelect = document.getElementById('mechanicSelect');
    if (mechanicSelect && mechanicSelect.value) {
        validateMechanic(mechanicSelect);
    }
}

// Add click handlers for mechanic items
function addMechanicSelectionHandlers() {
    const mechanicItems = document.querySelectorAll('.mechanic-item');
    const mechanicSelect = document.getElementById('mechanicSelect');

    mechanicItems.forEach(item => {
        item.addEventListener('click', function () {
            const mechanicId = this.dataset.mechanicId;
            const mechanicName = this.querySelector('.mechanic-name').textContent;

            // Check if mechanic is available
            const badge = this.querySelector('.availability-badge');
            if (badge.classList.contains('unavailable')) {
                // Show message for unavailable mechanic
                showTemporaryMessage(this, 'This mechanic is fully booked for the selected date', 'warning');
                return;
            }

            // Select the mechanic in dropdown
            mechanicSelect.value = mechanicId;

            // Update visual selection
            updateSelectedMechanicHighlight();

            // Show confirmation message
            showTemporaryMessage(this, `Selected ${mechanicName}`, 'success');
        });
    });
}

// Show temporary message on mechanic item
function showTemporaryMessage(element, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.textContent = message;

    element.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 2000);
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Clear mechanic availability display
function clearMechanicAvailability() {
    const mechanicSelect = document.getElementById('mechanicSelect');
    const mechanicAvailability = document.getElementById('mechanicAvailability');

    mechanicSelect.innerHTML = '<option value="">Choose a mechanic...</option>';
    mechanicAvailability.innerHTML = `
        <div class="availability-placeholder">
            <i class="fas fa-info-circle"></i>
            <p>Select a date to see mechanic availability</p>
        </div>
    `;
}

// Update selected mechanic highlight
function updateSelectedMechanicHighlight() {
    const mechanicSelect = document.getElementById('mechanicSelect');
    const mechanicItems = document.querySelectorAll('.mechanic-item');

    // Remove previous highlights
    mechanicItems.forEach(item => {
        item.style.backgroundColor = '';
        item.style.border = '';
    });

    // Highlight selected mechanic
    if (mechanicSelect.value) {
        const selectedMechanicName = mechanicSelect.options[mechanicSelect.selectedIndex].text.split(' (')[0];
        mechanicItems.forEach(item => {
            const mechanicName = item.querySelector('.mechanic-name').textContent;
            if (mechanicName === selectedMechanicName) {
                item.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                item.style.border = '1px solid var(--primary-color)';
                item.style.borderRadius = 'var(--radius-md)';
            }
        });
    }
}

// Form input enhancements
function addFormInputEnhancements() {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        // Add focus/blur animations
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateY(-1px)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateY(0)';
        });

        // Add input validation styling
        input.addEventListener('input', function () {
            clearFieldError(this);
        });
    });
}

// Submit form (placeholder for actual submission)
function submitForm() {
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    loadingOverlay.classList.add('show');

    // Simulate form submission (will be replaced with actual API call in later tasks)
    setTimeout(() => {
        // Reset button
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        loadingOverlay.classList.remove('show');

        // Show success message
        showFormMessage('Appointment booked successfully! We will contact you shortly to confirm.', 'success');

        // Reset form after successful submission
        setTimeout(() => {
            document.getElementById('appointmentForm').reset();
            clearMechanicAvailability();
            clearAllErrors();

            // Reset progress
            const progressFill = document.getElementById('progressFill');
            const progressPercentage = document.getElementById('progressPercentage');
            const steps = document.querySelectorAll('.step');

            if (progressFill) progressFill.style.width = '0%';
            if (progressPercentage) progressPercentage.textContent = '0%';

            steps.forEach(step => {
                step.classList.remove('active', 'completed');
            });
        }, 3000);

    }, 2000);
}

// Show form message
function showFormMessage(message, type) {
    const formMessages = document.getElementById('formMessages');

    if (formMessages) {
        formMessages.textContent = message;
        formMessages.className = `form-messages ${type} show`;

        setTimeout(() => {
            formMessages.classList.remove('show');
        }, 5000);
    }
}
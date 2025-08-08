// Car Workshop Booking System - Simple Implementation
class BookingSystem {
    constructor() {
        this.mechanics = [];
        this.init();
    }

    init() {
        console.log('Booking system initialized');
        this.setupEventListeners();
        this.setMinimumDate();
        this.loadMechanics();
    }

    setupEventListeners() {
        const form = document.getElementById('appointmentForm');
        const dateInput = document.getElementById('appointmentDate');
        const clearBtn = document.getElementById('clearBtn');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Date change - Requirement 2.3: Update availability when date changes
        if (dateInput) {
            dateInput.addEventListener('change', (e) => this.handleDateChange(e));
        }

        // Clear form
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.resetFormWithConfirmation());
        }

        // Real-time validation
        this.setupFieldValidation();
    }

    setupFieldValidation() {
        const fields = [
            { id: 'clientName', validator: this.validateName },
            { id: 'clientPhone', validator: this.validatePhone },
            { id: 'clientAddress', validator: this.validateAddress },
            { id: 'carLicense', validator: this.validateCarLicense },
            { id: 'carEngine', validator: this.validateCarEngine },
            { id: 'appointmentDate', validator: this.validateDate },
            { id: 'mechanicSelect', validator: this.validateMechanic }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                // Validate on blur
                element.addEventListener('blur', () => field.validator.call(this, element));
                
                // Clear errors on input
                element.addEventListener('input', () => this.clearFieldError(element));

                // Auto-format phone and engine numbers (numbers only)
                if (field.id === 'clientPhone' || field.id === 'carEngine') {
                    element.addEventListener('input', (e) => {
                        const numbersOnly = e.target.value.replace(/\D/g, '');
                        if (e.target.value !== numbersOnly) {
                            e.target.value = numbersOnly;
                        }
                    });
                }
            }
        });
    }

    setMinimumDate() {
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    async loadMechanics() {
        try {
            // Try to load from API first
            const response = await fetch('./backend/api/get_mechanics.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.mechanics = data.mechanics || [];
                    return;
                }
            }
        } catch (error) {
            console.log('API not available, using mock data:', error);
        }

        // Fallback to mock data
        this.mechanics = [
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Sarah Johnson' },
            { id: 3, name: 'Mike Wilson' },
            { id: 4, name: 'Lisa Brown' },
            { id: 5, name: 'David Lee' }
        ];
    }

    async handleDateChange(e) {
        const selectedDate = e.target.value;
        if (!selectedDate) {
            this.clearMechanicAvailability();
            return;
        }

        // Requirement 7.4: Validate date is not in the past
        if (!this.validateDate(e.target)) {
            return;
        }

        await this.loadMechanicAvailability(selectedDate);
    }

    async loadMechanicAvailability(selectedDate) {
        const mechanicAvailability = document.getElementById('mechanicAvailability');
        const mechanicSelect = document.getElementById('mechanicSelect');

        // Show loading
        mechanicAvailability.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div class="loading-spinner" style="width: 24px; height: 24px; border: 2px solid hsl(var(--border)); border-top: 2px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.5rem;"></div>
                <p style="margin: 0; color: hsl(var(--muted-foreground));">Loading mechanic availability...</p>
            </div>
        `;

        try {
            const mechanics = await this.fetchMechanicAvailability(selectedDate);
            this.displayMechanicAvailability(mechanics, selectedDate);
        } catch (error) {
            console.error('Error loading availability:', error);
            this.handleAvailabilityError(error, selectedDate);
        }
    }

    async fetchMechanicAvailability(date) {
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(`./backend/api/get_mechanics.php?date=${date}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.mechanics || this.getMockAvailability(date);
                }
            } else {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your connection.');
            }
            console.log('API error, using mock data:', error);
            throw error; // Re-throw to be handled by caller
        }

        return this.getMockAvailability(date);
    }

    getMockAvailability(date) {
        // Generate realistic mock data based on date
        const dayOfWeek = new Date(date).getDay();
        
        return this.mechanics.map(mechanic => {
            // Simulate different booking patterns
            let bookedSlots = 0;
            if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday/Friday - busier
                bookedSlots = Math.floor(Math.random() * 4);
            } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend - less busy
                bookedSlots = Math.floor(Math.random() * 2);
            } else { // Tuesday-Thursday
                bookedSlots = Math.floor(Math.random() * 3);
            }

            return {
                ...mechanic,
                available_slots: Math.max(0, 4 - bookedSlots)
            };
        });
    }

    displayMechanicAvailability(mechanics, selectedDate) {
        const mechanicSelect = document.getElementById('mechanicSelect');
        const mechanicAvailability = document.getElementById('mechanicAvailability');

        // Sort by availability (available first)
        const sortedMechanics = mechanics.sort((a, b) => {
            if (a.available_slots === 0 && b.available_slots > 0) return 1;
            if (b.available_slots === 0 && a.available_slots > 0) return -1;
            return b.available_slots - a.available_slots;
        });

        // Requirement 2.1: Show mechanic availability with slot count
        const availableMechanics = mechanics.filter(m => m.available_slots > 0);
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let html = `
            <div style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                <h4 style="margin: 0 0 0.5rem 0; color: var(--foreground);">Available Mechanics for ${formattedDate}</h4>
                <div style="display: flex; gap: 1rem; font-size: 0.875rem;">
                    <span style="padding: 0.25rem 0.5rem; background: var(--secondary); border-radius: 0.25rem;">
                        ${mechanics.length} mechanics total
                    </span>
                    <span style="padding: 0.25rem 0.5rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; border-radius: 0.25rem;">
                        ${availableMechanics.length} available
                    </span>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        `;

        if (availableMechanics.length === 0) {
            html += `
                <div style="text-align: center; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.2); border-radius: 0.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">😔</div>
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--destructive);">No mechanics available</h4>
                    <p style="margin: 0; color: var(--muted-foreground); font-size: 0.875rem;">
                        All mechanics are fully booked on this date. Please choose a different date.
                    </p>
                </div>
            `;
        } else {
            sortedMechanics.forEach(mechanic => {
                // Requirement 2.2: Mark mechanic as unavailable when they have 4 appointments (0 available)
                let statusClass = 'unavailable';
                let statusText = 'Fully Booked (0/4 available)';
                let statusIcon = '❌';

                if (mechanic.available_slots > 0) {
                    statusClass = mechanic.available_slots >= 3 ? 'available' : 'limited';
                    statusText = `${mechanic.available_slots}/4 slots available`;
                    statusIcon = mechanic.available_slots >= 3 ? '✅' : '⚠️';
                }

                const isClickable = mechanic.available_slots > 0;
                const cursorStyle = isClickable ? 'cursor: pointer;' : 'cursor: not-allowed; opacity: 0.6;';

                html += `
                    <div class="mechanic-item" data-mechanic-id="${mechanic.id}" 
                         style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--card); border: 2px solid var(--border); border-radius: 0.75rem; transition: all 0.2s ease; ${cursorStyle}"
                         ${isClickable ? `onclick="bookingSystem.selectMechanic(${mechanic.id}, '${mechanic.name}')"` : ''}
                         ${isClickable ? `onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.15)'"` : ''}
                         ${isClickable ? `onmouseout="this.style.borderColor='var(--border)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'"` : ''}>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                                <span style="font-weight: 600; color: var(--foreground); font-size: 1.1rem;">${mechanic.name}</span>
                                <span style="font-size: 1.25rem;">${statusIcon}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--muted-foreground);">
                                ${isClickable ? 'Click to select this mechanic' : 'Not available on this date'}
                            </div>
                        </div>
                        <div>
                            <span style="padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; 
                                         ${statusClass === 'available' ? 'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);' : 
                                           statusClass === 'limited' ? 'background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);' : 
                                           'background: rgba(239, 68, 68, 0.1); color: var(--destructive); border: 1px solid rgba(239, 68, 68, 0.2);'}">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            </div>
            <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid var(--border);">
                <button onclick="bookingSystem.loadMechanicAvailability('${selectedDate}')" 
                        style="padding: 0.75rem 1.5rem; background: var(--secondary); border: 2px solid var(--border); border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s ease;"
                        onmouseover="this.style.background='var(--accent)'; this.style.borderColor='var(--primary)'"
                        onmouseout="this.style.background='var(--secondary)'; this.style.borderColor='var(--border)'">
                    🔄 Refresh Availability
                </button>
            </div>
        `;

        mechanicAvailability.innerHTML = html;
    }

    selectMechanic(mechanicId, mechanicName) {
        const mechanicSelect = document.getElementById('mechanicSelect');
        mechanicSelect.value = mechanicId;
        
        // Clear any previous error
        this.clearFieldError(mechanicSelect);
        
        // Show selection feedback
        this.showMessage(`Selected ${mechanicName}`, 'success');
        
        // Highlight selected mechanic
        this.highlightSelectedMechanic(mechanicId);
    }

    highlightSelectedMechanic(mechanicId) {
        const mechanicItems = document.querySelectorAll('.mechanic-item');
        mechanicItems.forEach(item => {
            if (item.dataset.mechanicId === mechanicId.toString()) {
                item.style.backgroundColor = 'hsl(var(--primary) / 0.1)';
                item.style.borderColor = 'hsl(var(--primary))';
            } else {
                item.style.backgroundColor = 'hsl(var(--card))';
                item.style.borderColor = 'hsl(var(--border))';
            }
        });
    }

    clearMechanicAvailability() {
        const mechanicSelect = document.getElementById('mechanicSelect');
        const mechanicAvailability = document.getElementById('mechanicAvailability');

        mechanicSelect.value = '';
        mechanicAvailability.innerHTML = '<p style="text-align: center; color: var(--muted-foreground); margin: 0; padding: 2rem;">Select a date to see available mechanics</p>';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        // Submit appointment - backend will handle duplicate checking and validation
        await this.submitAppointment();
    }

    async submitAppointment() {
        const submitBtn = document.getElementById('submitBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // Show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';
        loadingOverlay.style.display = 'flex';

        try {
            // Prepare form data with correct field names matching backend API
            const formData = new FormData();
            formData.append('client_name', document.getElementById('clientName').value.trim());
            formData.append('client_address', document.getElementById('clientAddress').value.trim());
            formData.append('client_phone', document.getElementById('clientPhone').value.trim());
            formData.append('car_license', document.getElementById('carLicense').value.trim());
            formData.append('car_engine', document.getElementById('carEngine').value.trim());
            formData.append('appointment_date', document.getElementById('appointmentDate').value);
            formData.append('mechanic_id', document.getElementById('mechanicSelect').value);
            
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for form submission
            
            const response = await fetch('./backend/api/book_appointment.php', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Requirement 4.1: Show confirmation message with appointment details
                    const appointmentDetails = data.appointment || {};
                    const confirmationMessage = `
                        Appointment booked successfully! 
                        
                        Details:
                        • Client: ${appointmentDetails.client_name || 'N/A'}
                        • Date: ${appointmentDetails.appointment_date || 'N/A'}
                        • Mechanic: ${appointmentDetails.mechanic_name || 'N/A'}
                        
                        We will contact you shortly to confirm your appointment.
                    `;
                    this.showMessage(confirmationMessage, 'success');
                    this.clearForm();
                    
                    // Scroll to top to show success message
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Requirement 4.2: Show specific error message from server
                    this.handleServerError(data);
                }
            } else {
                // Handle HTTP errors
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            this.handleAjaxError(error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
            loadingOverlay.style.display = 'none';
        }
    }

    // Enhanced error handling for server responses
    handleServerError(data) {
        const errorMessage = data.message || 'Failed to book appointment. Please try again.';
        
        // Handle specific error cases with targeted field highlighting
        if (data.message && data.message.includes('already have an appointment')) {
            // Highlight the date field for double booking error
            const dateField = document.getElementById('appointmentDate');
            this.showFieldError(dateField, 'You already have an appointment on this date');
            this.showErrorWithRetry(errorMessage, () => {
                // Clear the date field and refresh availability
                dateField.value = '';
                this.clearMechanicAvailability();
                dateField.focus();
            }, 'Choose Different Date');
        } else if (data.message && data.message.includes('fully booked')) {
            // Requirement 4.3: Suggest alternative mechanics
            const mechanicField = document.getElementById('mechanicSelect');
            this.showFieldError(mechanicField, 'Selected mechanic is fully booked');
            this.showErrorWithRetry(
                errorMessage + ' Please select a different mechanic or date.',
                () => this.refreshMechanicAvailability(),
                'Refresh Availability'
            );
        } else if (data.field) {
            // Handle field-specific errors from server validation
            const field = document.getElementById(data.field);
            if (field) {
                this.showFieldError(field, errorMessage);
                field.focus();
            }
            this.showErrorWithRetry(errorMessage, () => {
                if (field) field.focus();
            }, 'Fix and Retry');
        } else {
            // Generic server error
            this.showErrorWithRetry(errorMessage, () => {
                // Focus on first field with error or first field
                const firstErrorField = document.querySelector('.error-message[style*="block"]')?.previousElementSibling;
                const firstField = firstErrorField || document.getElementById('clientName');
                if (firstField) firstField.focus();
            }, 'Try Again');
        }
    }

    // Enhanced AJAX error handling with user-friendly messages and retry options
    handleAjaxError(error) {
        let errorMessage = 'Unable to book appointment. Please try again later.';
        let retryAction = () => this.submitAppointment();
        let retryLabel = 'Retry Booking';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            retryLabel = 'Check Connection & Retry';
        } else if (error.message.includes('Server returned 500')) {
            errorMessage = 'Server error occurred. The server may be temporarily unavailable.';
            retryLabel = 'Retry in a Moment';
        } else if (error.message.includes('Server returned 404')) {
            errorMessage = 'Booking service not found. Please contact support if this persists.';
            retryAction = () => {
                // Offer to reset form and try again
                this.clearForm();
                this.showMessage('Form has been reset. Please try booking again.', 'info');
            };
            retryLabel = 'Reset & Try Again';
        } else if (error.message.includes('Server returned 403')) {
            errorMessage = 'Access denied. Please refresh the page and try again.';
            retryAction = () => window.location.reload();
            retryLabel = 'Refresh Page';
        } else if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
            errorMessage = 'Request timed out. Please check your connection and try again.';
            retryLabel = 'Retry Booking';
        }
        
        this.showErrorWithRetry(errorMessage, retryAction, retryLabel);
    }

    // Helper method to refresh mechanic availability after booking errors
    async refreshMechanicAvailability() {
        const appointmentDate = document.getElementById('appointmentDate').value;
        if (appointmentDate) {
            await this.loadMechanicAvailability(appointmentDate);
        }
    }

    // Enhanced availability error handling
    handleAvailabilityError(error, selectedDate) {
        const mechanicAvailability = document.getElementById('mechanicAvailability');
        
        let errorMessage = 'Unable to load mechanic availability.';
        let retryAction = () => this.loadMechanicAvailability(selectedDate);
        let retryLabel = 'Retry';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Connection error. Please check your internet connection.';
            retryLabel = 'Check Connection & Retry';
        } else if (error.message.includes('Server returned 500')) {
            errorMessage = 'Server error loading availability. Please try again in a moment.';
            retryLabel = 'Retry in a Moment';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
            retryLabel = 'Retry';
        }

        mechanicAvailability.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; background: hsl(var(--destructive) / 0.05); border: 1px solid hsl(var(--destructive) / 0.2); border-radius: 0.5rem;">
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                    <p style="margin: 0; color: hsl(var(--destructive)); font-weight: 500; margin-bottom: 0.5rem;">${errorMessage}</p>
                    <p style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.875rem;">
                        You can still select a mechanic manually from the dropdown above.
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="bookingSystem.loadMechanicAvailability('${selectedDate}')" 
                            style="padding: 0.5rem 1rem; background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s ease;"
                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px hsl(var(--destructive) / 0.3)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        ${retryLabel}
                    </button>
                    <button onclick="bookingSystem.loadBasicMechanicList()" 
                            style="padding: 0.5rem 1rem; background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); border: 1px solid hsl(var(--border)); border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s ease;"
                            onmouseover="this.style.background='hsl(var(--accent))'"
                            onmouseout="this.style.background='hsl(var(--secondary))'">
                        Load Basic List
                    </button>
                </div>
            </div>
        `;
    }

    // Load basic mechanic list without availability data as fallback
    loadBasicMechanicList() {
        const mechanicSelect = document.getElementById('mechanicSelect');
        const mechanicAvailability = document.getElementById('mechanicAvailability');

        // Clear and populate select dropdown with basic mechanic list
        mechanicSelect.innerHTML = '<option value="">Choose a mechanic...</option>';

        this.mechanics.forEach(mechanic => {
            const option = document.createElement('option');
            option.value = mechanic.id;
            option.textContent = mechanic.name;
            mechanicSelect.appendChild(option);
        });

        mechanicAvailability.innerHTML = `
            <div style="text-align: center; padding: 1rem; background: hsl(var(--secondary)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem;">
                <div style="margin-bottom: 0.5rem;">
                    <span style="font-size: 1.5rem;">👨‍🔧</span>
                </div>
                <p style="margin: 0; color: hsl(var(--foreground)); font-weight: 500; margin-bottom: 0.25rem;">
                    Basic mechanic list loaded
                </p>
                <p style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.875rem;">
                    Availability information is not available. Please select any mechanic to proceed.
                </p>
            </div>
        `;

        this.showMessage('Basic mechanic list loaded. Availability information is not available, but you can still book with any mechanic.', 'info');
    }

    validateForm() {
        let isValid = true;
        const fields = [
            { element: document.getElementById('clientName'), validator: this.validateName },
            { element: document.getElementById('clientPhone'), validator: this.validatePhone },
            { element: document.getElementById('clientAddress'), validator: this.validateAddress },
            { element: document.getElementById('carLicense'), validator: this.validateCarLicense },
            { element: document.getElementById('carEngine'), validator: this.validateCarEngine },
            { element: document.getElementById('appointmentDate'), validator: this.validateDate },
            { element: document.getElementById('mechanicSelect'), validator: this.validateMechanic }
        ];

        fields.forEach(field => {
            if (!field.validator.call(this, field.element)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Validation methods following requirements
    validateName(field) {
        const value = field.value.trim();
        if (!value) {
            this.showFieldError(field, 'Full name is required');
            return false;
        }
        if (value.length < 2) {
            this.showFieldError(field, 'Name must be at least 2 characters');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validatePhone(field) {
        const value = field.value.trim();
        if (!value) {
            this.showFieldError(field, 'Phone number is required');
            return false;
        }
        // Requirement 7.2: Phone number validation (numbers only)
        if (!/^\d+$/.test(value)) {
            this.showFieldError(field, 'Phone number can only contain numbers');
            return false;
        }
        if (value.length < 10) {
            this.showFieldError(field, 'Phone number must be at least 10 digits');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateAddress(field) {
        const value = field.value.trim();
        if (!value) {
            this.showFieldError(field, 'Address is required');
            return false;
        }
        if (value.length < 10) {
            this.showFieldError(field, 'Please provide a complete address');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateCarLicense(field) {
        const value = field.value.trim();
        if (!value) {
            this.showFieldError(field, 'Car license number is required');
            return false;
        }
        if (value.length < 3) {
            this.showFieldError(field, 'License number must be at least 3 characters');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateCarEngine(field) {
        const value = field.value.trim();
        if (!value) {
            this.showFieldError(field, 'Car engine number is required');
            return false;
        }
        // Requirement 7.3: Car engine number validation (numbers only)
        if (!/^\d+$/.test(value)) {
            this.showFieldError(field, 'Engine number can only contain numbers');
            return false;
        }
        if (value.length < 5) {
            this.showFieldError(field, 'Engine number must be at least 5 digits');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateDate(field) {
        const value = field.value;
        if (!value) {
            this.showFieldError(field, 'Appointment date is required');
            return false;
        }
        
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Requirement 7.4: Date validation (future date)
        if (selectedDate <= today) {
            this.showFieldError(field, 'Appointment date must be a future date');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    validateMechanic(field) {
        const value = field.value;
        if (!value) {
            this.showFieldError(field, 'Please select a mechanic');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        field.style.borderColor = 'hsl(var(--destructive))';
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        field.style.borderColor = '';
    }

    showMessage(message, type) {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-weight: 500;
            white-space: pre-line;
            ${type === 'error' ? 
                'background: hsl(var(--destructive) / 0.1); color: hsl(var(--destructive)); border: 1px solid hsl(var(--destructive) / 0.2);' : 
                type === 'info' ?
                'background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.2);' :
                'background: hsl(142 76% 36% / 0.1); color: hsl(142 76% 36%); border: 1px solid hsl(142 76% 36% / 0.2);'
            }
        `;
        
        // Handle multi-line messages properly
        if (message.includes('\n')) {
            messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        } else {
            messageDiv.textContent = message;
        }

        messagesArea.innerHTML = '';
        messagesArea.appendChild(messageDiv);

        // Auto-hide after longer time for success messages (they contain more info)
        const hideTimeout = type === 'success' ? 8000 : 5000;
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, hideTimeout);
    }

    // Enhanced error display with retry functionality
    showErrorWithRetry(message, retryAction, retryLabel = 'Try Again') {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-weight: 500;
            background: hsl(var(--destructive) / 0.1);
            color: hsl(var(--destructive));
            border: 1px solid hsl(var(--destructive) / 0.2);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        `;

        const messageText = document.createElement('div');
        messageText.textContent = message;
        messageText.style.cssText = 'line-height: 1.5;';

        const actionButtons = document.createElement('div');
        actionButtons.style.cssText = `
            display: flex;
            gap: 0.75rem;
            align-items: center;
            flex-wrap: wrap;
        `;

        // Retry button
        const retryBtn = document.createElement('button');
        retryBtn.textContent = retryLabel;
        retryBtn.style.cssText = `
            padding: 0.5rem 1rem;
            background: hsl(var(--destructive));
            color: hsl(var(--destructive-foreground));
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        retryBtn.addEventListener('click', () => {
            messagesArea.innerHTML = '';
            retryAction();
        });
        retryBtn.addEventListener('mouseenter', () => {
            retryBtn.style.transform = 'translateY(-1px)';
            retryBtn.style.boxShadow = '0 4px 8px hsl(var(--destructive) / 0.3)';
        });
        retryBtn.addEventListener('mouseleave', () => {
            retryBtn.style.transform = 'translateY(0)';
            retryBtn.style.boxShadow = 'none';
        });

        // Clear form button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear Form';
        clearBtn.style.cssText = `
            padding: 0.5rem 1rem;
            background: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        clearBtn.addEventListener('click', () => {
            messagesArea.innerHTML = '';
            this.clearForm();
            this.showMessage('Form has been cleared. You can start over.', 'info');
        });
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = 'hsl(var(--accent))';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = 'hsl(var(--secondary))';
        });

        // Dismiss button
        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = '✕ Dismiss';
        dismissBtn.style.cssText = `
            padding: 0.5rem 1rem;
            background: transparent;
            color: hsl(var(--muted-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        dismissBtn.addEventListener('click', () => {
            messagesArea.innerHTML = '';
        });
        dismissBtn.addEventListener('mouseenter', () => {
            dismissBtn.style.background = 'hsl(var(--accent))';
            dismissBtn.style.color = 'hsl(var(--foreground))';
        });
        dismissBtn.addEventListener('mouseleave', () => {
            dismissBtn.style.background = 'transparent';
            dismissBtn.style.color = 'hsl(var(--muted-foreground))';
        });

        actionButtons.appendChild(retryBtn);
        actionButtons.appendChild(clearBtn);
        actionButtons.appendChild(dismissBtn);

        errorDiv.appendChild(messageText);
        errorDiv.appendChild(actionButtons);

        messagesArea.innerHTML = '';
        messagesArea.appendChild(errorDiv);

        // Scroll to top to ensure error is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Auto-hide after extended time (but longer than regular messages)
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 15000);
    }

    clearForm() {
        // Clear form data
        document.getElementById('appointmentForm').reset();
        this.clearMechanicAvailability();
        
        // Clear all error messages
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });

        // Reset field styles
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });

        // Clear any messages
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.innerHTML = '';
        }

        // Reset date minimum
        this.setMinimumDate();
        
        // Focus on first field for better UX
        const firstField = document.getElementById('clientName');
        if (firstField) {
            setTimeout(() => firstField.focus(), 100);
        }
    }

    // Enhanced form reset with confirmation
    resetFormWithConfirmation() {
        const hasData = this.formHasData();
        
        if (hasData) {
            const confirmReset = confirm('Are you sure you want to clear all form data? This action cannot be undone.');
            if (!confirmReset) {
                return;
            }
        }
        
        this.clearForm();
        this.showMessage('Form has been reset. You can start over.', 'info');
    }

    // Check if form has any data
    formHasData() {
        const fields = [
            'clientName', 'clientPhone', 'clientAddress',
            'carLicense', 'carEngine', 'appointmentDate', 'mechanicSelect'
        ];
        
        return fields.some(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim() !== '';
        });
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.bookingSystem = new BookingSystem();
});
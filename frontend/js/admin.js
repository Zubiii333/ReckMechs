// Admin Panel JavaScript - Appointment Management
class AdminPanel {
    constructor() {
        this.appointments = [];
        this.mechanics = [];
        this.editingRow = null;
        this.originalData = null;

        this.init();
    }

    init() {
        console.log('Admin Panel initialized');
        this.bindEvents();
        this.loadMechanics();
        this.loadAppointments();
        this.loadAllMechanics();
    }

    bindEvents() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadMechanics();
                this.loadAppointments();
            });
        }

        // Mechanic form
        const mechanicForm = document.getElementById('mechanicForm');
        if (mechanicForm) {
            mechanicForm.addEventListener('submit', (e) => this.handleAddMechanic(e));
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        // Messages are now handled silently - no UI feedback
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    async loadMechanics() {
        try {
            const response = await fetch('./backend/api/get_all_mechanics.php');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                this.mechanics = data.mechanics || [];
                console.log('Loaded mechanics:', this.mechanics);
            } else {
                throw new Error(data.message || 'Failed to load mechanics');
            }
        } catch (error) {
            console.error('Error loading mechanics:', error);
            this.mechanics = [];
            this.showMessage('Failed to load mechanics: ' + error.message, 'error');
        }
    }

    async loadAppointments() {
        this.showLoading();

        try {
            // Load mechanics first to ensure they're available for dropdown
            await this.loadMechanics();

            // Load appointments with timeout
            const appointmentsController = new AbortController();
            const appointmentsTimeoutId = setTimeout(() => appointmentsController.abort(), 10000);

            const appointmentsResponse = await fetch('./backend/api/get_appointments.php', {
                signal: appointmentsController.signal
            });

            clearTimeout(appointmentsTimeoutId);

            if (!appointmentsResponse.ok) {
                throw new Error(`HTTP error! status: ${appointmentsResponse.status}`);
            }

            const appointmentsData = await appointmentsResponse.json();

            if (!appointmentsData.success) {
                throw new Error(appointmentsData.message || 'Failed to load appointments');
            }

            // Use the correct property name from the API response
            this.appointments = appointmentsData.appointments || [];

            this.renderAppointments();
            this.showMessage('Appointments loaded successfully', 'success');

        } catch (error) {
            console.error('Error loading appointments:', error);
            this.handleLoadError(error);
            this.renderEmptyState();
        } finally {
            this.hideLoading();
        }
    }

    renderAppointments() {
        const tableBody = document.getElementById('appointmentsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (!tableBody) return;

        if (this.appointments.length === 0) {
            this.renderEmptyState();
            this.updateStats();
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        tableBody.innerHTML = '';

        this.appointments.forEach(appointment => {
            const row = this.createAppointmentRow(appointment);
            tableBody.appendChild(row);
        });

        // Update stats after rendering appointments
        this.updateStats();
        this.renderMechanics();
    }

    updateStats() {
        const totalAppointments = document.getElementById('totalAppointments');
        const availableMechanics = document.getElementById('availableMechanics');

        if (totalAppointments) {
            totalAppointments.textContent = this.appointments.length;
        }

        if (availableMechanics) {
            availableMechanics.textContent = this.mechanics.length || 5;
        }
    }

    exportData() {
        if (this.appointments.length === 0) {
            this.showMessage('No appointments to export', 'error');
            return;
        }

        // Create CSV content
        const headers = ['ID', 'Client Name', 'Phone', 'Car License', 'Car Engine', 'Date', 'Mechanic', 'Status'];
        const csvContent = [
            headers.join(','),
            ...this.appointments.map(apt => {
                const mechanic = this.mechanics.find(m => m.id == apt.mechanic_id);
                const mechanicName = mechanic ? mechanic.name : `Mechanic ${apt.mechanic_id}`;
                return [
                    apt.id,
                    `"${apt.client_name}"`,
                    apt.client_phone,
                    `"${apt.car_license}"`,
                    apt.car_engine,
                    apt.appointment_date,
                    `"${mechanicName}"`,
                    'Confirmed'
                ].join(',');
            })
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showMessage('Appointments exported successfully', 'success');
    }

    renderEmptyState() {
        const tableBody = document.getElementById('appointmentsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    createAppointmentRow(appointment) {
        const row = document.createElement('tr');
        row.className = 'appointment-row';
        row.dataset.appointmentId = appointment.id;

        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>
                <input type="text" class="editable-field" data-field="client_name" 
                       value="${this.escapeHtml(appointment.client_name)}" readonly>
            </td>
            <td>
                <input type="text" class="editable-field" data-field="client_phone" 
                       value="${this.escapeHtml(appointment.client_phone)}" readonly>
            </td>
            <td>
                <input type="text" class="editable-field" data-field="car_license" 
                       value="${this.escapeHtml(appointment.car_license)}" readonly>
            </td>
            <td>
                <input type="text" class="editable-field" data-field="car_engine" 
                       value="${this.escapeHtml(appointment.car_engine)}" readonly>
            </td>
            <td>
                <input type="date" class="editable-field" data-field="appointment_date" 
                       value="${appointment.appointment_date}" readonly>
            </td>
            <td>
                <select class="editable-select" data-field="mechanic_id" disabled>
                    ${this.createMechanicOptions(appointment.mechanic_id)}
                </select>
            </td>
            <td>
                <span class="status-badge status-confirmed">Confirmed</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="adminPanel.editAppointment(${appointment.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    createMechanicOptions(selectedMechanicId) {
        let options = '';

        if (this.mechanics.length === 0) {
            options = '<option value="">No mechanics available - Add mechanics first</option>';
        } else {
            this.mechanics.forEach(mechanic => {
                const selected = mechanic.id == selectedMechanicId ? 'selected' : '';
                options += `<option value="${mechanic.id}" ${selected}>${this.escapeHtml(mechanic.name)} - ${this.escapeHtml(mechanic.specialization)}</option>`;
            });
        }

        return options;
    }

    editAppointment(appointmentId) {
        // If already editing another row, cancel it first
        if (this.editingRow && this.editingRow !== appointmentId) {
            this.cancelEdit();
        }

        const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
        if (!row) return;

        // Store original data for cancel functionality
        const appointment = this.appointments.find(a => a.id == appointmentId);
        this.originalData = { ...appointment };
        this.editingRow = appointmentId;

        // Add editing class
        row.classList.add('editing');

        // Enable form fields
        const editableFields = row.querySelectorAll('.editable-field, .editable-select');
        editableFields.forEach(field => {
            field.removeAttribute('readonly');
            field.removeAttribute('disabled');

            // Add input validation for phone and engine number fields
            if (field.dataset.field === 'client_phone' || field.dataset.field === 'car_engine') {
                field.addEventListener('input', (e) => {
                    const numbersOnly = e.target.value.replace(/\D/g, '');
                    if (e.target.value !== numbersOnly) {
                        e.target.value = numbersOnly;
                    }
                });
            }
        });

        // Set minimum date for appointment date field
        const dateField = row.querySelector('[data-field="appointment_date"]');
        if (dateField) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateField.min = tomorrow.toISOString().split('T')[0];
        }

        // Update action buttons
        const actionButtons = row.querySelector('.action-buttons');
        actionButtons.innerHTML = `
            <button class="save-btn" onclick="adminPanel.saveAppointment(${appointmentId})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Save
            </button>
            <button class="cancel-btn" onclick="adminPanel.cancelEdit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancel
            </button>
        `;
    }

    async saveAppointment(appointmentId) {
        const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
        if (!row) return;

        // Collect form data
        const formData = new FormData();
        formData.append('appointment_id', appointmentId);

        const editableFields = row.querySelectorAll('.editable-field, .editable-select');
        const updatedData = {};

        editableFields.forEach(field => {
            const fieldName = field.dataset.field;
            const fieldValue = field.value.trim();
            formData.append(fieldName, fieldValue);
            updatedData[fieldName] = fieldValue;
        });

        // Validate required fields
        if (!updatedData.client_name || !updatedData.client_phone ||
            !updatedData.car_license || !updatedData.car_engine ||
            !updatedData.appointment_date || !updatedData.mechanic_id) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Validate phone number (numbers only)
        if (!/^\d+$/.test(updatedData.client_phone)) {
            this.showMessage('Phone number must contain only numbers', 'error');
            return;
        }

        // Validate car engine number (numbers only)
        if (!/^\d+$/.test(updatedData.car_engine)) {
            this.showMessage('Car engine number must contain only numbers', 'error');
            return;
        }

        // Validate date (not in the past)
        const selectedDate = new Date(updatedData.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showMessage('Appointment date cannot be in the past', 'error');
            return;
        }

        this.showLoading();

        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('./backend/api/update_appointment.php', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Update local data
                const appointmentIndex = this.appointments.findIndex(a => a.id == appointmentId);
                if (appointmentIndex !== -1) {
                    this.appointments[appointmentIndex] = {
                        ...this.appointments[appointmentIndex],
                        ...updatedData,
                        id: appointmentId
                    };
                }

                this.finishEdit(row);
                this.showMessage('Appointment updated successfully', 'success');
            } else {
                throw new Error(result.message || 'Failed to update appointment');
            }

        } catch (error) {
            console.error('Error updating appointment:', error);
            this.handleUpdateError(error);
        } finally {
            this.hideLoading();
        }
    }

    cancelEdit() {
        if (!this.editingRow) return;

        const row = document.querySelector(`tr[data-appointment-id="${this.editingRow}"]`);
        if (!row) return;

        // Restore original values
        if (this.originalData) {
            const editableFields = row.querySelectorAll('.editable-field, .editable-select');
            editableFields.forEach(field => {
                const fieldName = field.dataset.field;
                if (this.originalData[fieldName] !== undefined) {
                    field.value = this.originalData[fieldName];
                }
            });
        }

        this.finishEdit(row);
    }

    finishEdit(row) {
        // Remove editing class
        row.classList.remove('editing');

        // Disable form fields
        const editableFields = row.querySelectorAll('.editable-field, .editable-select');
        editableFields.forEach(field => {
            field.setAttribute('readonly', 'readonly');
            if (field.tagName === 'SELECT') {
                field.setAttribute('disabled', 'disabled');
            }
        });

        // Restore edit button
        const appointmentId = row.dataset.appointmentId;
        const actionButtons = row.querySelector('.action-buttons');
        actionButtons.innerHTML = `
            <button class="edit-btn" onclick="adminPanel.editAppointment(${appointmentId})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
            </button>
        `;

        // Clear editing state
        this.editingRow = null;
        this.originalData = null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Enhanced error handling for loading appointments
    handleLoadError(error) {
        let errorMessage = 'Error loading appointments';
        let retryAction = () => this.loadAppointments();
        let retryLabel = 'Retry Loading';

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            retryLabel = 'Check Connection & Retry';
        } else if (error.message.includes('HTTP error! status: 500')) {
            errorMessage = 'Server error occurred. The server may be temporarily unavailable.';
            retryLabel = 'Retry in a Moment';
        } else if (error.message.includes('HTTP error! status: 404')) {
            errorMessage = 'Appointments service not found. Please contact support if this persists.';
            retryAction = () => window.location.reload();
            retryLabel = 'Refresh Page';
        } else if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
            errorMessage = 'Request timed out. Please check your connection and try again.';
            retryLabel = 'Retry Loading';
        } else {
            errorMessage = `Error loading appointments: ${error.message}`;
        }

        this.showErrorWithRetry(errorMessage, retryAction, retryLabel);
    }

    // Enhanced error handling for updating appointments
    handleUpdateError(error) {
        let errorMessage = 'Error updating appointment';
        let retryAction = () => {
            // Re-attempt the save operation
            if (this.editingRow) {
                this.saveAppointment(this.editingRow);
            }
        };
        let retryLabel = 'Retry Update';

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            retryLabel = 'Check Connection & Retry';
        } else if (error.message.includes('HTTP error! status: 500')) {
            errorMessage = 'Server error occurred while updating. Please try again in a moment.';
            retryLabel = 'Retry in a Moment';
        } else if (error.message.includes('HTTP error! status: 404')) {
            errorMessage = 'Update service not found. Please refresh the page and try again.';
            retryAction = () => window.location.reload();
            retryLabel = 'Refresh Page';
        } else if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
            errorMessage = 'Update request timed out. Please check your connection and try again.';
            retryLabel = 'Retry Update';
        } else {
            errorMessage = `Error updating appointment: ${error.message}`;
        }

        this.showErrorWithRetry(errorMessage, retryAction, retryLabel);
    }

    // Enhanced error display with retry functionality for admin panel
    showErrorWithRetry(message, retryAction, retryLabel = 'Try Again') {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        `;

        const messageText = document.createElement('div');
        messageText.innerHTML = `❌ ${message}`;
        messageText.style.cssText = 'line-height: 1.5; font-weight: 500;';

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

        // Refresh page button
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh Page';
        refreshBtn.style.cssText = `
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
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
        refreshBtn.addEventListener('mouseenter', () => {
            refreshBtn.style.background = 'hsl(var(--accent))';
        });
        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.background = 'hsl(var(--secondary))';
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
        actionButtons.appendChild(refreshBtn);
        actionButtons.appendChild(dismissBtn);

        errorDiv.appendChild(messageText);
        errorDiv.appendChild(actionButtons);

        messagesArea.innerHTML = '';
        messagesArea.appendChild(errorDiv);

        // Scroll to top to ensure error is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Auto-hide after extended time
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 15000);
    }

    // Mechanic management functions
    async handleAddMechanic(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const name = formData.get('name').trim();
        const specialization = formData.get('specialization').trim();

        if (!name || !specialization) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch('./backend/api/add_mechanic.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Mechanic added successfully', 'success');

                // Add to local mechanics array
                this.mechanics.push(result.mechanic);

                // Reset form and hide it
                event.target.reset();
                this.toggleAddMechanicForm();

                // Refresh appointments to update dropdowns
                this.renderAppointments();
            } else {
                this.showMessage(result.message || 'Failed to add mechanic', 'error');
            }
        } catch (error) {
            console.error('Error adding mechanic:', error);
            this.showMessage('Error adding mechanic: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    toggleAddMechanicForm() {
        const form = document.getElementById('addMechanicForm');
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';

            if (!isVisible) {
                // Focus on first input when showing form
                const firstInput = form.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        }
    }
    async loadAllMechanics() {
        try {
            const response = await fetch('./backend/api/get_all_mechanics.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.mechanics = data.mechanics || [];
                    this.renderMechanics();
                }
            }
        } catch (error) {
            console.error('Error loading mechanics:', error);
        }
    }

    renderMechanics() {
        const tableBody = document.getElementById('mechanicsTableBody');
        const emptyState = document.getElementById('mechanicsEmptyState');

        if (!tableBody) return;

        if (this.mechanics.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tableBody.innerHTML = '';
        this.mechanics.forEach(mechanic => {
            const row = this.createMechanicRow(mechanic);
            tableBody.appendChild(row);
        });
    }

    createMechanicRow(mechanic) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mechanic.id}</td>
            <td>${mechanic.name}</td>
            <td>${mechanic.specialization || 'General'}</td>
            <td>
                <span class="status-badge status-confirmed">Active</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="adminPanel.editMechanic(${mechanic.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    editMechanic(mechanicId) {
        // Find the mechanic row and make it editable
        const rows = document.querySelectorAll('#mechanicsTableBody tr');
        rows.forEach(row => {
            const firstCell = row.cells[0];
            if (firstCell && firstCell.textContent == mechanicId) {
                this.makeRowEditable(row, mechanicId, 'mechanic');
            }
        });
    }

    makeRowEditable(row, id, type) {
        if (this.editingRow) {
            this.cancelEdit();
        }

        this.editingRow = row;
        this.originalData = {
            name: row.cells[1].textContent,
            specialization: row.cells[2].textContent
        };

        row.classList.add('appointment-row', 'editing');

        // Make name editable
        row.cells[1].innerHTML = `<input type="text" class="editable-field" value="${this.originalData.name}">`;
        
        // Make specialization editable
        row.cells[2].innerHTML = `<input type="text" class="editable-field" value="${this.originalData.specialization}">`;

        // Update action buttons
        row.cells[4].innerHTML = `
            <div class="action-buttons">
                <button class="save-btn" onclick="adminPanel.saveMechanicEdit(${id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Save
                </button>
                <button class="cancel-btn" onclick="adminPanel.cancelEdit()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cancel
                </button>
            </div>
        `;
    }

    async saveMechanicEdit(mechanicId) {
        if (!this.editingRow) return;

        const nameInput = this.editingRow.cells[1].querySelector('input');
        const specializationInput = this.editingRow.cells[2].querySelector('input');

        const updatedData = {
            id: mechanicId,
            name: nameInput.value.trim(),
            specialization: specializationInput.value.trim()
        };

        try {
            const formData = new FormData();
            formData.append('id', updatedData.id);
            formData.append('name', updatedData.name);
            formData.append('specialization', updatedData.specialization);

            const response = await fetch('./backend/api/update_mechanic.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update the row with new data
                    this.editingRow.cells[1].textContent = updatedData.name;
                    this.editingRow.cells[2].textContent = updatedData.specialization;
                    
                    // Reset the action buttons
                    this.editingRow.cells[4].innerHTML = `
                        <div class="action-buttons">
                            <button class="edit-btn" onclick="adminPanel.editMechanic(${mechanicId})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                            </button>
                        </div>
                    `;

                    this.editingRow.classList.remove('appointment-row', 'editing');
                    this.editingRow = null;
                    this.originalData = null;

                    // Reload mechanics data
                    await this.loadAllMechanics();
                }
            }
        } catch (error) {
            console.error('Error updating mechanic:', error);
            this.cancelEdit();
        }
    }

    cancelEdit() {
        if (!this.editingRow) return;

        // Restore original data
        this.editingRow.cells[1].textContent = this.originalData.name;
        this.editingRow.cells[2].textContent = this.originalData.specialization;

        // Reset action buttons based on type
        const mechanicId = this.editingRow.cells[0].textContent;
        this.editingRow.cells[4].innerHTML = `
            <div class="action-buttons">
                <button class="edit-btn" onclick="adminPanel.editMechanic(${mechanicId})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
            </div>
        `;

        this.editingRow.classList.remove('appointment-row', 'editing');
        this.editingRow = null;
        this.originalData = null;
    }

    async handleAddMechanic(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('./backend/api/add_mechanic.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Reset form
                    e.target.reset();
                    
                    // Hide form
                    const addForm = document.getElementById('addMechanicForm');
                    if (addForm) addForm.style.display = 'none';
                    
                    // Reload mechanics
                    await this.loadAllMechanics();
                    this.updateStats();
                }
            }
        } catch (error) {
            console.error('Error adding mechanic:', error);
        }
    }
}

// Toggle add mechanic form
function toggleAddMechanicForm() {
    const form = document.getElementById('addMechanicForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.adminPanel = new AdminPanel();

    // Make functions globally accessible
    window.exportData = function () {
        if (window.adminPanel) {
            window.adminPanel.exportData();
        }
    };

    window.toggleAddMechanicForm = function () {
        if (window.adminPanel) {
            window.adminPanel.toggleAddMechanicForm();
        }
    };
});
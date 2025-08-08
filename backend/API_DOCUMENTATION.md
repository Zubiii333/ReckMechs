# Simple Car Workshop API Documentation

This document explains how to use the 4 simple APIs for the car workshop appointment system.

## 1. Get Mechanics API (`get_mechanics.php`)

**Purpose**: Shows available mechanics for a specific date

**How to use**:
```
GET /api/get_mechanics.php?date=2025-08-10
```

**What it does**:
1. Gets the date from the URL
2. Checks if date is in the future
3. Gets all 5 mechanics from database
4. For each mechanic, counts how many appointments they have on that date
5. Calculates available slots (4 max - booked appointments)
6. Returns list of mechanics with availability

**Response example**:
```json
{
  "success": true,
  "date": "2025-08-10",
  "mechanics": [
    {
      "id": 1,
      "name": "Md. Joshim",
      "specialization": "Engine Specialist",
      "booked_today": 2,
      "slots_available": 2,
      "is_available": true
    }
  ]
}
```

## 2. Book Appointment API (`book_appointment.php`)

**Purpose**: Books a new appointment for a client

**How to use**:
```
POST /api/book_appointment.php
```

**Required form data**:
- `client_name`: Client's full name
- `client_address`: Client's address
- `client_phone`: Phone number (numbers only)
- `car_license`: Car license plate
- `car_engine`: Car engine number (numbers only)
- `appointment_date`: Date in YYYY-MM-DD format
- `mechanic_id`: ID of selected mechanic

**What it does**:
1. Checks all required fields are filled
2. Validates phone and engine numbers are numeric
3. Checks appointment date is in the future
4. Verifies mechanic exists
5. Prevents double booking (same phone, same date)
6. Checks mechanic has available slots (max 4 per day)
7. Saves appointment to database

**Response example**:
```json
{
  "success": true,
  "message": "Appointment booked successfully!",
  "appointment": {
    "client_name": "John Doe",
    "appointment_date": "2025-08-10",
    "mechanic_name": "Md. Joshim"
  }
}
```

## 3. Get Appointments API (`get_appointments.php`)

**Purpose**: Shows all appointments for admin panel

**How to use**:
```
GET /api/get_appointments.php
```

**What it does**:
1. Gets all appointments from database
2. Joins with mechanics table to get mechanic names
3. Formats data for easy display in admin table
4. Sorts by appointment date

**Response example**:
```json
{
  "success": true,
  "appointments": [
    {
      "id": 1,
      "client_name": "John Doe",
      "client_phone": "01712345678",
      "car_license": "DHA-1234",
      "appointment_date": "2025-08-10",
      "mechanic_name": "Md. Joshim",
      "status": "scheduled"
    }
  ],
  "total_count": 1
}
```

## 4. Update Appointment API (`update_appointment.php`)

**Purpose**: Updates existing appointments from admin panel

**How to use**:
```
POST /api/update_appointment.php
```

**Required form data**:
- `id`: Appointment ID to update

**Optional form data**:
- `appointment_date`: New date
- `mechanic_id`: New mechanic ID
- `status`: New status (scheduled, completed, cancelled)

**What it does**:
1. Checks appointment exists
2. Validates new date is in future (if provided)
3. Checks new mechanic exists and has space (if provided)
4. Validates status is valid (if provided)
5. Updates only the provided fields
6. Saves changes to database

**Response example**:
```json
{
  "success": true,
  "message": "Appointment updated successfully"
}
```

## Error Responses

All APIs return error responses in this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

## Requirements Satisfied

These simple APIs satisfy all the requirements:

- **Requirement 1**: Booking form with validation ✓
- **Requirement 2**: Real-time mechanic availability ✓
- **Requirement 3**: Prevents double bookings ✓
- **Requirement 4**: Confirmation messages ✓
- **Requirement 5**: Admin panel to view appointments ✓
- **Requirement 6**: Admin can modify appointments ✓
- **Requirement 7**: Form validation (numbers only, future dates) ✓

## Database Tables

**mechanics table**:
- id (auto increment)
- name (mechanic name)
- specialization (what they specialize in)

**appointments table**:
- id (auto increment)
- client_name, client_address, client_phone
- car_license, car_engine
- appointment_date
- mechanic_id (links to mechanics table)
- status (scheduled/completed/cancelled)
- created_at (when appointment was made)
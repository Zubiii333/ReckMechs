# Design Document

## Overview

The car workshop appointment system is a web application built with HTML, CSS, JavaScript for the frontend and PHP with MySQL for the backend. The system consists of two main interfaces: a client booking interface and an admin management interface. The architecture follows a simple client-server model with form-based interactions and database persistence.

## Architecture

```
Frontend (HTML/CSS/JS) ↔ Backend (PHP) ↔ Database (MySQL)
```

### System Components:
- **Client Interface**: User-facing appointment booking form
- **Admin Interface**: Administrative dashboard for appointment management
- **Backend API**: PHP scripts handling form submissions and data operations
- **Database**: MySQL database storing appointments, mechanics, and client data

## Components and Interfaces

### Frontend Structure
```
frontend/
├── index.html          # Landing page with appointment form
├── admin.html          # Admin dashboard
├── css/
│   └── style.css       # Unified styling
└── js/
    ├── booking.js      # Client-side validation and form handling
    └── admin.js        # Admin panel functionality
```

### Backend Structure
```
backend/
├── config/
│   └── database.php    # Database connection configuration
├── api/
│   ├── book_appointment.php    # Handle appointment bookings
│   ├── get_mechanics.php       # Fetch mechanic availability
│   ├── get_appointments.php    # Fetch all appointments for admin
│   └── update_appointment.php  # Update appointment details
└── database/
    └── schema.sql      # Database schema
```

## Data Models

### Database Schema

#### mechanics table
```sql
CREATE TABLE mechanics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    max_appointments INT DEFAULT 4
);
```

#### appointments table
```sql
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(100) NOT NULL,
    client_address TEXT NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    car_license VARCHAR(50) NOT NULL,
    car_engine VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    mechanic_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
);
```

### Data Flow

1. **Client Booking Flow**:
   - Client loads booking form → Frontend requests mechanic availability → Backend queries database → Display available mechanics
   - Client submits form → Frontend validates → Backend processes → Database stores appointment

2. **Admin Management Flow**:
   - Admin loads dashboard → Frontend requests appointments → Backend queries database → Display appointment list
   - Admin modifies appointment → Frontend sends update → Backend validates and updates database

## Error Handling

### Client-Side Validation
- Required field validation using JavaScript
- Phone number format validation (numbers only)
- Car engine number format validation (numbers only)
- Date validation (future dates only)
- Mechanic selection validation

### Server-Side Validation
- Duplicate appointment checking (same client, same date)
- Mechanic capacity validation (max 4 appointments per day)
- Data sanitization and SQL injection prevention
- Input validation for all form fields

### Error Response Format
```json
{
    "success": false,
    "message": "Error description",
    "field": "field_name" // for field-specific errors
}
```

### Success Response Format
```json
{
    "success": true,
    "message": "Success message",
    "data": {} // relevant data if needed
}
```

## Testing Strategy

### Frontend Testing
- Form validation testing with various input combinations
- Responsive design testing across different screen sizes
- JavaScript functionality testing for dynamic content updates
- Cross-browser compatibility testing

### Backend Testing
- API endpoint testing with valid and invalid data
- Database connection and query testing
- Appointment booking logic testing (capacity limits, duplicates)
- Admin functionality testing (view, update appointments)

### Integration Testing
- End-to-end appointment booking process
- Admin appointment management workflow
- Database consistency after operations
- Error handling across all system components

### User Acceptance Testing
- Client booking experience testing
- Admin dashboard usability testing
- System performance under normal load
- Data accuracy and persistence verification

## Security Considerations

### Input Validation
- Server-side validation for all user inputs
- SQL injection prevention using prepared statements
- XSS prevention through proper output encoding

### Data Protection
- Secure database connection configuration
- Input sanitization for all form fields
- Proper error message handling (no sensitive data exposure)

## UI/UX Design Principles

### Client Interface
- Clean, professional layout with clear call-to-action
- Intuitive form design with proper field labeling
- Real-time feedback for form validation
- Mobile-responsive design

### Admin Interface
- Tabular data presentation for easy scanning
- Inline editing capabilities for appointment modifications
- Clear visual indicators for appointment status
- Efficient navigation and filtering options

## Performance Considerations

- Minimal database queries through efficient SQL design
- Client-side validation to reduce server requests
- Optimized CSS and JavaScript for fast loading
- Proper indexing on frequently queried database fields
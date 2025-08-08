# Requirements Document

## Introduction

The car workshop appointment system is a web-based application designed to streamline the appointment booking process for a car workshop with 5 senior mechanics. The system addresses the problem of client-mechanic assignment chaos by allowing clients to book appointments online with their preferred mechanics, while ensuring each mechanic handles a maximum of 4 active appointments per day.

## Requirements

### Requirement 1

**User Story:** As a client, I want to book an appointment online with my preferred mechanic, so that I can avoid visiting the workshop physically and ensure I get the mechanic I want.

#### Acceptance Criteria

1. WHEN a client visits the web application THEN the system SHALL display a user-friendly appointment booking form
2. WHEN a client fills out their personal information THEN the system SHALL require name, address, phone, car license number, car engine number, and appointment date
3. WHEN a client selects an appointment date THEN the system SHALL display available mechanics with their current availability count
4. WHEN a client selects a mechanic THEN the system SHALL show how many free slots that mechanic has remaining for the selected date
5. WHEN a client submits the form THEN the system SHALL validate all required fields are completed

### Requirement 2

**User Story:** As a client, I want to see mechanic availability in real-time, so that I can make an informed decision about which mechanic to book.

#### Acceptance Criteria

1. WHEN the mechanic list is displayed THEN the system SHALL show each mechanic's name and available slots (out of 4 maximum)
2. WHEN a mechanic has 4 appointments for a date THEN the system SHALL mark that mechanic as unavailable for that date
3. WHEN a client selects a different date THEN the system SHALL update the mechanic availability display accordingly

### Requirement 3

**User Story:** As a client, I want the system to prevent double bookings, so that I don't accidentally book multiple appointments on the same date.

#### Acceptance Criteria

1. WHEN a client submits an appointment request THEN the system SHALL check if the client already has an appointment on that date
2. IF the client already has an appointment on the selected date THEN the system SHALL display an error message and prevent the booking
3. WHEN the client has no existing appointment on the date THEN the system SHALL proceed with the booking validation

### Requirement 4

**User Story:** As a client, I want to receive confirmation of my appointment, so that I know my booking was successful.

#### Acceptance Criteria

1. WHEN an appointment is successfully booked THEN the system SHALL display a confirmation message with appointment details
2. WHEN an appointment cannot be booked THEN the system SHALL display a clear error message explaining why
3. WHEN the selected mechanic is fully booked THEN the system SHALL notify the client and suggest alternative mechanics

### Requirement 5

**User Story:** As an admin, I want to view all appointments in a centralized dashboard, so that I can manage the workshop schedule effectively.

#### Acceptance Criteria

1. WHEN an admin accesses the admin panel THEN the system SHALL display a table of all appointments
2. WHEN displaying appointments THEN the system SHALL show client name, phone, car registration number, appointment date, and assigned mechanic
3. WHEN an admin views the appointment list THEN the system SHALL organize appointments by date and mechanic

### Requirement 6

**User Story:** As an admin, I want to modify existing appointments, so that I can handle schedule changes and optimize mechanic assignments.

#### Acceptance Criteria

1. WHEN an admin selects an appointment to edit THEN the system SHALL allow modification of appointment date and assigned mechanic
2. WHEN an admin changes a mechanic assignment THEN the system SHALL only show available mechanics for the selected date
3. WHEN an admin saves appointment changes THEN the system SHALL validate the new assignment doesn't exceed mechanic capacity
4. WHEN appointment changes are saved THEN the system SHALL update the database and refresh the appointment list

### Requirement 7

**User Story:** As a system user, I want proper form validation, so that only valid data is submitted to the system.

#### Acceptance Criteria

1. WHEN a user submits a form with empty required fields THEN the system SHALL display field-specific error messages
2. WHEN a user enters a phone number THEN the system SHALL validate it contains only numbers
3. WHEN a user enters a car engine number THEN the system SHALL validate it contains only numbers
4. WHEN a user selects an appointment date THEN the system SHALL validate it's a valid future date
5. WHEN a user submits without selecting a mechanic THEN the system SHALL require mechanic selection
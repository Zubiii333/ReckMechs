<?php
// Simple Appointment Booking API
// This API handles booking new appointments

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Step 1: Get form data from POST request
$client_name = $_POST['client_name'] ?? '';
$client_address = $_POST['client_address'] ?? '';
$client_phone = $_POST['client_phone'] ?? '';
$car_license = $_POST['car_license'] ?? '';
$car_engine = $_POST['car_engine'] ?? '';
$appointment_date = $_POST['appointment_date'] ?? '';
$mechanic_id = $_POST['mechanic_id'] ?? '';

// Step 2: Check if all required fields are filled
if (empty($client_name) || empty($client_address) || empty($client_phone) || 
    empty($car_license) || empty($car_engine) || empty($appointment_date) || empty($mechanic_id)) {
    
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Step 3: Validate phone number (only numbers allowed)
if (!is_numeric($client_phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'Phone number must contain only numbers'
    ]);
    exit;
}

// Step 4: Validate car engine number (only numbers allowed)
if (!is_numeric($car_engine)) {
    echo json_encode([
        'success' => false,
        'message' => 'Car engine number must contain only numbers'
    ]);
    exit;
}

// Step 5: Check if appointment date is in the future
$today = date('Y-m-d');
if ($appointment_date <= $today) {
    echo json_encode([
        'success' => false,
        'message' => 'Please select a future date for your appointment'
    ]);
    exit;
}

// Step 6: Check if mechanic exists
$stmt = $pdo->prepare("SELECT name FROM mechanics WHERE id = ?");
$stmt->execute([$mechanic_id]);
$mechanic = $stmt->fetch();

if (!$mechanic) {
    echo json_encode([
        'success' => false,
        'message' => 'Selected mechanic not found'
    ]);
    exit;
}

// Step 7: Check if client already has appointment on this date (prevent double booking)
$stmt = $pdo->prepare("SELECT id FROM appointments WHERE client_phone = ? AND appointment_date = ?");
$stmt->execute([$client_phone, $appointment_date]);
$existing = $stmt->fetch();

if ($existing) {
    echo json_encode([
        'success' => false,
        'message' => 'You already have an appointment on this date'
    ]);
    exit;
}

// Step 8: Check if mechanic has space (max 4 appointments per day)
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM appointments WHERE mechanic_id = ? AND appointment_date = ?");
$stmt->execute([$mechanic_id, $appointment_date]);
$result = $stmt->fetch();

if ($result['count'] >= 4) {
    echo json_encode([
        'success' => false,
        'message' => 'This mechanic is fully booked for this date. Please choose another mechanic or date.'
    ]);
    exit;
}

// Step 9: Save the appointment to database
$stmt = $pdo->prepare("
    INSERT INTO appointments (client_name, client_address, client_phone, car_license, car_engine, appointment_date, mechanic_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$success = $stmt->execute([$client_name, $client_address, $client_phone, $car_license, $car_engine, $appointment_date, $mechanic_id]);

// Step 10: Return response
if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Appointment booked successfully!',
        'appointment' => [
            'client_name' => $client_name,
            'appointment_date' => $appointment_date,
            'mechanic_name' => $mechanic['name']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to book appointment. Please try again.'
    ]);
}
?>
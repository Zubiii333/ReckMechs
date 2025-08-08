<?php
// Simple Update Appointment API
// This API updates existing appointments from admin panel

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/database.php';

// Step 1: Get form data from admin panel
$appointment_id = $_POST['appointment_id'] ?? '';
$client_name = $_POST['client_name'] ?? '';
$client_phone = $_POST['client_phone'] ?? '';
$car_license = $_POST['car_license'] ?? '';
$car_engine = $_POST['car_engine'] ?? '';
$appointment_date = $_POST['appointment_date'] ?? '';
$mechanic_id = $_POST['mechanic_id'] ?? '';

// Step 2: Check if appointment ID is provided
if (empty($appointment_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Appointment ID is required'
    ]);
    exit;
}

// Step 3: Check if appointment exists
$stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ?");
$stmt->execute([$appointment_id]);
$appointment = $stmt->fetch();

if (!$appointment) {
    echo json_encode([
        'success' => false,
        'message' => 'Appointment not found'
    ]);
    exit;
}

// Step 4: Validate required fields
if (empty($client_name) || empty($client_phone) || empty($car_license) || 
    empty($car_engine) || empty($appointment_date) || empty($mechanic_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Step 5: Validate phone number (only numbers)
if (!is_numeric($client_phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'Phone number must contain only numbers'
    ]);
    exit;
}

// Step 6: Validate car engine number (only numbers)
if (!is_numeric($car_engine)) {
    echo json_encode([
        'success' => false,
        'message' => 'Car engine number must contain only numbers'
    ]);
    exit;
}

// Step 7: Validate appointment date (not in the past)
$today = date('Y-m-d');
if ($appointment_date < $today) {
    echo json_encode([
        'success' => false,
        'message' => 'Appointment date cannot be in the past'
    ]);
    exit;
}

// Step 8: Check if mechanic exists
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

// Step 9: Check if mechanic has space on the new date (max 4 appointments per day)
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM appointments WHERE mechanic_id = ? AND appointment_date = ? AND id != ?");
$stmt->execute([$mechanic_id, $appointment_date, $appointment_id]);
$result = $stmt->fetch();

if ($result['count'] >= 4) {
    echo json_encode([
        'success' => false,
        'message' => 'This mechanic is fully booked for this date. Please choose another mechanic or date.'
    ]);
    exit;
}

// Step 10: Check for duplicate booking (same client phone on same date, different appointment)
$stmt = $pdo->prepare("SELECT id FROM appointments WHERE client_phone = ? AND appointment_date = ? AND id != ?");
$stmt->execute([$client_phone, $appointment_date, $appointment_id]);
$duplicate = $stmt->fetch();

if ($duplicate) {
    echo json_encode([
        'success' => false,
        'message' => 'This client already has an appointment on this date'
    ]);
    exit;
}

// Step 11: Update the appointment
$stmt = $pdo->prepare("
    UPDATE appointments 
    SET client_name = ?, client_phone = ?, car_license = ?, car_engine = ?, 
        appointment_date = ?, mechanic_id = ?
    WHERE id = ?
");

$success = $stmt->execute([
    $client_name, $client_phone, $car_license, $car_engine, 
    $appointment_date, $mechanic_id, $appointment_id
]);

// Step 12: Return response
if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Appointment updated successfully',
        'appointment' => [
            'id' => $appointment_id,
            'client_name' => $client_name,
            'appointment_date' => $appointment_date,
            'mechanic_name' => $mechanic['name']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update appointment'
    ]);
}

} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
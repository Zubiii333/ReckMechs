<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/database.php';

$appointment_id = $_POST['appointment_id'] ?? '';
$client_name = $_POST['client_name'] ?? '';
$client_phone = $_POST['client_phone'] ?? '';
$car_license = $_POST['car_license'] ?? '';
$car_engine = $_POST['car_engine'] ?? '';
$appointment_date = $_POST['appointment_date'] ?? '';
$mechanic_id = $_POST['mechanic_id'] ?? '';

if (empty($appointment_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Appointment ID is required'
    ]);
    exit;
}

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

if (empty($client_name) || empty($client_phone) || empty($car_license) || 
    empty($car_engine) || empty($appointment_date) || empty($mechanic_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

if (!is_numeric($client_phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'Phone number must contain only numbers'
    ]);
    exit;
}

if (!is_numeric($car_engine)) {
    echo json_encode([
        'success' => false,
        'message' => 'Car engine number must contain only numbers'
    ]);
    exit;
}

$today = date('Y-m-d');
if ($appointment_date < $today) {
    echo json_encode([
        'success' => false,
        'message' => 'Appointment date cannot be in the past'
    ]);
    exit;
}

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
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
<?php
// Simple Get Mechanics API
// This API shows available mechanics for a specific date

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Step 1: Get the date from the request
$date = $_GET['date'] ?? '';

// Step 2: Check if date is provided
if (empty($date)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a date'
    ]);
    exit;
}

// Step 3: Check if date is in the future
$today = date('Y-m-d');
if ($date <= $today) {
    echo json_encode([
        'success' => false,
        'message' => 'Please select a future date'
    ]);
    exit;
}

// Step 4: Get all mechanics
$stmt = $pdo->query("SELECT id, name, specialization FROM mechanics ORDER BY name");
$mechanics = $stmt->fetchAll();

// Step 5: For each mechanic, count how many appointments they have on this date
$mechanics_with_availability = [];

foreach ($mechanics as $mechanic) {
    // Count appointments for this mechanic on the selected date
    $stmt = $pdo->prepare("SELECT COUNT(*) as booked FROM appointments WHERE mechanic_id = ? AND appointment_date = ?");
    $stmt->execute([$mechanic['id'], $date]);
    $result = $stmt->fetch();
    
    $booked_count = $result['booked'];
    $available_slots = 4 - $booked_count; // Each mechanic can handle max 4 appointments
    
    // Add mechanic info with availability
    $mechanics_with_availability[] = [
        'id' => $mechanic['id'],
        'name' => $mechanic['name'],
        'specialization' => $mechanic['specialization'],
        'booked_today' => $booked_count,
        'available_slots' => $available_slots,
        'is_available' => $available_slots > 0
    ];
}

// Step 6: Return the mechanics list
echo json_encode([
    'success' => true,
    'date' => $date,
    'mechanics' => $mechanics_with_availability
]);
?>
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$date = $_GET['date'] ?? '';
if (empty($date)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a date'
    ]);
    exit;
}

$today = date('Y-m-d');
if ($date <= $today) {
    echo json_encode([
        'success' => false,
        'message' => 'Please select a future date'
    ]);
    exit;
}

$stmt = $pdo->query("SELECT id, name, specialization FROM mechanics ORDER BY name");
$mechanics = $stmt->fetchAll();

$mechanics_with_availability = [];

foreach ($mechanics as $mechanic) {
    $stmt = $pdo->prepare("SELECT COUNT(*) as booked FROM appointments WHERE mechanic_id = ? AND appointment_date = ?");
    $stmt->execute([$mechanic['id'], $date]);
    $result = $stmt->fetch();
    
    $booked_count = $result['booked'];
    $available_slots = 4 - $booked_count;
    
    $mechanics_with_availability[] = [
        'id' => $mechanic['id'],
        'name' => $mechanic['name'],
        'specialization' => $mechanic['specialization'],
        'booked_today' => $booked_count,
        'available_slots' => $available_slots,
        'is_available' => $available_slots > 0
    ];
}

echo json_encode([
    'success' => true,
    'date' => $date,
    'mechanics' => $mechanics_with_availability
]);
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/database.php';

    // Step 1: Get all appointments with mechanic details (LEFT JOIN to handle missing mechanics)
    $stmt = $pdo->query("
        SELECT 
            a.id,
            a.client_name,
            a.client_address,
            a.client_phone,
            a.car_license,
            a.car_engine,
            a.appointment_date,
            a.mechanic_id,
            a.created_at,
            COALESCE(m.name, 'Unknown Mechanic') as mechanic_name,
            COALESCE(m.specialization, 'General') as mechanic_specialization
        FROM appointments a
        LEFT JOIN mechanics m ON a.mechanic_id = m.id
        ORDER BY a.appointment_date ASC
    ");

    $appointments = $stmt->fetchAll();

// Step 2: Format appointments for admin panel display
$formatted_appointments = [];
foreach ($appointments as $appointment) {
    $formatted_appointments[] = [
        'id' => $appointment['id'],
        'client_name' => $appointment['client_name'],
        'client_address' => $appointment['client_address'],
        'client_phone' => $appointment['client_phone'],
        'car_license' => $appointment['car_license'],
        'car_engine' => $appointment['car_engine'],
        'appointment_date' => $appointment['appointment_date'],
        'mechanic_id' => $appointment['mechanic_id'],
        'mechanic_name' => $appointment['mechanic_name'],
        'status' => 'confirmed' // Default status for display
    ];
}

// Step 3: Count total appointments
$total_count = count($appointments);

    // Step 4: Return the appointments list
    echo json_encode([
        'success' => true,
        'appointments' => $formatted_appointments,
        'total_count' => $total_count
    ]);

} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'message' => 'Error loading appointments: ' . $e->getMessage(),
        'appointments' => [],
        'total_count' => 0
    ]);
}
?>
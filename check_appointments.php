<?php
require 'backend/config/database.php';

echo "Current appointments in database:\n";
echo "================================\n";

$appointments = $pdo->query('SELECT * FROM appointments ORDER BY appointment_date')->fetchAll();
foreach($appointments as $apt) {
    echo "Date: {$apt['appointment_date']} - Mechanic ID: {$apt['mechanic_id']} - Client: {$apt['client_name']}\n";
}

echo "\nChecking availability for August 11, 2025:\n";
echo "==========================================\n";

$target_date = '2025-08-11';
$mechanics = $pdo->query('SELECT id, name FROM mechanics')->fetchAll();

foreach($mechanics as $mechanic) {
    $booked_count = $pdo->prepare('SELECT COUNT(*) FROM appointments WHERE mechanic_id = ? AND appointment_date = ?');
    $booked_count->execute([$mechanic['id'], $target_date]);
    $bookings = $booked_count->fetchColumn();
    $available = 4 - $bookings;
    echo "Mechanic {$mechanic['name']}: {$bookings} bookings, {$available} slots available\n";
}
?>
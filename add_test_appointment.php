<?php
require 'backend/config/database.php';

echo "Adding test appointment...\n";

// Add a test appointment
$stmt = $pdo->prepare("INSERT INTO appointments (client_name, client_address, client_phone, car_license, car_engine, appointment_date, mechanic_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
$result = $stmt->execute([
    'John Doe',
    '123 Test Street, Test City',
    '1234567890',
    'TEST123',
    '987654321',
    '2025-08-15',
    1
]);

if ($result) {
    echo "✅ Test appointment added successfully!\n";
    
    // Verify the appointment
    $appointments = $pdo->query("SELECT a.*, m.name as mechanic_name FROM appointments a JOIN mechanics m ON a.mechanic_id = m.id")->fetchAll();
    echo "\nCurrent appointments:\n";
    foreach ($appointments as $apt) {
        echo "- {$apt['client_name']} on {$apt['appointment_date']} with {$apt['mechanic_name']}\n";
    }
} else {
    echo "❌ Failed to add test appointment\n";
}
?>
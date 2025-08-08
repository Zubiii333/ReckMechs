<?php
echo "Testing admin panel APIs...\n";

echo "\n1. Testing get_appointments API:\n";
echo "================================\n";

ob_start();
require 'backend/api/get_appointments.php';
$appointments_output = ob_get_clean();

echo "Response: " . $appointments_output . "\n";

$appointments_data = json_decode($appointments_output, true);
if ($appointments_data && $appointments_data['success']) {
    echo "✅ Appointments API working\n";
    echo "Found " . count($appointments_data['appointments']) . " appointments\n";
    
    foreach ($appointments_data['appointments'] as $apt) {
        echo "- ID: {$apt['id']}, Client: {$apt['client_name']}, Mechanic ID: {$apt['mechanic_id']}\n";
        if (isset($apt['mechanic_name'])) {
            echo "  Mechanic Name: {$apt['mechanic_name']}\n";
        } else {
            echo "  ❌ Missing mechanic_name field\n";
        }
    }
} else {
    echo "❌ Appointments API failed\n";
}

echo "\n2. Testing get_mechanics API (without date):\n";
echo "===========================================\n";

// Test mechanics API without date parameter (for admin panel)
ob_start();
$_GET = []; // Clear GET parameters
require 'backend/api/get_mechanics.php';
$mechanics_output = ob_get_clean();

echo "Response: " . $mechanics_output . "\n";
?>
<?php
echo "🔧 Complete Admin Panel API Test\n";
echo "================================\n\n";

// Test 1: Get All Mechanics API
echo "1. Testing get_all_mechanics.php:\n";
echo "---------------------------------\n";

ob_start();
require 'backend/api/get_all_mechanics.php';
$mechanics_output = ob_get_clean();

echo "Response: " . $mechanics_output . "\n";

$mechanics_data = json_decode($mechanics_output, true);
if ($mechanics_data && $mechanics_data['success']) {
    echo "✅ Mechanics API working - Found " . count($mechanics_data['mechanics']) . " mechanics\n";
    foreach ($mechanics_data['mechanics'] as $mechanic) {
        echo "  - ID: {$mechanic['id']}, Name: {$mechanic['name']}, Specialization: {$mechanic['specialization']}\n";
    }
} else {
    echo "❌ Mechanics API failed\n";
}

echo "\n2. Testing get_appointments.php:\n";
echo "--------------------------------\n";

ob_start();
require 'backend/api/get_appointments.php';
$appointments_output = ob_get_clean();

echo "Response: " . $appointments_output . "\n";

$appointments_data = json_decode($appointments_output, true);
if ($appointments_data && $appointments_data['success']) {
    echo "✅ Appointments API working - Found " . count($appointments_data['appointments']) . " appointments\n";
    foreach ($appointments_data['appointments'] as $apt) {
        echo "  - ID: {$apt['id']}, Client: {$apt['client_name']}, Mechanic: {$apt['mechanic_name']}\n";
    }
} else {
    echo "❌ Appointments API failed\n";
}

echo "\n3. Summary:\n";
echo "----------\n";
if ($mechanics_data['success'] && $appointments_data['success']) {
    echo "✅ All APIs working correctly!\n";
    echo "📱 Admin panel should now show:\n";
    echo "   - Mechanic dropdowns with " . count($mechanics_data['mechanics']) . " options\n";
    echo "   - " . count($appointments_data['appointments']) . " appointments in the table\n";
    echo "   - Edit functionality should work\n";
} else {
    echo "❌ Some APIs are not working properly\n";
}

echo "\n🌐 Visit: http://localhost:8080/admin.html\n";
?>
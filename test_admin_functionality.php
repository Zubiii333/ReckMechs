<?php
/**
 * Admin Panel Functionality Test Script
 * Tests all admin panel features according to task 9.2 requirements
 */

echo "🔧 Car Workshop Admin Panel Test Suite\n";
echo "=====================================\n\n";

$base_url = 'http://localhost:8080';
$test_results = [];

// Test helper function
function runTest($testName, $testFunction) {
    global $test_results;
    echo "Testing: $testName... ";
    
    try {
        $result = $testFunction();
        if ($result['success']) {
            echo "✅ PASS\n";
            if (isset($result['details'])) {
                echo "   Details: " . $result['details'] . "\n";
            }
            $test_results['passed']++;
        } else {
            echo "❌ FAIL\n";
            echo "   Error: " . $result['error'] . "\n";
            $test_results['failed']++;
        }
    } catch (Exception $e) {
        echo "❌ FAIL\n";
        echo "   Exception: " . $e->getMessage() . "\n";
        $test_results['failed']++;
    }
    echo "\n";
}

// Initialize test results
$test_results = ['passed' => 0, 'failed' => 0];

// Test 1: Appointment Display and Data Accuracy
echo "📊 Test Section 1: Appointment Display and Data Accuracy\n";
echo "--------------------------------------------------------\n";

runTest("1.1 Load appointments from API", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    if ($response === false) {
        return ['success' => false, 'error' => 'Failed to connect to API'];
    }
    
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['success' => false, 'error' => 'Invalid JSON response: ' . json_last_error_msg()];
    }
    
    if (!isset($data['success']) || !$data['success']) {
        return ['success' => false, 'error' => 'API returned error: ' . ($data['message'] ?? 'Unknown error')];
    }
    
    if (!isset($data['appointments']) || !is_array($data['appointments'])) {
        return ['success' => false, 'error' => 'Appointments data not found or invalid'];
    }
    
    return [
        'success' => true, 
        'details' => 'Loaded ' . count($data['appointments']) . ' appointments successfully'
    ];
});

runTest("1.2 Verify appointment data accuracy", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    
    if (!$data['success'] || empty($data['appointments'])) {
        return ['success' => false, 'error' => 'No appointment data to verify'];
    }
    
    $appointment = $data['appointments'][0];
    $required_fields = ['id', 'client_name', 'client_phone', 'car_license', 'car_engine', 'appointment_date', 'mechanic_id'];
    
    foreach ($required_fields as $field) {
        if (!isset($appointment[$field])) {
            return ['success' => false, 'error' => "Missing required field: $field"];
        }
    }
    
    // Validate data types and formats
    if (!is_numeric($appointment['id'])) {
        return ['success' => false, 'error' => 'ID should be numeric'];
    }
    
    if (!is_numeric($appointment['client_phone'])) {
        return ['success' => false, 'error' => 'Phone should be numeric'];
    }
    
    if (!is_numeric($appointment['car_engine'])) {
        return ['success' => false, 'error' => 'Car engine should be numeric'];
    }
    
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $appointment['appointment_date'])) {
        return ['success' => false, 'error' => 'Date format should be YYYY-MM-DD'];
    }
    
    return [
        'success' => true, 
        'details' => 'All required fields present and properly formatted'
    ];
});

runTest("1.3 Test statistics calculation", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    
    if (!$data['success']) {
        return ['success' => false, 'error' => 'Cannot test stats without appointment data'];
    }
    
    $total_appointments = count($data['appointments']);
    $today = date('Y-m-d');
    $today_appointments = 0;
    
    foreach ($data['appointments'] as $appointment) {
        if ($appointment['appointment_date'] === $today) {
            $today_appointments++;
        }
    }
    
    // Test mechanics API
    $mechanics_response = file_get_contents("$base_url/backend/api/get_mechanics.php");
    $mechanics_data = json_decode($mechanics_response, true);
    $available_mechanics = $mechanics_data['success'] ? count($mechanics_data['mechanics']) : 0;
    
    return [
        'success' => true,
        'details' => "Total: $total_appointments, Today: $today_appointments, Mechanics: $available_mechanics"
    ];
});

runTest("1.4 Test mechanic data loading", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_mechanics.php");
    if ($response === false) {
        return ['success' => false, 'error' => 'Failed to load mechanics API'];
    }
    
    $data = json_decode($response, true);
    if (!$data['success'] || !isset($data['mechanics'])) {
        return ['success' => false, 'error' => 'Mechanics data not available'];
    }
    
    if (count($data['mechanics']) < 5) {
        return ['success' => false, 'error' => 'Should have at least 5 mechanics'];
    }
    
    return [
        'success' => true,
        'details' => 'Loaded ' . count($data['mechanics']) . ' mechanics successfully'
    ];
});

// Test 2: Appointment Modification and Update Functionality
echo "✏️ Test Section 2: Appointment Modification and Update Functionality\n";
echo "--------------------------------------------------------------------\n";

runTest("2.1 Test update API with valid data", function() use ($base_url) {
    // First get an appointment to update
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    
    if (!$data['success'] || empty($data['appointments'])) {
        return ['success' => false, 'error' => 'No appointments available for testing'];
    }
    
    $appointment = $data['appointments'][0];
    
    // Prepare update data
    $post_data = http_build_query([
        'appointment_id' => $appointment['id'],
        'client_name' => $appointment['client_name'],
        'client_phone' => $appointment['client_phone'],
        'car_license' => $appointment['car_license'],
        'car_engine' => $appointment['car_engine'],
        'appointment_date' => $appointment['appointment_date'],
        'mechanic_id' => $appointment['mechanic_id']
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    if ($update_response === false) {
        return ['success' => false, 'error' => 'Failed to call update API'];
    }
    
    $update_data = json_decode($update_response, true);
    if (!$update_data['success']) {
        return ['success' => false, 'error' => 'Update failed: ' . ($update_data['message'] ?? 'Unknown error')];
    }
    
    return [
        'success' => true,
        'details' => 'Update API working correctly'
    ];
});

runTest("2.2 Test validation with invalid phone number", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    $appointment = $data['appointments'][0];
    
    $post_data = http_build_query([
        'appointment_id' => $appointment['id'],
        'client_name' => $appointment['client_name'],
        'client_phone' => 'invalid_phone', // Invalid phone
        'car_license' => $appointment['car_license'],
        'car_engine' => $appointment['car_engine'],
        'appointment_date' => $appointment['appointment_date'],
        'mechanic_id' => $appointment['mechanic_id']
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    $update_data = json_decode($update_response, true);
    
    if ($update_data['success']) {
        return ['success' => false, 'error' => 'Should have rejected invalid phone number'];
    }
    
    return [
        'success' => true,
        'details' => 'Validation correctly rejected invalid phone: ' . $update_data['message']
    ];
});

runTest("2.3 Test validation with invalid car engine", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    $appointment = $data['appointments'][0];
    
    $post_data = http_build_query([
        'appointment_id' => $appointment['id'],
        'client_name' => $appointment['client_name'],
        'client_phone' => $appointment['client_phone'],
        'car_license' => $appointment['car_license'],
        'car_engine' => 'invalid_engine', // Invalid engine
        'appointment_date' => $appointment['appointment_date'],
        'mechanic_id' => $appointment['mechanic_id']
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    $update_data = json_decode($update_response, true);
    
    if ($update_data['success']) {
        return ['success' => false, 'error' => 'Should have rejected invalid car engine'];
    }
    
    return [
        'success' => true,
        'details' => 'Validation correctly rejected invalid engine: ' . $update_data['message']
    ];
});

runTest("2.4 Test validation with past date", function() use ($base_url) {
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $data = json_decode($response, true);
    $appointment = $data['appointments'][0];
    
    $post_data = http_build_query([
        'appointment_id' => $appointment['id'],
        'client_name' => $appointment['client_name'],
        'client_phone' => $appointment['client_phone'],
        'car_license' => $appointment['car_license'],
        'car_engine' => $appointment['car_engine'],
        'appointment_date' => '2020-01-01', // Past date
        'mechanic_id' => $appointment['mechanic_id']
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    $update_data = json_decode($update_response, true);
    
    if ($update_data['success']) {
        return ['success' => false, 'error' => 'Should have rejected past date'];
    }
    
    return [
        'success' => true,
        'details' => 'Validation correctly rejected past date: ' . $update_data['message']
    ];
});

// Test 3: Error Handling and Success Feedback
echo "⚠️ Test Section 3: Error Handling and Success Feedback\n";
echo "------------------------------------------------------\n";

runTest("3.1 Test invalid appointment ID", function() use ($base_url) {
    $post_data = http_build_query([
        'appointment_id' => 999999, // Non-existent ID
        'client_name' => 'Test Client',
        'client_phone' => '1234567890',
        'car_license' => 'TEST123',
        'car_engine' => '123456',
        'appointment_date' => date('Y-m-d', strtotime('+1 day')),
        'mechanic_id' => 1
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    $update_data = json_decode($update_response, true);
    
    if ($update_data['success']) {
        return ['success' => false, 'error' => 'Should have rejected invalid appointment ID'];
    }
    
    return [
        'success' => true,
        'details' => 'Correctly handled invalid ID: ' . $update_data['message']
    ];
});

runTest("3.2 Test missing required fields", function() use ($base_url) {
    $post_data = http_build_query([
        'appointment_id' => 1,
        'client_name' => '', // Empty required field
        'client_phone' => '1234567890',
        'car_license' => 'TEST123',
        'car_engine' => '123456',
        'appointment_date' => date('Y-m-d', strtotime('+1 day')),
        'mechanic_id' => 1
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $post_data
        ]
    ]);
    
    $update_response = file_get_contents("$base_url/backend/api/update_appointment.php", false, $context);
    $update_data = json_decode($update_response, true);
    
    if ($update_data['success']) {
        return ['success' => false, 'error' => 'Should have rejected empty required field'];
    }
    
    return [
        'success' => true,
        'details' => 'Correctly handled missing field: ' . $update_data['message']
    ];
});

runTest("3.3 Test invalid API endpoint", function() use ($base_url) {
    $response = @file_get_contents("$base_url/backend/api/invalid_endpoint.php");
    
    if ($response === false) {
        return [
            'success' => true,
            'details' => 'Correctly handled invalid endpoint (404 or connection error)'
        ];
    }
    
    $data = json_decode($response, true);
    if (isset($data['success']) && !$data['success']) {
        return [
            'success' => true,
            'details' => 'API correctly returned error for invalid endpoint'
        ];
    }
    
    return ['success' => false, 'error' => 'Invalid endpoint should return error'];
});

runTest("3.4 Test API response time", function() use ($base_url) {
    $start_time = microtime(true);
    $response = file_get_contents("$base_url/backend/api/get_appointments.php");
    $end_time = microtime(true);
    
    $response_time = ($end_time - $start_time) * 1000; // Convert to milliseconds
    
    if ($response === false) {
        return ['success' => false, 'error' => 'API request failed'];
    }
    
    if ($response_time > 5000) { // 5 seconds
        return ['success' => false, 'error' => "Response too slow: {$response_time}ms"];
    }
    
    return [
        'success' => true,
        'details' => sprintf('Response time: %.2fms (acceptable)', $response_time)
    ];
});

// Test Summary
echo "📈 Test Summary\n";
echo "===============\n";
echo "Total Tests: " . ($test_results['passed'] + $test_results['failed']) . "\n";
echo "✅ Passed: " . $test_results['passed'] . "\n";
echo "❌ Failed: " . $test_results['failed'] . "\n";

if ($test_results['failed'] === 0) {
    echo "\n🎉 All tests passed! Admin panel functionality is working correctly.\n";
} else {
    echo "\n⚠️  Some tests failed. Please review the errors above.\n";
}

echo "\n🌐 Admin Panel URL: $base_url/admin.html\n";
echo "📚 API Documentation: $base_url/backend/API_DOCUMENTATION.md\n";
?>
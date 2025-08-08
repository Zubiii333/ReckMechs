<?php
echo "Testing fixed get_mechanics API...\n";

// Test the API directly
$_GET['date'] = '2025-08-12'; // Tuesday, August 12, 2025 from the screenshot

// Capture the output
ob_start();
require 'backend/api/get_mechanics.php';
$api_output = ob_get_clean();

echo "API Response:\n";
echo $api_output . "\n";

// Parse the JSON
$data = json_decode($api_output, true);
if ($data) {
    echo "\nParsed Data:\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "Date: " . ($data['date'] ?? 'not set') . "\n";
    
    if (isset($data['mechanics'])) {
        echo "Mechanics count: " . count($data['mechanics']) . "\n";
        foreach ($data['mechanics'] as $mechanic) {
            echo "- {$mechanic['name']}: {$mechanic['available_slots']}/4 available\n";
        }
    }
} else {
    echo "Failed to parse JSON response\n";
}
?>
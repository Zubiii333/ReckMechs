<?php
// Add Mechanic API Endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

try {
    // Get POST data
    $name = trim($_POST['name'] ?? '');
    $specialization = trim($_POST['specialization'] ?? '');

    // Validate input
    if (empty($name)) {
        echo json_encode([
            'success' => false,
            'message' => 'Mechanic name is required'
        ]);
        exit();
    }

    if (empty($specialization)) {
        echo json_encode([
            'success' => false,
            'message' => 'Specialization is required'
        ]);
        exit();
    }

    // Check if mechanic with same name already exists
    $checkStmt = $pdo->prepare("SELECT id FROM mechanics WHERE name = ?");
    $checkStmt->execute([$name]);
    
    if ($checkStmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'A mechanic with this name already exists'
        ]);
        exit();
    }

    // Insert new mechanic
    $stmt = $pdo->prepare("INSERT INTO mechanics (name, specialization) VALUES (?, ?)");
    $result = $stmt->execute([$name, $specialization]);

    if ($result) {
        $mechanicId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Mechanic added successfully',
            'mechanic' => [
                'id' => $mechanicId,
                'name' => $name,
                'specialization' => $specialization
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add mechanic'
        ]);
    }

} catch (PDOException $e) {
    error_log("Database error in add_mechanic.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General error in add_mechanic.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while adding the mechanic'
    ]);
}
?>
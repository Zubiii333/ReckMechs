<?php
// Update Mechanic API Endpoint
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
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $specialization = trim($_POST['specialization'] ?? '');

    // Validate input
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid mechanic ID'
        ]);
        exit();
    }

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

    // Create database connection
    $pdo = new PDO($dsn, $username, $password, $options);

    // Check if mechanic exists
    $checkStmt = $pdo->prepare("SELECT id FROM mechanics WHERE id = ?");
    $checkStmt->execute([$id]);
    
    if (!$checkStmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Mechanic not found'
        ]);
        exit();
    }

    // Check if another mechanic with same name exists (excluding current mechanic)
    $duplicateStmt = $pdo->prepare("SELECT id FROM mechanics WHERE name = ? AND id != ?");
    $duplicateStmt->execute([$name, $id]);
    
    if ($duplicateStmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'A mechanic with this name already exists'
        ]);
        exit();
    }

    // Update mechanic
    $stmt = $pdo->prepare("UPDATE mechanics SET name = ?, specialization = ? WHERE id = ?");
    $result = $stmt->execute([$name, $specialization, $id]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Mechanic updated successfully',
            'mechanic' => [
                'id' => $id,
                'name' => $name,
                'specialization' => $specialization
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update mechanic'
        ]);
    }

} catch (PDOException $e) {
    error_log("Database error in update_mechanic.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General error in update_mechanic.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating the mechanic'
    ]);
}
?>
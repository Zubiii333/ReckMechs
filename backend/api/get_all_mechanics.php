<?php
// Get All Mechanics API Endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

try {
    // Get all mechanics
    $stmt = $pdo->prepare("SELECT id, name, specialization FROM mechanics ORDER BY name");
    $stmt->execute();
    
    $mechanics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'mechanics' => $mechanics,
        'count' => count($mechanics)
    ]);

} catch (PDOException $e) {
    error_log("Database error in get_all_mechanics.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'mechanics' => []
    ]);
} catch (Exception $e) {
    error_log("General error in get_all_mechanics.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching mechanics',
        'mechanics' => []
    ]);
}
?>
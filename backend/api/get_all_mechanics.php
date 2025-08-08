<?php
// Simple Get All Mechanics API
// This API returns all mechanics without date restrictions (for admin panel)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/database.php';

    // Get all mechanics
    $stmt = $pdo->query("SELECT id, name, specialization FROM mechanics ORDER BY name");
    $mechanics = $stmt->fetchAll();

    // Return the mechanics list
    echo json_encode([
        'success' => true,
        'mechanics' => $mechanics
    ]);

} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'message' => 'Error loading mechanics: ' . $e->getMessage(),
        'mechanics' => []
    ]);
}
?>
<?php
// Add Mechanic API
// This API adds new mechanics from admin panel

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/database.php';

    // Get form data
    $name = $_POST['name'] ?? '';
    $specialization = $_POST['specialization'] ?? '';

    // Validate required fields
    if (empty($name)) {
        echo json_encode([
            'success' => false,
            'message' => 'Mechanic name is required'
        ]);
        exit;
    }

    if (empty($specialization)) {
        echo json_encode([
            'success' => false,
            'message' => 'Specialization is required'
        ]);
        exit;
    }

    // Check if mechanic with same name already exists
    $stmt = $pdo->prepare("SELECT id FROM mechanics WHERE name = ?");
    $stmt->execute([$name]);
    $existing = $stmt->fetch();

    if ($existing) {
        echo json_encode([
            'success' => false,
            'message' => 'A mechanic with this name already exists'
        ]);
        exit;
    }

    // Insert new mechanic
    $stmt = $pdo->prepare("INSERT INTO mechanics (name, specialization) VALUES (?, ?)");
    $success = $stmt->execute([$name, $specialization]);

    if ($success) {
        $mechanic_id = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Mechanic added successfully',
            'mechanic' => [
                'id' => $mechanic_id,
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

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
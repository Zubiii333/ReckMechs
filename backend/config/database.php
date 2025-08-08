<?php
/**
 * Simple Database Configuration
 * Car Workshop Appointment System - Single Database File
 */

// Database path
$db_path = __DIR__ . '/workshop.db';

// Connect to SQLite database
try {
    $pdo = new PDO('sqlite:' . $db_path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]));
}

// Create tables if they don't exist
$pdo->exec("
    CREATE TABLE IF NOT EXISTS mechanics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL
    )
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name VARCHAR(100) NOT NULL,
        client_address TEXT NOT NULL,
        client_phone VARCHAR(20) NOT NULL,
        car_license VARCHAR(50) NOT NULL,
        car_engine VARCHAR(50) NOT NULL,
        appointment_date DATE NOT NULL,
        mechanic_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
");

// Initialize with sample data if tables are empty
$mechanic_count = $pdo->query("SELECT COUNT(*) FROM mechanics")->fetchColumn();
if ($mechanic_count == 0) {
    $mechanics = [
        ['Md. Joshim', 'Engine Specialist'],
        ['Rashed Talukdar', 'Transmission Expert'],
        ['David Kamal', 'Brake Systems'],
        ['Fakrul Uddin', 'Electrical Systems'],
        ['Manik Mia', 'General Maintenance']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO mechanics (name, specialization) VALUES (?, ?)");
    foreach ($mechanics as $mechanic) {
        $stmt->execute($mechanic);
    }
    
    // No sample appointments - start with clean slate
}
?>
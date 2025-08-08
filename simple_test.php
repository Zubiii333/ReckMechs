<?php
echo "Testing database connection...\n";

try {
    require 'backend/config/database.php';
    echo "✅ Database connected successfully!\n";
    
    $mechanics_count = $pdo->query('SELECT COUNT(*) FROM mechanics')->fetchColumn();
    echo "✅ Mechanics table: $mechanics_count records\n";
    
    $appointments_count = $pdo->query('SELECT COUNT(*) FROM appointments')->fetchColumn();
    echo "✅ Appointments table: $appointments_count records\n";
    
    // Show mechanic availability
    echo "\nMechanic availability:\n";
    $mechanics = $pdo->query('SELECT id, name FROM mechanics')->fetchAll();
    foreach ($mechanics as $mechanic) {
        $booked_count = $pdo->prepare('SELECT COUNT(*) FROM appointments WHERE mechanic_id = ? AND appointment_date = ?');
        $booked_count->execute([$mechanic['id'], date('Y-m-d')]);
        $today_bookings = $booked_count->fetchColumn();
        $available_slots = 4 - $today_bookings;
        echo "- {$mechanic['name']}: $available_slots slots available today\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
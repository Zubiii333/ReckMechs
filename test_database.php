<?php
require 'backend/config/database.php';

echo "Database initialized successfully!" . PHP_EOL;
echo "Mechanics: " . $pdo->query('SELECT COUNT(*) FROM mechanics')->fetchColumn() . PHP_EOL;
echo "Appointments: " . $pdo->query('SELECT COUNT(*) FROM appointments')->fetchColumn() . PHP_EOL;

// Test a sample query
$mechanics = $pdo->query('SELECT name, specialization FROM mechanics LIMIT 3')->fetchAll();
echo "\nSample mechanics:" . PHP_EOL;
foreach ($mechanics as $mechanic) {
    echo "- {$mechanic['name']} ({$mechanic['specialization']})" . PHP_EOL;
}
?>
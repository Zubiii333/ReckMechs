<?php
// Simple PHP Router for Car Workshop API
// This handles routing for the backend APIs

// Set CORS headers for all requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI and remove query string
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route API requests
if (strpos($request_uri, '/backend/api/') === 0) {
    // Extract the API endpoint
    $api_path = str_replace('/backend/api/', '', $request_uri);
    
    switch ($api_path) {
        case 'get_appointments.php':
        case 'get_appointments':
            require_once __DIR__ . '/api/get_appointments.php';
            break;
            
        case 'get_mechanics.php':
        case 'get_mechanics':
            require_once __DIR__ . '/api/get_mechanics.php';
            break;
            
        case 'get_all_mechanics.php':
        case 'get_all_mechanics':
            require_once __DIR__ . '/api/get_all_mechanics.php';
            break;
            
        case 'book_appointment.php':
        case 'book_appointment':
            require_once __DIR__ . '/api/book_appointment.php';
            break;
            
        case 'update_appointment.php':
        case 'update_appointment':
            require_once __DIR__ . '/api/update_appointment.php';
            break;
            
        case 'add_mechanic.php':
        case 'add_mechanic':
            require_once __DIR__ . '/api/add_mechanic.php';
            break;
            
        default:
            header('Content-Type: application/json');
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'API endpoint not found: ' . $api_path
            ]);
            break;
    }
    exit();
}

// Serve static files from frontend directory
if (strpos($request_uri, '/frontend/') === 0) {
    $file_path = __DIR__ . '/../' . $request_uri;
    if (file_exists($file_path) && is_file($file_path)) {
        $mime_type = mime_content_type($file_path);
        header('Content-Type: ' . $mime_type);
        readfile($file_path);
        exit();
    }
}

// Handle direct static file requests (css, js, images) - Enhanced for Railway
$static_extensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'];
$path_extension = pathinfo($request_uri, PATHINFO_EXTENSION);

if (in_array($path_extension, $static_extensions)) {
    // Try multiple possible paths for Railway compatibility
    $possible_paths = [
        __DIR__ . '/../frontend' . $request_uri,
        __DIR__ . '/frontend' . $request_uri,
        getcwd() . '/frontend' . $request_uri,
        './frontend' . $request_uri
    ];
    
    foreach ($possible_paths as $file_path) {
        if (file_exists($file_path) && is_file($file_path)) {
            $mime_types = [
                'css' => 'text/css; charset=utf-8',
                'js' => 'application/javascript; charset=utf-8',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'ico' => 'image/x-icon',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ttf' => 'font/ttf',
                'eot' => 'application/vnd.ms-fontobject'
            ];
            
            $mime_type = $mime_types[$path_extension] ?? 'application/octet-stream';
            
            // Add cache headers for static assets
            header('Content-Type: ' . $mime_type);
            header('Cache-Control: public, max-age=31536000'); // 1 year cache
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            
            readfile($file_path);
            exit();
        }
    }
}

// Serve frontend files directly - Enhanced for Railway
$frontend_files = [
    '/' => 'frontend/index.html',
    '/index.html' => 'frontend/index.html',
    '/book.html' => 'frontend/book.html',
    '/admin.html' => 'frontend/admin.html',
    '/css/style.css' => 'frontend/css/style.css',
    '/js/booking.js' => 'frontend/js/booking.js',
    '/js/admin.js' => 'frontend/js/admin.js',
    '/images/hero.png' => 'frontend/images/hero.png'
];

if (isset($frontend_files[$request_uri])) {
    // Try multiple possible paths for Railway compatibility
    $relative_path = $frontend_files[$request_uri];
    $possible_paths = [
        __DIR__ . '/../' . $relative_path,
        __DIR__ . '/' . $relative_path,
        getcwd() . '/' . $relative_path,
        './' . $relative_path
    ];
    
    foreach ($possible_paths as $file_path) {
        if (file_exists($file_path)) {
            $extension = pathinfo($file_path, PATHINFO_EXTENSION);
            $mime_types = [
                'html' => 'text/html; charset=utf-8',
                'css' => 'text/css; charset=utf-8',
                'js' => 'application/javascript; charset=utf-8',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml'
            ];
            
            $mime_type = $mime_types[$extension] ?? 'text/plain';
            header('Content-Type: ' . $mime_type);
            
            // Add cache headers for static assets (except HTML)
            if ($extension !== 'html') {
                header('Cache-Control: public, max-age=31536000');
                header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            }
            
            readfile($file_path);
            exit();
        }
    }
}

// Default: serve index.html for SPA routing - Enhanced for Railway
$possible_index_paths = [
    __DIR__ . '/../frontend/index.html',
    __DIR__ . '/frontend/index.html',
    getcwd() . '/frontend/index.html',
    './frontend/index.html'
];

$index_served = false;
foreach ($possible_index_paths as $index_path) {
    if (file_exists($index_path)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($index_path);
        $index_served = true;
        break;
    }
}

if (!$index_served) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404 - Not Found</title></head><body>';
    echo '<h1>404 - File not found</h1>';
    echo '<p>Requested: ' . htmlspecialchars($request_uri) . '</p>';
    echo '<p>Working directory: ' . getcwd() . '</p>';
    echo '<p>Available files:</p><ul>';
    
    // Debug: Show available files
    if (is_dir('./frontend')) {
        $files = scandir('./frontend');
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                echo '<li>' . htmlspecialchars($file) . '</li>';
            }
        }
    }
    echo '</ul></body></html>';
}
?>
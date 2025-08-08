#!/bin/bash

# Railway start script for Car Workshop Appointment System
echo "🔧 Starting Car Workshop Appointment System..."

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=8080
fi

echo "📡 Starting PHP server on port $PORT"

# Start the PHP built-in server
php -S 0.0.0.0:$PORT -t . backend/server.php
#!/bin/bash

echo "🔧 Building Car Workshop Appointment System..."

# Install Composer dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "✅ Build completed successfully!"
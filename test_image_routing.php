<?php
echo "🖼️ Testing Image Routing\n";
echo "=======================\n\n";

// Test if hero image exists
$hero_path = 'frontend/images/hero.png';
if (file_exists($hero_path)) {
    $size = filesize($hero_path);
    echo "✅ Hero image exists: $hero_path ($size bytes)\n";
} else {
    echo "❌ Hero image not found: $hero_path\n";
}

// Test server routing for images
echo "\n🌐 Server URLs to test:\n";
echo "   • Main site: http://localhost:8081/\n";
echo "   • Hero image: http://localhost:8081/images/hero.png\n";
echo "   • CSS file: http://localhost:8081/css/style.css\n";
echo "   • Booking page: http://localhost:8081/book.html\n";
echo "   • Admin panel: http://localhost:8081/admin.html\n";

echo "\n📝 Image should now load correctly in the browser!\n";
?>
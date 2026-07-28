<?php
/**
 * Configuration File - Portal Dusun Jambon
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('Asia/Jakarta');

define('APP_NAME', 'Portal Resmi Dusun Jambon');

// Load environment variables from .env if present
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            $_ENV[$name] = $value;
            putenv("{$name}={$value}");
        }
    }
}

// Supabase & Database Credentials
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: 'https://ydmmynesclhlqcijjwfu.supabase.co');
define('SUPABASE_PUBLISHABLE_KEY', getenv('SUPABASE_PUBLISHABLE_KEY') ?: 'sb_publishable_KQlwLZ8ulUlHcogrVk6okw_Sl1-ibBS');
define('SUPABASE_SECRET_KEY', getenv('SUPABASE_SECRET_KEY') ?: '');
define('SUPABASE_STORAGE_BUCKET', getenv('SUPABASE_STORAGE_BUCKET') ?: 'web_dusun_storage');
define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://postgres.ydmmynesclhlqcijjwfu:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres');

/**
 * Send JSON HTTP Response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Check if current session is authenticated as admin
 */
function isAuthenticated() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

/**
 * Enforce Admin Authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        jsonResponse([
            'status' => 'error',
            'message' => 'Akses ditolak. Silakan login sebagai admin terlebih dahulu.'
        ], 401);
    }
}

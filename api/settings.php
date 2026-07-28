<?php
/**
 * System Settings API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    jsonResponse([
        'status' => 'success',
        'data' => [
            'supabase_url' => SUPABASE_URL,
            'storage_bucket' => SUPABASE_STORAGE_BUCKET,
            'pdo_connected' => (Database::getPDO() !== null),
            'app_name' => APP_NAME
        ]
    ]);
}

requireAuth();

if ($method === 'POST') {
    jsonResponse([
        'status' => 'success',
        'message' => 'Pengaturan Supabase PostgreSQL sudah aktif dan terhubung.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

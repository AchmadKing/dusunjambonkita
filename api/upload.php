<?php
/**
 * Image Upload API (Supabase Storage) - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/supabase.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$fileKey = isset($_FILES['file']) ? 'file' : (isset($_FILES['image']) ? 'image' : null);

if (!$fileKey || !isset($_FILES[$fileKey])) {
    jsonResponse(['status' => 'error', 'message' => 'Tidak ada file gambar yang diunggah.'], 400);
}

$result = SupabaseStorage::uploadImage($_FILES[$fileKey]);

if ($result['status'] === 'success') {
    jsonResponse([
        'status' => 'success',
        'message' => 'Gambar berhasil diunggah ke Supabase Storage.',
        'url' => $result['url'],
        'filename' => $result['filename']
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => $result['message']], 500);
}

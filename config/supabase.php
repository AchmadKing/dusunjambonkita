<?php
/**
 * Supabase Storage Integration Layer - Portal Dusun Jambon
 */

require_once __DIR__ . '/config.php';

class SupabaseStorage {
    
    /**
     * Upload an image file to Supabase Storage Bucket
     * Returns public image URL or relative path on success.
     */
    public static function uploadImage(array $file): array {
        if (!isset($file['tmp_name']) || empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['status' => 'error', 'message' => 'File upload gagal atau file tidak valid.'];
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        $fileMime = mime_content_type($file['tmp_name']);
        if (!in_array($fileMime, $allowedTypes)) {
            return ['status' => 'error', 'message' => 'Format file harus berupa gambar (JPG, PNG, WEBP, GIF, SVG).'];
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
        $filename = 'img_' . time() . '_' . uniqid() . '.' . ($ext ?: 'jpg');
        $bucket = SUPABASE_STORAGE_BUCKET;

        // Attempt Supabase Storage Upload via REST API
        $url = rtrim(SUPABASE_URL, '/') . "/storage/v1/object/{$bucket}/{$filename}";
        
        $fileContent = file_get_contents($file['tmp_name']);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . SUPABASE_SECRET_KEY,
            'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
            'Content-Type: ' . $fileMime,
            'x-upsert: true'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $publicUrl = rtrim(SUPABASE_URL, '/') . "/storage/v1/object/public/{$bucket}/{$filename}";
            return [
                'status' => 'success',
                'url' => $publicUrl,
                'filename' => $filename,
                'storage' => 'supabase'
            ];
        }

        // If bucket creation / upload fails on Supabase Cloud, save to local uploads/ as fallback
        $localDir = __DIR__ . '/../uploads/';
        if (!is_dir($localDir)) {
            mkdir($localDir, 0755, true);
        }
        $localPath = $localDir . $filename;
        if (move_uploaded_file($file['tmp_name'], $localPath)) {
            return [
                'status' => 'success',
                'url' => 'uploads/' . $filename,
                'filename' => $filename,
                'storage' => 'local'
            ];
        }

        return ['status' => 'error', 'message' => 'Gagal mengunggah file ke Supabase Storage maupun direktori lokal.'];
    }
}

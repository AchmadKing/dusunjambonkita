<?php
/**
 * Administrasi & Peta Titik Lokasi API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch Map Info
    $mapRes = Database::select('administrasi_peta', '*', ['id' => 1]);
    $map = (!empty($mapRes['data'])) ? $mapRes['data'][0] : null;

    // Fetch Titik Lokasi
    $lokasiRes = Database::select('titik_lokasi', '*', [], 'id asc');
    $locations = ($lokasiRes['status'] === 'success') ? $lokasiRes['data'] : [];

    jsonResponse([
        'status' => 'success',
        'data' => [
            'peta' => $map,
            'lokasi' => $locations
        ]
    ]);
}

// Write requires auth
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $type = $input['type'] ?? 'peta';

    if ($type === 'peta') {
        $map_title = trim($input['map_title'] ?? '');
        $map_desc = trim($input['map_desc'] ?? '');
        $map_image_url = trim($input['map_image_url'] ?? '');

        if (empty($map_title) || empty($map_image_url)) {
            jsonResponse(['status' => 'error', 'message' => 'Judul dan URL Gambar Peta wajib diisi.'], 400);
        }

        Database::update('administrasi_peta', [
            'map_title' => $map_title,
            'map_desc' => $map_desc,
            'map_image_url' => $map_image_url,
            'updated_at' => date('Y-m-d H:i:s')
        ], ['id' => 1]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Peta administrasi berhasil diperbarui.'
        ]);
    }

    if ($type === 'lokasi_add' || $type === 'lokasi_edit') {
        $id = intval($input['id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? 'rt');
        $badge_label = trim($input['badge_label'] ?? '');
        $badge_color = trim($input['badge_color'] ?? 'blue');
        $description = trim($input['description'] ?? '');
        $coordinates = trim($input['coordinates'] ?? '');
        $gmaps_url = trim($input['gmaps_url'] ?? '');
        $image_url = trim($input['image_url'] ?? '');

        if (empty($title) || empty($coordinates)) {
            jsonResponse(['status' => 'error', 'message' => 'Nama Titik Lokasi dan Koordinat wajib diisi.'], 400);
        }

        if ($type === 'lokasi_edit' && $id > 0) {
            Database::update('titik_lokasi', [
                'title' => $title,
                'category' => $category,
                'badge_label' => $badge_label,
                'badge_color' => $badge_color,
                'description' => $description,
                'coordinates' => $coordinates,
                'gmaps_url' => $gmaps_url,
                'image_url' => $image_url
            ], ['id' => $id]);

            jsonResponse(['status' => 'success', 'message' => 'Titik lokasi berhasil diperbarui.']);
        } else {
            $res = Database::insert('titik_lokasi', [
                'title' => $title,
                'category' => $category,
                'badge_label' => $badge_label,
                'badge_color' => $badge_color,
                'description' => $description,
                'coordinates' => $coordinates,
                'gmaps_url' => $gmaps_url,
                'image_url' => $image_url
            ]);

            jsonResponse(['status' => 'success', 'message' => 'Titik lokasi berhasil ditambahkan.']);
        }
    }
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? $input['id'] ?? 0);
    if (!$id) {
        jsonResponse(['status' => 'error', 'message' => 'ID lokasi tidak valid.'], 400);
    }

    Database::delete('titik_lokasi', ['id' => $id]);
    jsonResponse(['status' => 'success', 'message' => 'Titik lokasi berhasil dihapus.']);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

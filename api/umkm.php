<?php
/**
 * UMKM API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $category = isset($_GET['category']) ? trim($_GET['category']) : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $offset = ($page - 1) * $limit;

    if ($id) {
        $res = Database::select('umkm', '*', ['id' => $id]);
        $item = (!empty($res['data'])) ? $res['data'][0] : null;
        if (!$item) {
            jsonResponse(['status' => 'error', 'message' => 'Data UMKM tidak ditemukan.'], 404);
        }
        jsonResponse(['status' => 'success', 'data' => $item]);
    }

    $params = [];
    if ($category && $category !== 'semua') {
        $params['category'] = $category;
    }

    $res = Database::select('umkm', '*', $params, 'id desc');
    $allData = ($res['status'] === 'success' && is_array($res['data'])) ? $res['data'] : [];

    if ($search) {
        $allData = array_values(array_filter($allData, function($item) use ($search) {
            return (stripos($item['title'], $search) !== false || 
                    stripos($item['owner'], $search) !== false || 
                    stripos($item['description'], $search) !== false);
        }));
    }

    $totalItems = count($allData);
    $paginatedData = array_slice($allData, $offset, $limit);

    jsonResponse([
        'status' => 'success',
        'total' => $totalItems,
        'page' => $page,
        'limit' => $limit,
        'totalPages' => ceil($totalItems / max($limit, 1)),
        'data' => $paginatedData
    ]);
}

// Write require auth
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $id = isset($input['id']) ? intval($input['id']) : 0;
    $title = trim($input['title'] ?? '');
    $owner = trim($input['owner'] ?? '');
    $category = trim($input['category'] ?? 'kuliner');
    $price_str = trim($input['price_str'] ?? '');
    $whatsapp = trim($input['whatsapp'] ?? '');
    $description = trim($input['description'] ?? '');
    $image_url = trim($input['image_url'] ?? '');

    if (empty($title) || empty($owner) || empty($whatsapp)) {
        jsonResponse(['status' => 'error', 'message' => 'Nama UMKM, Pemilik, dan No. WhatsApp wajib diisi.'], 400);
    }

    if ($id > 0) {
        $res = Database::update('umkm', [
            'title' => $title,
            'owner' => $owner,
            'category' => $category,
            'price_str' => $price_str,
            'whatsapp' => $whatsapp,
            'description' => $description,
            'image_url' => $image_url
        ], ['id' => $id]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Data UMKM berhasil diperbarui.'
        ]);
    } else {
        $res = Database::insert('umkm', [
            'title' => $title,
            'owner' => $owner,
            'category' => $category,
            'price_str' => $price_str,
            'whatsapp' => $whatsapp,
            'description' => $description,
            'image_url' => $image_url
        ]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Data UMKM baru berhasil ditambahkan.',
            'data' => $res['data'] ?? null
        ]);
    }
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? $input['id'] ?? 0);
    if (!$id) {
        jsonResponse(['status' => 'error', 'message' => 'ID UMKM tidak valid.'], 400);
    }

    Database::delete('umkm', ['id' => $id]);
    jsonResponse([
        'status' => 'success',
        'message' => 'Data UMKM berhasil dihapus.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

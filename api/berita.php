<?php
/**
 * Berita API - Portal Dusun Jambon
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
        $res = Database::select('berita', '*', ['id' => $id]);
        $item = (!empty($res['data'])) ? $res['data'][0] : null;
        if (!$item) {
            jsonResponse(['status' => 'error', 'message' => 'Berita tidak ditemukan.'], 404);
        }
        jsonResponse(['status' => 'success', 'data' => $item]);
    }

    $params = [];
    if ($category && $category !== 'semua') {
        $params['category'] = $category;
    }

    $res = Database::select('berita', '*', $params, 'id desc');
    $allData = ($res['status'] === 'success' && is_array($res['data'])) ? $res['data'] : [];

    // In-memory filter for search if search parameter passed
    if ($search) {
        $allData = array_values(array_filter($allData, function($item) use ($search) {
            return (stripos($item['title'], $search) !== false || 
                    stripos($item['content'], $search) !== false || 
                    stripos($item['excerpt'], $search) !== false);
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

// Write endpoints require Auth
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $id = isset($input['id']) ? intval($input['id']) : 0;
    $title = trim($input['title'] ?? '');
    $category = trim($input['category'] ?? 'kegiatan');
    $date_str = trim($input['date_str'] ?? date('d F Y'));
    $author = trim($input['author'] ?? 'Pengurus Dusun');
    $excerpt = trim($input['excerpt'] ?? '');
    $content = trim($input['content'] ?? '');
    $image_url = trim($input['image_url'] ?? '');

    if (empty($title) || empty($excerpt) || empty($content)) {
        jsonResponse(['status' => 'error', 'message' => 'Judul, ringkasan, dan isi berita wajib diisi.'], 400);
    }

    if ($id > 0) {
        // Update existing news
        $res = Database::update('berita', [
            'title' => $title,
            'category' => $category,
            'date_str' => $date_str,
            'author' => $author,
            'excerpt' => $excerpt,
            'content' => $content,
            'image_url' => $image_url
        ], ['id' => $id]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Berita berhasil diperbarui.'
        ]);
    } else {
        // Insert new news
        $res = Database::insert('berita', [
            'title' => $title,
            'category' => $category,
            'date_str' => $date_str,
            'author' => $author,
            'excerpt' => $excerpt,
            'content' => $content,
            'image_url' => $image_url
        ]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Berita baru berhasil ditambahkan.',
            'data' => $res['data'] ?? null
        ]);
    }
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? $input['id'] ?? 0);
    if (!$id) {
        jsonResponse(['status' => 'error', 'message' => 'ID berita tidak valid.'], 400);
    }

    Database::delete('berita', ['id' => $id]);
    jsonResponse([
        'status' => 'success',
        'message' => 'Berita berhasil dihapus.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

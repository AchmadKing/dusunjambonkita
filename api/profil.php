<?php
/**
 * Profil & Sejarah API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch profil_content
    $profilRes = Database::select('profil_content', '*', ['id' => 1]);
    $profil = (!empty($profilRes['data'])) ? $profilRes['data'][0] : null;

    // Fetch profil_gallery
    $galleryRes = Database::select('profil_gallery', '*', [], 'id asc');
    $gallery = ($galleryRes['status'] === 'success') ? $galleryRes['data'] : [];

    jsonResponse([
        'status' => 'success',
        'data' => [
            'profil' => $profil,
            'gallery' => $gallery
        ]
    ]);
}

// Write actions require admin authentication
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $type = $input['type'] ?? 'profil';

    if ($type === 'profil') {
        $sejarah_p1 = trim($input['sejarah_p1'] ?? '');
        $sejarah_p2 = trim($input['sejarah_p2'] ?? '');
        $visi_text = trim($input['visi_text'] ?? '');
        $misi_list = $input['misi_list'] ?? [];

        if (is_string($misi_list)) {
            $misi_list = array_values(array_filter(array_map('trim', explode("\n", $misi_list))));
        }

        $res = Database::update('profil_content', [
            'sejarah_p1' => $sejarah_p1,
            'sejarah_p2' => $sejarah_p2,
            'visi_text' => $visi_text,
            'misi_list' => json_encode($misi_list),
            'updated_at' => date('Y-m-d H:i:s')
        ], ['id' => 1]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Data profil berhasil diperbarui.'
        ]);
    }

    if ($type === 'gallery_add') {
        $title = trim($input['title'] ?? '');
        $subtitle = trim($input['subtitle'] ?? '');
        $tag = trim($input['tag'] ?? 'Kegiatan');
        $image_url = trim($input['image_url'] ?? '');
        $displayType = trim($input['display_type'] ?? 'gallery');

        if (empty($title) || empty($image_url)) {
            jsonResponse(['status' => 'error', 'message' => 'Judul dan Gambar wajib diisi.'], 400);
        }

        $res = Database::insert('profil_gallery', [
            'title' => $title,
            'subtitle' => $subtitle,
            'tag' => $tag,
            'image_url' => $image_url,
            'type' => $displayType
        ]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Foto galeri berhasil ditambahkan.',
            'data' => $res['data'] ?? null
        ]);
    }

    if ($type === 'gallery_edit') {
        $id = intval($input['id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $subtitle = trim($input['subtitle'] ?? '');
        $tag = trim($input['tag'] ?? 'Kegiatan');
        $image_url = trim($input['image_url'] ?? '');
        $displayType = trim($input['display_type'] ?? 'gallery');

        if (!$id || empty($title) || empty($image_url)) {
            jsonResponse(['status' => 'error', 'message' => 'Data tidak lengkap.'], 400);
        }

        $res = Database::update('profil_gallery', [
            'title' => $title,
            'subtitle' => $subtitle,
            'tag' => $tag,
            'image_url' => $image_url,
            'type' => $displayType
        ], ['id' => $id]);

        jsonResponse([
            'status' => 'success',
            'message' => 'Foto galeri berhasil diperbarui.'
        ]);
    }
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? $input['id'] ?? 0);
    if (!$id) {
        jsonResponse(['status' => 'error', 'message' => 'ID foto galeri tidak valid.'], 400);
    }

    Database::delete('profil_gallery', ['id' => $id]);
    jsonResponse([
        'status' => 'success',
        'message' => 'Foto galeri berhasil dihapus.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

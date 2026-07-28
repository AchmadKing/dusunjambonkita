<?php
/**
 * Dashboard & Beranda Content API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch Beranda Content
    $berandaRes = Database::select('beranda_content', '*', ['id' => 1]);
    $beranda = (!empty($berandaRes['data'])) ? $berandaRes['data'][0] : null;

    // Aggregate statistics
    $beritaRes = Database::select('berita', 'id');
    $totalBerita = ($beritaRes['status'] === 'success' && is_array($beritaRes['data'])) ? count($beritaRes['data']) : 0;

    $umkmRes = Database::select('umkm', 'id');
    $totalUmkm = ($umkmRes['status'] === 'success' && is_array($umkmRes['data'])) ? count($umkmRes['data']) : 0;

    $lokasiRes = Database::select('titik_lokasi', 'id');
    $totalLokasi = ($lokasiRes['status'] === 'success' && is_array($lokasiRes['data'])) ? count($lokasiRes['data']) : 0;

    $galleryRes = Database::select('profil_gallery', 'id');
    $totalGallery = ($galleryRes['status'] === 'success' && is_array($galleryRes['data'])) ? count($galleryRes['data']) : 0;

    jsonResponse([
        'status' => 'success',
        'data' => [
            'beranda' => $beranda,
            'stats' => [
                'total_berita' => $totalBerita,
                'total_umkm' => $totalUmkm,
                'total_lokasi' => $totalLokasi,
                'total_gallery' => $totalGallery
            ]
        ]
    ]);
}

// POST requires auth to update Beranda content
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $hero_headline = trim($input['hero_headline'] ?? '');
    $hero_headline_span = trim($input['hero_headline_span'] ?? '');
    $hero_headline_red = trim($input['hero_headline_red'] ?? '');
    $hero_desc = trim($input['hero_desc'] ?? '');
    $hero_image_url = trim($input['hero_image_url'] ?? '');
    $hero_image_caption = trim($input['hero_image_caption'] ?? '');
    $kepala_dusun_title = trim($input['kepala_dusun_title'] ?? '');
    $kepala_dusun_speech_1 = trim($input['kepala_dusun_speech_1'] ?? '');
    $kepala_dusun_speech_2 = trim($input['kepala_dusun_speech_2'] ?? '');
    $kepala_dusun_name = trim($input['kepala_dusun_name'] ?? '');
    $kepala_dusun_image_url = trim($input['kepala_dusun_image_url'] ?? '');

    if (empty($hero_headline) || empty($hero_desc)) {
        jsonResponse(['status' => 'error', 'message' => 'Judul Hero dan Deskripsi wajib diisi.'], 400);
    }

    Database::update('beranda_content', [
        'hero_headline' => $hero_headline,
        'hero_headline_span' => $hero_headline_span,
        'hero_headline_red' => $hero_headline_red,
        'hero_desc' => $hero_desc,
        'hero_image_url' => $hero_image_url,
        'hero_image_caption' => $hero_image_caption,
        'kepala_dusun_title' => $kepala_dusun_title,
        'kepala_dusun_speech_1' => $kepala_dusun_speech_1,
        'kepala_dusun_speech_2' => $kepala_dusun_speech_2,
        'kepala_dusun_name' => $kepala_dusun_name,
        'kepala_dusun_image_url' => $kepala_dusun_image_url,
        'updated_at' => date('Y-m-d H:i:s')
    ], ['id' => 1]);

    jsonResponse([
        'status' => 'success',
        'message' => 'Konten Halaman Beranda berhasil diperbarui.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

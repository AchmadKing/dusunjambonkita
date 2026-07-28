<?php
/**
 * Kontak API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = Database::select('kontak_content', '*', ['id' => 1]);
    $kontak = (!empty($res['data'])) ? $res['data'][0] : null;

    jsonResponse([
        'status' => 'success',
        'data' => $kontak
    ]);
}

// Update requires auth
requireAuth();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $address = trim($input['address'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $email = trim($input['email'] ?? '');
    $whatsapp = trim($input['whatsapp'] ?? '');
    $gmaps_embed = trim($input['gmaps_embed'] ?? '');
    $instagram = trim($input['instagram'] ?? '');
    $facebook = trim($input['facebook'] ?? '');
    $youtube = trim($input['youtube'] ?? '');

    if (empty($address) || empty($email) || empty($phone)) {
        jsonResponse(['status' => 'error', 'message' => 'Alamat, Email, dan No. HP wajib diisi.'], 400);
    }

    Database::update('kontak_content', [
        'address' => $address,
        'phone' => $phone,
        'email' => $email,
        'whatsapp' => $whatsapp,
        'gmaps_embed' => $gmaps_embed,
        'instagram' => $instagram,
        'facebook' => $facebook,
        'youtube' => $youtube,
        'updated_at' => date('Y-m-d H:i:s')
    ], ['id' => 1]);

    jsonResponse([
        'status' => 'success',
        'message' => 'Informasi kontak berhasil diperbarui.'
    ]);
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

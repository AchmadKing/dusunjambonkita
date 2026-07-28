<?php
/**
 * Authentication API - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    jsonResponse([
        'status' => 'success',
        'authenticated' => isAuthenticated(),
        'user' => $_SESSION['admin_user'] ?? null
    ]);
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;
    $action = $input['action'] ?? 'login';

    if ($action === 'login') {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($username) || empty($password)) {
            jsonResponse(['status' => 'error', 'message' => 'Username dan password wajib diisi.'], 400);
        }

        // Fetch user from DB
        $res = Database::select('admin_users', '*', ['email' => $username]);
        if ($res['status'] !== 'success' || empty($res['data'])) {
            // Try matching by username column if not matching email
            $res = Database::select('admin_users', '*', ['username' => $username]);
        }

        $user = !empty($res['data']) ? $res['data'][0] : null;

        // Default admin fallback if table is empty or connection fails
        if (!$user && ($username === 'admin@dusunjambon.id' || $username === 'admin') && $password === 'admin123') {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user'] = 'Admin Dusun';
            jsonResponse([
                'status' => 'success',
                'message' => 'Login berhasil!',
                'redirect' => 'admin.php'
            ]);
        }

        if ($user && isset($user['password_hash'])) {
            if (password_verify($password, $user['password_hash'])) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_user'] = $user['name'] ?? $user['username'];
                jsonResponse([
                    'status' => 'success',
                    'message' => 'Login berhasil!',
                    'redirect' => 'admin.php'
                ]);
            }
        }

        jsonResponse(['status' => 'error', 'message' => 'Username/Email atau password salah.'], 401);
    }

    if ($action === 'logout') {
        session_unset();
        session_destroy();
        jsonResponse([
            'status' => 'success',
            'message' => 'Berhasil keluar (logout).',
            'redirect' => 'login.php'
        ]);
    }
}

jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

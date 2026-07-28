<?php
/**
 * Admin Login View - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';

if (isAuthenticated()) {
    header('Location: admin.php');
    exit;
}

$pageTitle = 'Login Admin - Portal Dusun Jambon';
$isAdmin = true;
require_once __DIR__ . '/../templates/header.php';
?>

<div id="loginSection" class="login-wrapper">
    <div class="login-card">
        <div class="login-brand">
            <div class="login-brand-icon">
                <i class="fa-solid fa-building-columns"></i>
            </div>
            <h2>Login Admin Dusun</h2>
            <p>Portal Resmi Transparansi & Pengelolaan Dusun Jambon</p>
        </div>

        <div id="loginAlert" style="display: none; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem;"></div>

        <form id="adminLoginForm" class="login-form">
            <div class="form-group">
                <label>Username / Email Admin</label>
                <div class="input-with-icon">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="text" id="loginUsername" placeholder="admin@dusunjambon.id" required value="admin@dusunjambon.id">
                </div>
            </div>

            <div class="form-group">
                <label>Kata Sandi (Password)</label>
                <div class="input-with-icon">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="loginPassword" placeholder="••••••••" required value="admin123">
                </div>
            </div>

            <button type="submit" class="btn-admin-login" id="btnLoginSubmit">
                <i class="fa-solid fa-right-to-bracket"></i> Masuk Ke Dashboard
            </button>
        </form>

        <div class="demo-credentials-box">
            <i class="fa-solid fa-circle-info"></i> <strong>Kredensial Demo Admin:</strong><br>
            • Email: <code>admin@dusunjambon.id</code><br>
            • Password: <code>admin123</code>
        </div>
    </div>
</div>

<script>
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('loginAlert');
    const btnSubmit = document.getElementById('btnLoginSubmit');
    
    alertBox.style.display = 'none';
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        let authEndpoint = 'api/auth.php';
        let res = await fetch(authEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });

        if (!res.ok) {
            authEndpoint = '../api/auth.php';
            res = await fetch(authEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username, password })
            });
        }

        const json = await res.json();

        if (json.status === 'success') {
            alertBox.style.background = 'rgba(5, 150, 105, 0.2)';
            alertBox.style.color = '#10b981';
            alertBox.style.border = '1px solid #10b981';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + json.message;
            alertBox.style.display = 'block';
            setTimeout(() => {
                window.location.href = json.redirect || 'admin.php';
            }, 500);
        } else {
            alertBox.style.background = 'rgba(217, 38, 38, 0.2)';
            alertBox.style.color = '#ef4444';
            alertBox.style.border = '1px solid #ef4444';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + (json.message || 'Login gagal.');
            alertBox.style.display = 'block';
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk Ke Dashboard';
        }
    } catch (err) {
        alertBox.style.background = 'rgba(217, 38, 38, 0.2)';
        alertBox.style.color = '#ef4444';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Kesalahan koneksi HTTP/PHP. Pastikan Apache XAMPP berjalan di http://localhost/web_dusun/';
        alertBox.style.display = 'block';
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk Ke Dashboard';
    }
});
</script>

</body>
</html>

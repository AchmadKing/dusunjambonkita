<?php
/**
 * Admin Dashboard - Portal Dusun Jambon
 */

require_once __DIR__ . '/../config/config.php';

if (!isAuthenticated()) {
    header('Location: login.php');
    exit;
}

$pageTitle = 'Dashboard Admin - Portal Dusun Jambon';
$isAdmin = true;
require_once __DIR__ . '/../templates/header.php';
?>

<div id="adminDashboardSection" class="admin-app-container">
    
    <!-- SIDEBAR NAVIGATION -->
    <aside class="admin-sidebar">
        <div class="sidebar-header-brand">
            <div class="brand-icon-sm">
                <i class="fa-solid fa-building-columns"></i>
            </div>
            <div class="brand-title-group">
                <h3>Dusun Jambon</h3>
                <span>Panel Pengelola Admin</span>
            </div>
        </div>

        <ul class="admin-nav-menu">
            <li class="admin-nav-item">
                <a href="#tab-beranda" class="admin-nav-link active" data-tab="tab-beranda">
                    <i class="fa-solid fa-house"></i> 1. Beranda
                </a>
            </li>
            <li class="admin-nav-item">
                <a href="#tab-profil" class="admin-nav-link" data-tab="tab-profil">
                    <i class="fa-solid fa-id-card"></i> 2. Profil & Sejarah
                </a>
            </li>
            <li class="admin-nav-item">
                <a href="#tab-berita" class="admin-nav-link" data-tab="tab-berita">
                    <i class="fa-solid fa-newspaper"></i> 3. Data Berita
                </a>
            </li>
            <li class="admin-nav-item">
                <a href="#tab-peta" class="admin-nav-link" data-tab="tab-peta">
                    <i class="fa-solid fa-map-location-dot"></i> 4. Peta & Koordinat
                </a>
            </li>
            <li class="admin-nav-item">
                <a href="#tab-umkm" class="admin-nav-link" data-tab="tab-umkm">
                    <i class="fa-solid fa-shop"></i> 5. Data UMKM
                </a>
            </li>
            <li class="admin-nav-item">
                <a href="#tab-kontak" class="admin-nav-link" data-tab="tab-kontak">
                    <i class="fa-solid fa-address-book"></i> 6. Kontak Dusun
                </a>
            </li>
            <li class="admin-nav-item" style="margin-top: 15px; border-top: 1px dashed var(--admin-border); padding-top: 15px;">
                <a href="#tab-supabase" class="admin-nav-link" data-tab="tab-supabase" style="color: var(--admin-accent-green);">
                    <i class="fa-solid fa-database"></i> Database Supabase
                </a>
            </li>
        </ul>

        <div class="sidebar-user-footer">
            <div style="font-size: 0.82rem;">
                <div style="font-weight: 700; color: #fff;"><?= htmlspecialchars($_SESSION['admin_user'] ?? 'Admin Perangkat') ?></div>
                <div style="color: var(--admin-text-muted);">Sesi Aktif</div>
            </div>
            <a href="logout.php" id="btnLogout" class="btn-admin-logout" style="text-decoration:none;">
                <i class="fa-solid fa-power-off"></i> Keluar
            </a>
        </div>
    </aside>

    <!-- MAIN AREA -->
    <main class="admin-main-area">
        <!-- TOPBAR -->
        <header class="admin-topbar">
            <div class="topbar-left">
                <h2 id="currentTabTitle">Pengelolaan Halaman Beranda</h2>
            </div>
            <div class="topbar-right" style="display: flex; align-items: center; gap: 16px;">
                <span id="dbStatusBadge" class="db-status-badge">
                    <i class="fa-solid fa-cloud"></i> Engine: PostgreSQL Supabase
                </span>
                <a href="index.php" target="_blank" class="btn-secondary" style="padding: 6px 14px; font-size: 0.85rem; text-decoration: none;">
                    <i class="fa-solid fa-globe"></i> Lihat Website Utama
                </a>
            </div>
        </header>

        <!-- CONTENT BODY -->
        <div class="admin-content-body">

            <!-- ==============================================================
                 TAB 1: CRUD BERANDA
                 ============================================================== -->
            <div id="tab-beranda" class="admin-tab-panel active">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-pen-to-square"></i> CRUD Gambar & Tulisan Halaman Beranda</h3>
                        <p>Ubah judul hero banner, deskripsi sambutan, dan gambar utama pada halaman Beranda.</p>
                    </div>
                </div>

                <form id="formBeranda" class="admin-form-card">
                    <div class="form-grid-2">
                        <div class="admin-form-group">
                            <label>Tek Utama Hero (Sebelum Highlight)</label>
                            <input type="text" id="berandaHeadline" class="admin-form-control" required>
                        </div>
                        <div class="admin-form-group">
                            <label>Teks Span Tengah</label>
                            <input type="text" id="berandaHeadlineSpan" class="admin-form-control" required>
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label>Teks Highlight Merah (Nama Dusun)</label>
                        <input type="text" id="berandaHeadlineRed" class="admin-form-control" required>
                    </div>

                    <div class="admin-form-group">
                        <label>Deskripsi Hero Banner</label>
                        <textarea id="berandaDesc" class="admin-form-control" required></textarea>
                    </div>

                    <div class="admin-form-group">
                        <label><i class="fa-solid fa-upload"></i> Upload / Pilih Gambar Utama Hero Banner (Supabase Storage)</label>
                        <input type="file" id="berandaHeroImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                        <input type="text" id="berandaHeroImg" class="admin-form-control" placeholder="assets/img/Masjid_Al-Falah.jpg atau Upload File" required>
                        <div style="margin-top: 10px;">
                            <img id="berandaHeroImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label>Keterangan / Caption Gambar Hero</label>
                        <input type="text" id="berandaHeroCap" class="admin-form-control" required>
                    </div>

                    <hr style="border-color: var(--admin-border); margin: 24px 0;">

                    <h4><i class="fa-solid fa-user-tie"></i> Sambutan Kepala Dusun</h4>

                    <div class="admin-form-group">
                        <label>Judul Sambutan</label>
                        <input type="text" id="berandaKdTitle" class="admin-form-control" required>
                    </div>

                    <div class="admin-form-group">
                        <label><i class="fa-solid fa-upload"></i> Upload / Pilih Foto Kepala Dusun (Supabase Storage)</label>
                        <input type="file" id="berandaKdImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                        <input type="text" id="berandaKdImg" class="admin-form-control" placeholder="URL atau Base64 Gambar Foto Kepala Dusun">
                        <div style="margin-top: 10px;">
                            <img id="berandaKdImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label>Isi Sambutan Paragraf 1</label>
                        <textarea id="berandaKdSpeech1" class="admin-form-control" required></textarea>
                    </div>

                    <div class="admin-form-group">
                        <label>Isi Sambutan Paragraf 2</label>
                        <textarea id="berandaKdSpeech2" class="admin-form-control" required></textarea>
                    </div>

                    <div class="admin-form-group">
                        <label>Nama & Jabatan Kepala Dusun</label>
                        <input type="text" id="berandaKdName" class="admin-form-control" required>
                    </div>

                    <button type="submit" class="btn-admin-submit">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Beranda
                    </button>
                </form>
            </div>


            <!-- ==============================================================
                 TAB 2: CRUD PROFIL & SEJARAH
                 ============================================================== -->
            <div id="tab-profil" class="admin-tab-panel">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-id-card"></i> CRUD Gambar & Tulisan Halaman Profil</h3>
                        <p>Kelola teks Sejarah Dusun, Visi & Misi, serta Galeri Dokumentasi Foto.</p>
                    </div>
                </div>

                <form id="formProfil" class="admin-form-card">
                    <h4><i class="fa-solid fa-book-open"></i> Sejarah Dusun Jambon</h4>
                    <div class="admin-form-group">
                        <label>Sejarah Paragraf 1 (Asal-Usul Nama & Trah)</label>
                        <textarea id="profilSejarah1" class="admin-form-control" required></textarea>
                    </div>
                    <div class="admin-form-group">
                        <label>Sejarah Paragraf 2 (Perkembangan Dusun)</label>
                        <textarea id="profilSejarah2" class="admin-form-control" required></textarea>
                    </div>

                    <hr style="border-color: var(--admin-border); margin: 24px 0;">

                    <h4><i class="fa-solid fa-bullseye"></i> Visi & Misi Dusun</h4>
                    <div class="admin-form-group">
                        <label>Teks Visi Dusun Jambon</label>
                        <textarea id="profilVisi" class="admin-form-control" required></textarea>
                    </div>

                    <div class="admin-form-group">
                        <label>Daftar Poin Misi (Pisahkan dengan baris baru / Enter)</label>
                        <textarea id="profilMisi" class="admin-form-control" rows="4" required></textarea>
                    </div>

                    <button type="submit" class="btn-admin-submit">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Data Profil
                    </button>
                </form>

                <!-- Galeri & Slideshow List Table -->
                <div class="panel-header-card" style="margin-top: 30px;">
                    <div>
                        <h3><i class="fa-solid fa-images"></i> Galeri & Slideshow Foto Profil</h3>
                        <p>Tambah, edit, atau hapus foto dokumentasi yang muncul di slideshow dan galeri profil.</p>
                    </div>
                    <button class="btn-admin-submit" onclick="openAddGalleryModal()">
                        <i class="fa-solid fa-plus"></i> Tambah Foto Galeri
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Gambar</th>
                                <th>Judul / Caption</th>
                                <th>Tag / Kategori</th>
                                <th>Tipe Display</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="profilGalleryTableBody">
                            <!-- Rendered dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>


            <!-- ==============================================================
                 TAB 3: CRUD BERITA DUSUN
                 ============================================================== -->
            <div id="tab-berita" class="admin-tab-panel">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-newspaper"></i> CRUD Data Berita & Pengumuman Dusun</h3>
                        <p>Kelola artikel berita, pengumuman publik, dan warta kegiatan pembangunan dusun.</p>
                    </div>
                    <button class="btn-admin-submit" onclick="openAddBeritaModal()">
                        <i class="fa-solid fa-plus"></i> Tambah Berita Baru
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Judul Berita</th>
                                <th>Kategori</th>
                                <th>Tanggal</th>
                                <th>Penulis</th>
                                <th>Ringkasan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="beritaTableBody">
                            <!-- Rendered dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>


            <!-- ==============================================================
                 TAB 4: CRUD PETA & TITIK LOKASI GOOGLE MAPS
                 ============================================================== -->
            <div id="tab-peta" class="admin-tab-panel">
                <!-- Peta Administrasi Banner Section -->
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-map"></i> CRUD Gambar Peta Administrasi Dusun</h3>
                        <p>Perbarui URL peta resmi wilayah administrasi Dusun Jambon.</p>
                    </div>
                </div>

                <form id="formPeta" class="admin-form-card">
                    <div class="admin-form-group">
                        <label>Judul Peta Administrasi</label>
                        <input type="text" id="petaTitle" class="admin-form-control" required>
                    </div>
                    <div class="admin-form-group">
                        <label>Deskripsi Peta</label>
                        <textarea id="petaDesc" class="admin-form-control" required></textarea>
                    </div>
                    <div class="admin-form-group">
                        <label><i class="fa-solid fa-upload"></i> Upload / Pilih Gambar Peta Administrasi</label>
                        <input type="file" id="petaImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                        <input type="text" id="petaImgUrl" class="admin-form-control" placeholder="assets/img/PetaAdministrasiJambon.png atau Upload File" required>
                        <div style="margin-top: 10px;">
                            <img id="petaImgPreview" src="" style="max-height: 140px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                        </div>
                    </div>
                    <button type="submit" class="btn-admin-submit">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Peta Administrasi
                    </button>
                </form>

                <!-- Titik Lokasi Penting Table -->
                <div class="panel-header-card" style="margin-top: 30px;">
                    <div>
                        <h3><i class="fa-solid fa-location-dot"></i> CRUD Data Titik Lokasi Penting & Koordinat Google Maps</h3>
                        <p>Tambah dan kelola direktori Masjid, Rumah RT, dan koordinat penting.</p>
                    </div>
                    <button class="btn-admin-submit" onclick="openAddLokasiModal()">
                        <i class="fa-solid fa-plus"></i> Tambah Titik Lokasi
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Gambar</th>
                                <th>Nama Lokasi</th>
                                <th>Kategori / Badge</th>
                                <th>Koordinat Lat/Lng</th>
                                <th>Link Google Maps</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="lokasiTableBody">
                            <!-- Rendered dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>


            <!-- ==============================================================
                 TAB 5: CRUD DATA UMKM DUSUN
                 ============================================================== -->
            <div id="tab-umkm" class="admin-tab-panel">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-shop"></i> CRUD Data UMKM & Usaha Warga</h3>
                        <p>Kelola katalog produk, harga, pemilik usaha, dan nomor WhatsApp pemesanan.</p>
                    </div>
                    <button class="btn-admin-submit" onclick="openAddUmkmAdminModal()">
                        <i class="fa-solid fa-plus"></i> Tambah UMKM Baru
                    </button>
                </div>

                <div class="data-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Gambar</th>
                                <th>Nama UMKM</th>
                                <th>Pemilik</th>
                                <th>Kategori</th>
                                <th>Harga</th>
                                <th>No. WhatsApp</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="umkmTableBody">
                            <!-- Rendered dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>


            <!-- ==============================================================
                 TAB 6: CRUD KONTAK DUSUN
                 ============================================================== -->
            <div id="tab-kontak" class="admin-tab-panel">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-address-book"></i> Edit Informasi Kontak & Lokasi Dusun</h3>
                        <p>Kelola alamat kantor sekretariat, nomor telepon pelayanan, email, WhatsApp, dan Google Maps Embed.</p>
                    </div>
                </div>

                <form id="formKontak" class="admin-form-card">
                    <div class="admin-form-group">
                        <label>Alamat Sekretariat Lengkap</label>
                        <textarea id="kontakAddress" class="admin-form-control" rows="2" required></textarea>
                    </div>

                    <div class="form-grid-2">
                        <div class="admin-form-group">
                            <label>Nomor Telepon Service</label>
                            <input type="text" id="kontakPhone" class="admin-form-control" required>
                        </div>
                        <div class="admin-form-group">
                            <label>Email Resmi Dusun</label>
                            <input type="email" id="kontakEmail" class="admin-form-control" required>
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label>Nomor WhatsApp Pelayanan (Contoh: 6281234567890)</label>
                        <input type="text" id="kontakWhatsapp" class="admin-form-control" required>
                    </div>

                    <div class="admin-form-group">
                        <label>URL Embed Google Maps Iframe</label>
                        <textarea id="kontakGmapsEmbed" class="admin-form-control" rows="3" required></textarea>
                    </div>

                    <div class="form-grid-3">
                        <div class="admin-form-group">
                            <label>URL Instagram</label>
                            <input type="text" id="kontakInstagram" class="admin-form-control">
                        </div>
                        <div class="admin-form-group">
                            <label>URL Facebook</label>
                            <input type="text" id="kontakFacebook" class="admin-form-control">
                        </div>
                        <div class="admin-form-group">
                            <label>URL YouTube</label>
                            <input type="text" id="kontakYoutube" class="admin-form-control">
                        </div>
                    </div>

                    <button type="submit" class="btn-admin-submit">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Informasi Kontak
                    </button>
                </form>
            </div>


            <!-- ==============================================================
                 TAB 7: PENGATURAN DATABASE SUPABASE (POSTGRESQL)
                 ============================================================== -->
            <div id="tab-supabase" class="admin-tab-panel">
                <div class="panel-header-card">
                    <div>
                        <h3><i class="fa-solid fa-database"></i> Integration Settings: PostgreSQL via Supabase</h3>
                        <p>Hubungkan website ke database Supabase Cloud PostgreSQL secara real-time.</p>
                    </div>
                </div>

                <form id="formSupabase" class="admin-form-card">
                    <div class="admin-form-group">
                        <label>Supabase Project URL</label>
                        <input type="url" id="supabaseUrl" class="admin-form-control" value="https://ydmmynesclhlqcijjwfu.supabase.co" readonly>
                    </div>
                    <div class="admin-form-group">
                        <label>Supabase Storage Bucket Name</label>
                        <input type="text" id="supabaseBucket" class="admin-form-control" value="web_dusun_storage" readonly>
                    </div>

                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <a href="../sql/schema.sql" download class="btn-secondary" style="padding: 10px 20px; font-weight: 700; border-radius: 10px; text-decoration: none;">
                            <i class="fa-solid fa-file-code"></i> Unduh File PostgreSQL Schema (.sql)
                        </a>
                    </div>
                </form>

                <div class="admin-form-card">
                    <h4><i class="fa-solid fa-circle-info"></i> Petunjuk Integrasi Supabase PostgreSQL:</h4>
                    <ol style="color: var(--admin-text-muted); line-height: 1.8; font-size: 0.92rem; padding-left: 20px;">
                        <li>Buka <a href="https://supabase.com" target="_blank" style="color: var(--admin-accent-blue);">Supabase Dashboard</a> dan buat project baru.</li>
                        <li>Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda.</li>
                        <li>Salin isi file <code>sql/schema.sql</code> lalu jalankan di SQL Editor untuk secara otomatis membuat seluruh tabel & kolom database PostgreSQL.</li>
                    </ol>
                </div>
            </div>

        </div>
    </main>
</div>


<!-- ==========================================================================
     REUSABLE ADMIN CRUD MODAL
     ========================================================================== -->
<div id="adminModalBackdrop" class="admin-modal-backdrop">
    <div class="admin-modal-box">
        <div class="admin-modal-header">
            <h4 id="adminModalTitle">Judul Form Modal</h4>
            <button class="btn-close-admin-modal" onclick="closeAdminModal()">&times;</button>
        </div>
        <div id="adminModalBody">
            <!-- Injected dynamically -->
        </div>
    </div>
</div>

<!-- Admin JavaScript -->
<script src="assets/js/admin-script.js"></script>
</body>
</html>

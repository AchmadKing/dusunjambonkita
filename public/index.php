<?php
/**
 * Public Portal - Dusun Jambon
 * Dynamic Native PHP Backend Rendering with Supabase PostgreSQL
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Fetch All Dynamic Content from Database
$berandaRes = Database::select('beranda_content', '*', ['id' => 1]);
$b = (!empty($berandaRes['data'])) ? $berandaRes['data'][0] : [];

$profilRes = Database::select('profil_content', '*', ['id' => 1]);
$p = (!empty($profilRes['data'])) ? $profilRes['data'][0] : [];

$kontakRes = Database::select('kontak_content', '*', ['id' => 1]);
$k = (!empty($kontakRes['data'])) ? $kontakRes['data'][0] : [];

$petaRes = Database::select('administrasi_peta', '*', ['id' => 1]);
$peta = (!empty($petaRes['data'])) ? $petaRes['data'][0] : [];

$umkmRes = Database::select('umkm', '*');
$umkmList = ($umkmRes['status'] === 'success' && is_array($umkmRes['data'])) ? $umkmRes['data'] : [];
$totalUmkm = count($umkmList);

$beritaRes = Database::select('berita', '*');
$beritaList = ($beritaRes['status'] === 'success' && is_array($beritaRes['data'])) ? $beritaRes['data'] : [];

$lokasiRes = Database::select('titik_lokasi', '*');
$lokasiList = ($lokasiRes['status'] === 'success' && is_array($lokasiRes['data'])) ? $lokasiRes['data'] : [];

$galleryRes = Database::select('profil_gallery', '*');
$galleryList = ($galleryRes['status'] === 'success' && is_array($galleryRes['data'])) ? $galleryRes['data'] : [];

// Process Misi List
$misiList = $p['misi_list'] ?? [];
if (is_string($misiList)) {
    $decoded = json_decode($misiList, true);
    $misiList = is_array($decoded) ? $decoded : array_values(array_filter(array_map('trim', explode("\n", $misiList))));
}

$pageTitle = 'Portal Resmi Dusun Jambon - Informasi & Transparansi Dusun';
require_once __DIR__ . '/../templates/header.php';
require_once __DIR__ . '/../templates/navbar.php';
require_once __DIR__ . '/../templates/sidebar.php';
?>

<!-- MAIN CONTENT AREA -->
<main class="main-wrapper">

    <!-- ==========================================================================
         1. SEKSI BERANDA
         ========================================================================== -->
    <section id="beranda" class="page-section active">
        <!-- Hero Banner -->
        <div class="hero-banner">
            <div class="hero-bg-graphic">
                <div class="hero-glow-1"></div>
                <div class="hero-glow-2"></div>
                <div class="hero-grid-pattern"></div>
            </div>
            <div class="container">
                <div class="hero-content-grid">
                    <div class="hero-text-area">
                        <h1 class="hero-headline">
                            <?= htmlspecialchars($b['hero_headline'] ?? 'Selamat Datang') ?> <span><?= htmlspecialchars($b['hero_headline_span'] ?? 'Di Portal Resmi') ?></span> <span class="highlight-red"><?= htmlspecialchars($b['hero_headline_red'] ?? 'Dusun Jambon') ?></span>
                        </h1>
                        <p class="hero-desc">
                            <?= htmlspecialchars($b['hero_desc'] ?? 'Portal Resmi Dusun Jambon memberikan informasi publik yang terbuka, efisien, dan transparan untuk kemajuan bersama warga Dusun Jambon.') ?>
                        </p>
                        <div class="hero-action-buttons">
                            <a href="#administrasi" class="btn-primary hero-nav-btn" data-target="administrasi">
                                <i class="fa-solid fa-map-location-dot"></i> Peta Administrasi
                            </a>
                            <a href="#berita" class="btn-secondary hero-nav-btn" data-target="berita">
                                <i class="fa-solid fa-newspaper"></i> Lihat Berita Dusun
                            </a>
                        </div>
                    </div>
                    <!-- Hero Image -->
                    <div class="hero-media-area">
                        <div class="hero-image-card">
                            <img src="<?= htmlspecialchars($b['hero_image_url'] ?? 'assets/img/Masjid_Al-Falah.jpg') ?>" alt="Masjid Al-Falah Dusun Jambon" class="hero-main-img">
                            <div class="hero-image-caption">
                                <i class="fa-solid fa-mosque"></i>
                                <span><?= htmlspecialchars($b['hero_image_caption'] ?? 'Masjid Al-Falah — Dusun Jambon') ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon gold">
                        <i class="fa-solid fa-house-chimney-user"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">5 RT</div>
                        <div class="stat-label">Struktur Rukun Tetangga</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fa-solid fa-shop"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value" id="berandaUmkmCountDisplay"><?= $totalUmkm ?> Usaha</div>
                        <div class="stat-label">UMKM Warga Dusun</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sambutan Kepala Dusun -->
        <div class="container" style="margin-top: 40px;">
            <div class="profile-content-grid">
                <div class="placeholder-image-box" style="height: 320px;">
                    <?php if (!empty($b['kepala_dusun_image_url'])): ?>
                        <img src="<?= htmlspecialchars($b['kepala_dusun_image_url']) ?>" alt="Foto Kepala Wilayah" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
                    <?php else: ?>
                        <span class="placeholder-tag">Kepala Wilayah</span>
                        <div class="placeholder-icon">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <h3 class="placeholder-title" id="kdNameDisplay"><?= htmlspecialchars($b['kepala_dusun_name'] ?? 'Kepala Wilayah Dusun Jambon') ?></h3>
                        <p class="placeholder-subtitle">Foto Resmi Kepala Wilayah Dusun Jambon</p>
                    <?php endif; ?>
                </div>
                <div class="history-card">
                    <h3 id="kdTitleDisplay"><?= htmlspecialchars($b['kepala_dusun_title'] ?? 'Sambutan Kepala Wilayah Dusun Jambon') ?></h3>
                    <p id="kdSpeechDisplay1">
                        "<?= htmlspecialchars($b['kepala_dusun_speech_1'] ?? "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal digital resmi Dusun Jambon.") ?>"
                    </p>
                    <p id="kdSpeechDisplay2">
                        <?= htmlspecialchars($b['kepala_dusun_speech_2'] ?? "Kami mengajak seluruh lapisan warga Dusun Jambon untuk memanfaatkan fasilitas digital ini secara bijak demi kemajuan bersama.") ?>
                    </p>
                    <div style="margin-top: 20px; font-weight: 700; color: var(--accent-red);" id="kdSignatureDisplay">
                        - <?= htmlspecialchars($b['kepala_dusun_name'] ?? 'Kepala Wilayah Dusun Jambon') ?>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         2. SEKSI PROFIL & SEJARAH DUSUN JAMBON
         ========================================================================== -->
    <section id="profil" class="page-section">
        <div class="container">
            <div class="section-title-group">
                <span class="section-tag"><i class="fa-solid fa-id-card"></i> Tentang Kami</span>
                <h2 class="section-title">Profil & Sejarah Dusun Jambon</h2>
                <p class="section-subtitle">Mengenal lebih dekat asal-usul, visi misi, serta potensi wilayah Dusun Jambon.</p>
            </div>

            <div class="profile-content-grid">
                <div class="history-card">
                    <h3>Sejarah Dusun Jambon</h3>
                    <p id="profilSejarahDisplay1">
                        <?= htmlspecialchars($p['sejarah_p1'] ?? 'Dusun Jambon berdiri sejak puluhan tahun yang lalu...') ?>
                    </p>
                    <p id="profilSejarahDisplay2">
                        <?= htmlspecialchars($p['sejarah_p2'] ?? 'Seiring berjalannya waktu, Dusun Jambon berkembang menjadi wilayah yang berdaya...') ?>
                    </p>
                </div>
                <div class="slideshow-container" id="profileSejarahSlideshow">
                    <div class="slideshow-wrapper" id="profilSlideshowTrack">
                        <!-- Slides Injected Dynamically -->
                    </div>
                    <button class="slide-btn slide-prev" id="slidePrevBtn" aria-label="Sebelumnya"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slide-btn slide-next" id="slideNextBtn" aria-label="Berikutnya"><i class="fa-solid fa-chevron-right"></i></button>
                    <div class="slide-dots" id="slideDots">
                        <!-- Dots Injected Dynamically -->
                    </div>
                </div>
            </div>

            <!-- Visi & Misi -->
            <div class="vision-mission-grid">
                <div class="vm-card">
                    <div class="vm-header">
                        <i class="fa-solid fa-bullseye"></i>
                        <h4>Visi Dusun Jambon</h4>
                    </div>
                    <div class="vm-body">
                        <p id="profilVisiDisplay">
                            "<?= htmlspecialchars($p['visi_text'] ?? 'Mewujudkan Dusun Jambon yang Mandiri, Sejahtera, Berbudaya...') ?>"
                        </p>
                    </div>
                </div>
                <div class="vm-card mission">
                    <div class="vm-header">
                        <i class="fa-solid fa-rocket"></i>
                        <h4>Misi Dusun Jambon</h4>
                    </div>
                    <div class="vm-body">
                        <ul id="profilMisiDisplay">
                            <?php foreach ($misiList as $misiItem): ?>
                                <li><i class="fa-solid fa-check"></i> <?= htmlspecialchars($misiItem) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Galeri Foto Dusun Grid -->
            <div style="margin-top: 60px;">
                <h3 style="font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 24px; text-align: center;">
                    Galeri Dokumentasi Dusun Jambon
                </h3>
                <div class="gallery-grid" id="profilGalleryGrid">
                    <?php foreach ($galleryList as $g): ?>
                        <div class="gallery-card" onclick="openImageModal('<?= htmlspecialchars($g['image_url']) ?>', '<?= htmlspecialchars($g['title']) ?>')">
                            <div class="gallery-img-box">
                                <img src="<?= htmlspecialchars($g['image_url']) ?>" alt="<?= htmlspecialchars($g['title']) ?>">
                                <div class="gallery-overlay">
                                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                                </div>
                            </div>
                            <div class="gallery-info">
                                <span class="gallery-tag"><?= htmlspecialchars($g['tag'] ?? 'Kegiatan') ?></span>
                                <h4 class="gallery-title"><?= htmlspecialchars($g['title']) ?></h4>
                                <p class="gallery-subtitle"><?= htmlspecialchars($g['subtitle'] ?? '') ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         3. SEKSI BERITA DUSUN
         ========================================================================== -->
    <section id="berita" class="page-section">
        <div class="container">
            <div class="section-title-group">
                <span class="section-tag"><i class="fa-solid fa-newspaper"></i> Informasi Terbaru</span>
                <h2 class="section-title">Berita & Pengumuman Dusun</h2>
                <p class="section-subtitle">Dapatkan info kabar terkini seputar kegiatan, pembangunan, dan pengumuman Dusun Jambon.</p>
            </div>

            <!-- Search & Category Filter -->
            <div class="filter-search-bar">
                <div class="search-box-wrapper">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="newsSearchInput" class="search-input" placeholder="Cari judul berita atau kegiatan...">
                </div>
                <div class="category-pills">
                    <button class="pill-btn news-pill active" data-category="all">Semua Berita</button>
                    <button class="pill-btn news-pill" data-category="pengumuman">Pengumuman</button>
                    <button class="pill-btn news-pill" data-category="pembangunan">Pembangunan</button>
                    <button class="pill-btn news-pill" data-category="kegiatan">Kegiatan Warga</button>
                </div>
            </div>

            <!-- News Grid Cards -->
            <div class="news-grid" id="newsGrid">
                <?php foreach ($beritaList as $news): ?>
                    <article class="news-card" data-category="<?= htmlspecialchars($news['category']) ?>" data-title="<?= htmlspecialchars(strtolower($news['title'])) ?>">
                        <div class="news-img-box">
                            <?php if (!empty($news['image_url'])): ?>
                                <img src="<?= htmlspecialchars($news['image_url']) ?>" alt="<?= htmlspecialchars($news['title']) ?>" style="width:100%; height:100%; object-fit:cover;">
                            <?php else: ?>
                                <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                                    <span class="placeholder-tag"><?= htmlspecialchars($news['category']) ?></span>
                                    <div class="placeholder-icon"><i class="fa-regular fa-newspaper"></i></div>
                                    <h4 class="placeholder-title"><?= htmlspecialchars($news['title']) ?></h4>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span><i class="fa-regular fa-calendar"></i> <?= htmlspecialchars($news['date_str']) ?></span>
                                <span><i class="fa-regular fa-user"></i> <?= htmlspecialchars($news['author']) ?></span>
                            </div>
                            <h3 class="news-title"><?= htmlspecialchars($news['title']) ?></h3>
                            <p class="news-excerpt"><?= htmlspecialchars($news['excerpt']) ?></p>
                            <div class="news-footer">
                                <button class="btn-read-more" onclick="readNewsModal('<?= htmlspecialchars(addslashes($news['title'])) ?>', '<?= htmlspecialchars($news['date_str']) ?>', '<?= htmlspecialchars($news['category']) ?>', '<?= htmlspecialchars(addslashes(nl2br($news['content']))) ?>', '<?= htmlspecialchars($news['image_url'] ?? '') ?>')">
                                    Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         4. SEKSI ADMINISTRASI DUSUN JAMBON
         ========================================================================== -->
    <section id="administrasi" class="page-section">
        <div class="container">
            <div class="section-title-group">
                <span class="section-tag"><i class="fa-solid fa-map-location-dot"></i> Peta Wilayah & Titik Lokasi</span>
                <h2 class="section-title">Peta Administrasi Dusun Jambon</h2>
                <p class="section-subtitle">Wilayah administrasi Dusun Jambon beserta direktori koordinat lokasi penting, masjid, dan kediaman Ketua RT.</p>
            </div>

            <div class="admin-grid-layout">
                <!-- Peta Administrasi Banner Card -->
                <div class="admin-map-card grid-full-width">
                    <div class="map-card-header">
                        <div class="map-header-info">
                            <span class="badge-map"><i class="fa-solid fa-layer-group"></i> Peta Resmi Dusun</span>
                            <h3 id="petaTitleDisplay"><?= htmlspecialchars($peta['map_title'] ?? 'Peta Administrasi Wilayah Dusun Jambon') ?></h3>
                            <p id="petaDescDisplay"><?= htmlspecialchars($peta['map_desc'] ?? 'Visualisasi pemetaan wilayah administrasi, pembagian zona RT/RW, dan batas wilayah Dusun Jambon.') ?></p>
                        </div>
                        <div class="map-header-actions">
                            <button class="btn-primary" id="btnZoomPeta">
                                <i class="fa-solid fa-expand"></i> Perbesar Peta
                            </button>
                            <a href="<?= htmlspecialchars($peta['map_image_url'] ?? 'assets/img/PetaAdministrasiJambon.png') ?>" id="btnDownloadPeta" download="Peta_Administrasi_Dusun_Jambon.png" class="btn-secondary">
                                <i class="fa-solid fa-download"></i> Unduh Peta
                            </a>
                        </div>
                    </div>
                    <div class="map-image-wrapper" id="petaImgWrapper" title="Klik untuk memperbesar tampilan peta">
                        <img src="<?= htmlspecialchars($peta['map_image_url'] ?? 'assets/img/PetaAdministrasiJambon.png') ?>" alt="Peta Administrasi Dusun Jambon" class="map-main-img" id="petaMainImg">
                        <div class="map-hover-overlay">
                            <span><i class="fa-solid fa-magnifying-glass-plus"></i> Klik untuk Melihat Ukuran Penuh</span>
                        </div>
                    </div>
                </div>

                <!-- Locations Filter Header -->
                <div class="location-section-header grid-full-width">
                    <div class="location-header-top">
                        <div>
                            <h3><i class="fa-solid fa-location-dot"></i> Titik Lokasi Penting & Koordinat Google Maps</h3>
                            <p>Klik gambar untuk perbesar foto atau klik tombol koordinat untuk menavigasi via Google Maps.</p>
                        </div>
                        <div class="category-pills">
                            <button class="pill-btn location-pill active" data-category="all">Semua Lokasi</button>
                            <button class="pill-btn location-pill" data-category="ibadah">Tempat Ibadah</button>
                            <button class="pill-btn location-pill" data-category="rt">Rumah Ketua RT</button>
                        </div>
                    </div>
                </div>

                <!-- Locations Grid -->
                <div class="location-grid grid-full-width" id="locationGrid">
                    <?php foreach ($lokasiList as $loc): ?>
                        <div class="location-card" data-category="<?= htmlspecialchars($loc['category']) ?>">
                            <div class="location-img-box" onclick="openImageModal('<?= htmlspecialchars($loc['image_url'] ?: 'assets/img/Masjid_Al-Falah.jpg') ?>', '<?= htmlspecialchars($loc['title']) ?>')" title="Klik untuk perbesar foto">
                                <img src="<?= htmlspecialchars($loc['image_url'] ?: 'assets/img/Masjid_Al-Falah.jpg') ?>" alt="<?= htmlspecialchars($loc['title']) ?>" class="location-img">
                                <span class="location-badge <?= htmlspecialchars($loc['badge_color'] ?: 'blue') ?>">
                                    <i class="fa-solid <?= $loc['category'] === 'ibadah' ? 'fa-mosque' : 'fa-house-user' ?>"></i> <?= htmlspecialchars($loc['badge_label'] ?: $loc['category']) ?>
                                </span>
                            </div>
                            <div class="location-body">
                                <h4 class="location-title"><?= htmlspecialchars($loc['title']) ?></h4>
                                <p class="location-desc"><?= htmlspecialchars($loc['description']) ?></p>
                                <div class="coordinate-info">
                                    <span class="coord-label"><i class="fa-solid fa-crosshairs"></i> Koordinat:</span>
                                    <span class="coord-val"><?= htmlspecialchars($loc['coordinates']) ?></span>
                                </div>
                                <a href="<?= htmlspecialchars($loc['gmaps_url']) ?>" target="_blank" rel="noopener noreferrer" class="btn-gmaps">
                                    <i class="fa-solid fa-map-location-dot"></i> Buka Google Maps
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         5. SEKSI DAFTAR UMKM DUSUN JAMBON
         ========================================================================== -->
    <section id="umkm" class="page-section">
        <div class="container">
            <div class="section-title-group">
                <span class="section-tag"><i class="fa-solid fa-shop"></i> Ekonomi Lokal</span>
                <h2 class="section-title">Katalog UMKM Dusun Jambon</h2>
                <p class="section-subtitle">Dukung karya dan produk kebanggaan warga lokal Dusun Jambon.</p>
            </div>

            <!-- UMKM Filter Bar -->
            <div class="umkm-header-actions">
                <div class="category-pills">
                    <button class="pill-btn umkm-pill active" data-category="all">Semua UMKM</button>
                    <button class="pill-btn umkm-pill" data-category="kuliner">Kuliner</button>
                    <button class="pill-btn umkm-pill" data-category="kerajinan">Kerajinan Tangan</button>
                    <button class="pill-btn umkm-pill" data-category="pertanian">Pertanian/Hasil Alam</button>
                </div>
            </div>

            <!-- UMKM Grid Cards -->
            <div class="umkm-grid" id="umkmGrid">
                <?php foreach ($umkmList as $item): ?>
                    <div class="umkm-card" data-category="<?= htmlspecialchars($item['category']) ?>">
                        <div class="umkm-img-box">
                            <?php if (!empty($item['image_url'])): ?>
                                <img src="<?= htmlspecialchars($item['image_url']) ?>" alt="<?= htmlspecialchars($item['title']) ?>" style="width:100%; height:100%; object-fit:cover;">
                            <?php else: ?>
                                <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                                    <span class="placeholder-tag"><?= htmlspecialchars($item['category']) ?></span>
                                    <div class="placeholder-icon"><i class="fa-solid fa-shop"></i></div>
                                    <h4 class="placeholder-title"><?= htmlspecialchars($item['title']) ?></h4>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="umkm-body">
                            <span class="umkm-category-tag"><?= htmlspecialchars($item['category']) ?></span>
                            <h3 class="umkm-title"><?= htmlspecialchars($item['title']) ?></h3>
                            <div class="umkm-owner"><i class="fa-regular fa-user"></i> Pemilik: <?= htmlspecialchars($item['owner']) ?></div>
                            <p class="umkm-desc"><?= htmlspecialchars($item['description']) ?></p>
                            <div class="umkm-footer">
                                <div class="umkm-price"><?= htmlspecialchars($item['price_str']) ?></div>
                                <a href="https://wa.me/<?= htmlspecialchars($item['whatsapp']) ?>?text=<?= urlencode('Halo ' . $item['owner'] . ', saya ingin pesan ' . $item['title']) ?>" target="_blank" class="btn-wa-order">
                                    <i class="fa-brands fa-whatsapp"></i> Pesan WA
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- ==========================================================================
         6. SEKSI KONTAK & LOKASI
         ========================================================================== -->
    <section id="kontak" class="page-section">
        <div class="container">
            <div class="section-title-group">
                <span class="section-tag"><i class="fa-solid fa-phone"></i> Hubungi Kami</span>
                <h2 class="section-title">Kontak & Informasi Dusun</h2>
                <p class="section-subtitle">Silakan hubungi kami atau sampaikan aspirasi Anda untuk kemajuan bersama warga Dusun Jambon.</p>
            </div>

            <div class="contact-grid">
                <!-- Info Left Card -->
                <div class="contact-info-card">
                    <h3>Informasi Kontak Dusun</h3>
                    <div class="info-list">
                        <div class="info-item">
                            <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
                            <div class="info-details">
                                <h5>Alamat Lengkap</h5>
                                <p id="kontakAddressDisplay"><?= htmlspecialchars($k['address'] ?? 'Dusun Jambon, Desa Karangtalun, Kec. Ngluwar, Kab. Magelang, Jawa Tengah 56485') ?></p>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon"><i class="fa-solid fa-clock"></i></div>
                            <div class="info-details">
                                <h5>Jam Operasional Pelayanan</h5>
                                <p>Senin - Jumat: 08:00 - 15:30 WIB<br>Sabtu & Minggu: Libur (Darurat via WA)</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon"><i class="fa-solid fa-phone"></i></div>
                            <div class="info-details">
                                <h5>Telepon / WhatsApp Resmi</h5>
                                <p id="kontakPhoneDisplay"><?= htmlspecialchars($k['phone'] ?? '+62 812-3456-7890') ?></p>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon"><i class="fa-solid fa-envelope"></i></div>
                            <div class="info-details">
                                <h5>Email Layanan</h5>
                                <p id="kontakEmailDisplay"><?= htmlspecialchars($k['email'] ?? 'admin@dusunjambon.id') ?></p>
                            </div>
                        </div>
                    </div>

                    <!-- Map Embed Container -->
                    <div style="margin-top: 24px; border-radius:14px; overflow:hidden;">
                        <iframe id="kontakGmapsIframe" src="<?= htmlspecialchars($k['gmaps_embed'] ?? 'https://maps.google.com/maps?q=-7.662602,110.26933&z=15&output=embed') ?>" width="100%" height="260" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                    </div>
                </div>

                <!-- Contact Form Right Card -->
                <div class="contact-form-card">
                    <h3>Kirim Pesan / Aspirasi</h3>
                    <form id="mainContactForm">
                        <div class="form-group">
                            <label class="form-label">Nama Lengkap</label>
                            <input type="text" class="form-input" placeholder="Masukkan nama Anda" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nomor WhatsApp / HP</label>
                            <input type="tel" class="form-input" placeholder="08xxxxxxxxxx" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Kategori Pesan</label>
                            <select class="form-select" required>
                                <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                                <option value="Saran & Aspirasi">Saran & Aspirasi Warga</option>
                                <option value="Pengaduan Pelayanan">Pengaduan Pelayanan</option>
                                <option value="Informasi UMKM">Informasi UMKM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Isi Pesan / Aspirasi</label>
                            <textarea class="form-textarea" placeholder="Tuliskan pesan Anda secara jelas..." required></textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
                            <i class="fa-solid fa-paper-plane"></i> Kirim Pesan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

</main>

<?php require_once __DIR__ . '/../templates/footer.php'; ?>

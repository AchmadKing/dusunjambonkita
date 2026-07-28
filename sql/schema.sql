-- ============================================================================
-- SKRIP DATABASE POSTGRESQL UNTUK SUPABASE - DUSUN JAMBON
-- ============================================================================
-- Salin dan jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ============================================================================

-- 0. TABEL ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) DEFAULT 'Admin Dusun',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin Default (email: admin@dusunjambon.id, password: admin123)
INSERT INTO admin_users (id, username, email, password_hash, name)
VALUES (
    1,
    'admin@dusunjambon.id',
    'admin@dusunjambon.id',
    '$2y$10$gxVnjD6r/7yX9cUM5MNDeOuyHQuEkzCOWOgQewX/9g0T46PRCh7Bu',
    'Admin Perangkat Dusun'
) ON CONFLICT (id) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;


-- 1. TABEL BERANDA (HERO & SAMBUTAN)
CREATE TABLE IF NOT EXISTS beranda_content (
    id SERIAL PRIMARY KEY,
    hero_headline VARCHAR(255) NOT NULL,
    hero_headline_span VARCHAR(255) NOT NULL,
    hero_headline_red VARCHAR(255) NOT NULL,
    hero_desc TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    hero_image_caption VARCHAR(255) NOT NULL,
    kepala_dusun_title VARCHAR(255) NOT NULL,
    kepala_dusun_speech_1 TEXT NOT NULL,
    kepala_dusun_speech_2 TEXT NOT NULL,
    kepala_dusun_name VARCHAR(255) NOT NULL,
    kepala_dusun_image_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Beranda (Row 1)
INSERT INTO beranda_content (
    id, hero_headline, hero_headline_span, hero_headline_red, hero_desc,
    hero_image_url, hero_image_caption, kepala_dusun_title,
    kepala_dusun_speech_1, kepala_dusun_speech_2, kepala_dusun_name, kepala_dusun_image_url
) VALUES (
    1,
    'Selamat Datang', 'Di Portal Resmi', 'Dusun Jambon',
    'Portal Resmi Dusun Jambon memberikan informasi publik yang terbuka, efisien, dan transparan untuk kemajuan bersama warga Dusun Jambon.',
    'assets/img/Masjid_Al-Falah.jpg',
    'Masjid Al-Falah — Dusun Jambon',
    'Sambutan Kepala Wilayah Dusun Jambon',
    'Assalamu''alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal digital resmi Dusun Jambon. Website ini kami hadirkan sebagai sarana transparansi publik, kemudahan akses administrasi perangkat desa, serta ajang promosi UMKM produk asli karya warga kami.',
    'Kami mengajak seluruh lapisan warga Dusun Jambon untuk memanfaatkan fasilitas digital ini secara bijak demi kemajuan dan kesejahteraan bersama.',
    'Kepala Wilayah Dusun Jambon',
    ''
) ON CONFLICT (id) DO NOTHING;


-- 2. TABEL PROFIL & VISI MISI
CREATE TABLE IF NOT EXISTS profil_content (
    id SERIAL PRIMARY KEY,
    sejarah_p1 TEXT NOT NULL,
    sejarah_p2 TEXT NOT NULL,
    visi_text TEXT NOT NULL,
    misi_list JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Profil (Row 1)
INSERT INTO profil_content (id, sejarah_p1, sejarah_p2, visi_text, misi_list)
VALUES (
    1,
    'Dusun Jambon berdiri sejak puluhan tahun yang lalu, nama dusun Jambon diambil dari nama Mbah Kyai Syeikh Jambu Karang. "Jambu" diambil menjadi Jambon dan "Karang" diambil menjadi Karangtalun yang pada akhirnya menjadi Dusun Jambon Desa Karangtalun. Hingga saat ini, terdapat banyak makam kyai dan pejuang dari era Pangeran Diponegoro yang masih tersimpan. Uniknya, kebanyakan warga Dusun Jambon masih satu silsilah atau trah sehingga bisa dibilang seluruh warga Dusun Jambon adalah saudara sedulur.',
    'Seiring berjalannya waktu, Dusun Jambon berkembang menjadi wilayah yang berdaya, menjunjung tinggi nilai gotong royong, kebudayaan lokal, serta semangat inovasi di bidang pertanian dan kewirausahaan UMKM.',
    'Mewujudkan Dusun Jambon yang Mandiri, Sejahtera, Berbudaya, dan Terdepan dalam Pelayanan Publik Berbasis Teknologi Informasi digital.',
    '["Meningkatkan kualitas pelayanan publik yang transparan dan cepat.", "Mengembangkan potensi ekonomi lokal melalui pemberdayaan UMKM.", "Memperkuat semangat gotong royong dan kelestarian lingkungan hidup."]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- 3. TABEL GALERI PROFIL & SLIDESHOW
CREATE TABLE IF NOT EXISTS profil_gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) DEFAULT '',
    tag VARCHAR(100) DEFAULT 'Kegiatan',
    image_url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'gallery', -- 'slideshow' atau 'gallery'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Galeri
INSERT INTO profil_gallery (id, title, subtitle, tag, image_url, type) VALUES
(1, 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 1)', 'Sejarah & Arsip', 'Kegiatan 1', 'assets/img/kegiatan1.jpg', 'slideshow'),
(2, 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 2)', 'Sejarah & Arsip', 'Kegiatan 2', 'assets/img/kegiatan2.jpg', 'slideshow'),
(3, 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 3)', 'Sejarah & Arsip', 'Kegiatan 3', 'assets/img/kegiatan3.jpg', 'slideshow'),
(4, 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 4)', 'Sejarah & Arsip', 'Kegiatan 4', 'assets/img/kegiatan4.jpg', 'slideshow'),
(5, 'Dokumentasi Kegiatan 1', 'Dokumentasi Kegiatan Warga Dusun Jambon', 'Kegiatan 1', 'assets/img/kegiatan1.jpg', 'gallery'),
(6, 'Dokumentasi Kegiatan 2', 'Dokumentasi Kegiatan Warga Dusun Jambon', 'Kegiatan 2', 'assets/img/kegiatan2.jpg', 'gallery'),
(7, 'Dokumentasi Kegiatan 3', 'Dokumentasi Kegiatan Warga Dusun Jambon', 'Kegiatan 3', 'assets/img/kegiatan3.jpg', 'gallery'),
(8, 'Dokumentasi Kegiatan 4', 'Dokumentasi Kegiatan Warga Dusun Jambon', 'Kegiatan 4', 'assets/img/kegiatan4.jpg', 'gallery')
ON CONFLICT (id) DO NOTHING;


-- 4. TABEL BERITA DUSUN
CREATE TABLE IF NOT EXISTS berita (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'kegiatan', 'pembangunan', 'pengumuman'
    date_str VARCHAR(100) NOT NULL,
    author VARCHAR(100) DEFAULT 'Pengurus Dusun',
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Berita
INSERT INTO berita (id, title, category, date_str, author, excerpt, content, image_url) VALUES
(1, 'Kerja Bakti Massal Sambut Musim Hujan di Dusun Jambon', 'kegiatan', '24 Juli 2026', 'Sekretaris Dusun', 'Seluruh warga dari RT 01 hingga RT 05 kompak melaksanakan gotong royong membersihkan selokan dan drainase desa...', 'Seluruh warga Dusun Jambon menunjukkan kebersamaan yang tinggi dalam kegiatan kerja bakti pembersihan saluran air guna mencegah genangan air saat musim hujan mendatang.', ''),
(2, 'Pengaspalan Jalan Utama Dusun Selesai 100%', 'pembangunan', '20 Juli 2026', 'Tim Pembangunan', 'Akses transportasi warga kini semakin lancar dan aman berkat selesainya proyek perbaikan jalan sepanjang 1.2 KM...', 'Proyek pengaspalan jalan utama Dusun Jambon telah rampung sepenuhnya. Hal ini diharapkan mampu meningkatkan percepatan roda ekonomi dan aksesibilitas hasil panen petani setempat.', ''),
(3, 'Pelatihan Digital Marketing Gratis Untuk Pelaku UMKM', 'pengumuman', '18 Juli 2026', 'Pengurus UMKM', 'Diumumkan kepada seluruh pemilik UMKM Dusun Jambon untuk menghadiri workshop promosi produk via sosial media & marketplace...', 'Pemerintah Dusun Jambon bekerjasama dengan akademisi menyelenggarakan pelatihan pemasaran digital agar produk lokal warga dapat menjangkau pasar nasional.', '')
ON CONFLICT (id) DO NOTHING;


-- 5. TABEL PETA ADMINISTRASI
CREATE TABLE IF NOT EXISTS administrasi_peta (
    id SERIAL PRIMARY KEY,
    map_title VARCHAR(255) NOT NULL,
    map_desc TEXT NOT NULL,
    map_image_url TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Peta Administrasi (Row 1)
INSERT INTO administrasi_peta (id, map_title, map_desc, map_image_url) VALUES (
    1,
    'Peta Administrasi Wilayah Dusun Jambon',
    'Visualisasi pemetaan wilayah administrasi, pembagian zona RT/RW, dan batas wilayah Dusun Jambon.',
    'assets/img/PetaAdministrasiJambon.png'
) ON CONFLICT (id) DO NOTHING;


-- 6. TABEL TITIK LOKASI PENTING & KOORDINAT GOOGLE MAPS
CREATE TABLE IF NOT EXISTS titik_lokasi (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'ibadah', 'rt'
    badge_label VARCHAR(100) NOT NULL,
    badge_color VARCHAR(50) DEFAULT 'blue', -- 'red', 'blue'
    description TEXT NOT NULL,
    coordinates VARCHAR(100) NOT NULL,
    gmaps_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Titik Lokasi
INSERT INTO titik_lokasi (id, title, category, badge_label, badge_color, description, coordinates, gmaps_url, image_url) VALUES
(1, 'Masjid Al-Falah', 'ibadah', 'Tempat Ibadah', 'red', 'Pusat peribadatan utama dan kegiatan keagamaan warga Dusun Jambon.', '-7.662602, 110.26933', 'https://www.google.com/maps?q=-7.662602,110.26933', 'assets/img/Masjid_Al-Falah.jpg'),
(2, 'Rumah RT 01', 'rt', 'Pengurus RT 01', 'blue', 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 01.', '-7.661971, 110.268369', 'https://www.google.com/maps?q=-7.661971,110.268369', 'assets/img/Rumah_RT1.jpg'),
(3, 'Rumah RT 02', 'rt', 'Pengurus RT 02', 'blue', 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 02.', '-7.661751, 110.269771', 'https://www.google.com/maps?q=-7.661751,110.269771', 'assets/img/Rumah_RT2.jpg'),
(4, 'Rumah RT 03', 'rt', 'Pengurus RT 03', 'blue', 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 03.', '-7.662700, 110.269351', 'https://www.google.com/maps?q=-7.662700,110.269351', 'assets/img/Rumah_RT3.jpg'),
(5, 'Rumah RT 04', 'rt', 'Pengurus RT 04', 'blue', 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 04.', '-7.663517, 110.269899', 'https://www.google.com/maps?q=-7.663517,110.269899', 'assets/img/Rumah_RT4.jpg'),
(6, 'Rumah RT 05', 'rt', 'Pengurus RT 05', 'blue', 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 05.', '-7.663298, 110.269126', 'https://www.google.com/maps?q=-7.663298,110.269126', 'assets/img/Rumah_RT5.jpg')
ON CONFLICT (id) DO NOTHING;


-- 7. TABEL DATA UMKM
CREATE TABLE IF NOT EXISTS umkm (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'kuliner', 'kerajinan', 'pertanian'
    price_str VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data UMKM
INSERT INTO umkm (id, title, owner, category, price_str, whatsapp, description, image_url) VALUES
(1, 'Rara Kue', 'Ibu Maryam', 'kuliner', 'Rp 15.000 / bks', '6281234567890', 'Keripik tempe renyah bumbu rempah tradisional khas Dusun Jambon tanpa bahan pengawet.', ''),
(2, 'Anyaman Bambu & Tampah Hias', 'Bpk. Suwandi', 'kerajinan', 'Rp 35.000 - Rp 150.000', '6281234567891', 'Kerajinan perabotan dan hiasan dinding dari olahan bambu pilihan berkualitas tinggi.', ''),
(3, 'Madu Hutan Murni Asli Dusun', 'Kelompok Tani Hutan', 'pertanian', 'Rp 85.000 / botol', '6281234567892', 'Madu murni alami hasil panen sarang lebah pohon liar Dusun Jambon, kaya nutrisi dan khasiat.', '')
ON CONFLICT (id) DO NOTHING;


-- 8. TABEL KONTAK DUSUN & INFORMASI
CREATE TABLE IF NOT EXISTS kontak_content (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    gmaps_embed TEXT NOT NULL,
    instagram VARCHAR(100) DEFAULT '',
    facebook VARCHAR(100) DEFAULT '',
    youtube VARCHAR(100) DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Kontak (Row 1)
INSERT INTO kontak_content (
    id, address, phone, email, whatsapp, gmaps_embed, instagram, facebook, youtube
) VALUES (
    1,
    'Dusun Jambon, Desa Karangtalun, Kec. Ngluwar, Kab. Magelang, Jawa Tengah 56485',
    '+62 812-3456-7890',
    'admin@dusunjambon.id',
    '6281234567890',
    'https://maps.google.com/maps?q=-7.662602,110.26933&z=15&output=embed',
    'https://instagram.com/dusunjambon',
    'https://facebook.com/dusunjambon',
    'https://youtube.com/@dusunjambon'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) SUPABASE
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beranda_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrasi_peta ENABLE ROW LEVEL SECURITY;
ALTER TABLE titik_lokasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access on all tables
CREATE POLICY "Public Read Admin Users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Public Read Beranda" ON beranda_content FOR SELECT USING (true);
CREATE POLICY "Public Read Profil" ON profil_content FOR SELECT USING (true);
CREATE POLICY "Public Read Profil Gallery" ON profil_gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Berita" ON berita FOR SELECT USING (true);
CREATE POLICY "Public Read Administrasi Peta" ON administrasi_peta FOR SELECT USING (true);
CREATE POLICY "Public Read Titik Lokasi" ON titik_lokasi FOR SELECT USING (true);
CREATE POLICY "Public Read UMKM" ON umkm FOR SELECT USING (true);
CREATE POLICY "Public Read Kontak" ON kontak_content FOR SELECT USING (true);

-- Allow full write/update/insert/delete access
CREATE POLICY "Full Access Admin Users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Beranda" ON beranda_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Profil" ON profil_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Profil Gallery" ON profil_gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Berita" ON berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Administrasi Peta" ON administrasi_peta FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Titik Lokasi" ON titik_lokasi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access UMKM" ON umkm FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Kontak" ON kontak_content FOR ALL USING (true) WITH CHECK (true);

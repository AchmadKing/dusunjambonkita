-- ============================================================================
-- MIGRATION: Multi Upload Images untuk Berita & UMKM
-- Dusun Jambon — Portal Resmi
-- ============================================================================
-- Jalankan skrip ini di Supabase SQL Editor SETELAH schema utama sudah aktif.
-- ============================================================================

-- 1. TABEL GAMBAR ISI BERITA (berita_images)
CREATE TABLE IF NOT EXISTS berita_images (
    id SERIAL PRIMARY KEY,
    berita_id INTEGER NOT NULL REFERENCES berita(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_berita_images_berita_id ON berita_images(berita_id);

-- 2. TABEL GAMBAR KATALOG UMKM (umkm_images)
CREATE TABLE IF NOT EXISTS umkm_images (
    id SERIAL PRIMARY KEY,
    umkm_id INTEGER NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_umkm_images_umkm_id ON umkm_images(umkm_id);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE berita_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm_images ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public Read Berita Images" ON berita_images FOR SELECT USING (true);
CREATE POLICY "Public Read UMKM Images" ON umkm_images FOR SELECT USING (true);

-- Full Write Access
CREATE POLICY "Full Access Berita Images" ON berita_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access UMKM Images" ON umkm_images FOR ALL USING (true) WITH CHECK (true);

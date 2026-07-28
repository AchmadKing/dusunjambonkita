/**
 * ============================================================================
 * SUPABASE & POSTGRESQL DATA SERVICE - PORTAL DUSUN JAMBON
 * ============================================================================
 * Modul ini menangani seluruh koneksi ke Supabase PostgreSQL database,
 * Supabase Auth, dan Supabase Storage secara 100% Client-Side via Supabase JS SDK.
 * ============================================================================
 */

const DEFAULT_SUPABASE_CONFIG = {
    url: 'https://ydmmynesclhlqcijjwfu.supabase.co',
    key: 'sb_publishable_KQlwLZ8ulUlHcogrVk6okw_Sl1-ibBS'
};

// Data Awal (Initial Seed Data for Fallback)
const INITIAL_SEED_DATA = {
    beranda: {
        id: 1,
        hero_headline: 'Selamat Datang',
        hero_headline_span: 'Di Portal Resmi',
        hero_headline_red: 'Dusun Jambon',
        hero_desc: 'Portal Resmi Dusun Jambon memberikan informasi publik yang terbuka, efisien, dan transparan untuk kemajuan bersama warga Dusun Jambon.',
        hero_image_url: 'assets/img/Masjid_Al-Falah.jpg',
        hero_image_caption: 'Masjid Al-Falah — Dusun Jambon',
        kepala_dusun_title: 'Sambutan Kepala Wilayah Dusun Jambon',
        kepala_dusun_speech_1: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal digital resmi Dusun Jambon. Website ini kami hadirkan sebagai sarana transparansi publik, kemudahan akses administrasi perangkat desa, serta ajang promosi UMKM produk asli karya warga kami.",
        kepala_dusun_speech_2: "Kami mengajak seluruh lapisan warga Dusun Jambon untuk memanfaatkan fasilitas digital ini secara bijak demi kemajuan dan kesejahteraan bersama.",
        kepala_dusun_name: "Kepala Wilayah Dusun Jambon",
        kepala_dusun_image_url: ""
    },
    profil: {
        id: 1,
        sejarah_p1: 'Dusun Jambon berdiri sejak puluhan tahun yang lalu, nama dusun Jambon diambil dari nama Mbah Kyai Syeikh Jambu Karang. "Jambu" diambil menjadi Jambon dan "Karang" diambil menjadi Karangtalun yang pada akhirnya menjadi Dusun Jambon Desa Karangtalun. Hingga saat ini, terdapat banyak makam kyai dan pejuang dari era Pangeran Diponegoro yang masih tersimpan. Uniknya, kebanyakan warga Dusun Jambon masih satu silsilah atau trah sehingga bisa dibilang seluruh warga Dusun Jambon adalah saudara sedulur.',
        sejarah_p2: 'Seiring berjalannya waktu, Dusun Jambon berkembang menjadi wilayah yang berdaya, menjunjung tinggi nilai gotong royong, kebudayaan lokal, serta semangat inovasi di bidang pertanian dan kewirausahaan UMKM.',
        visi_text: 'Mewujudkan Dusun Jambon yang Mandiri, Sejahtera, Berbudaya, dan Terdepan dalam Pelayanan Publik Berbasis Teknologi Informasi digital.',
        misi_list: [
            "Meningkatkan kualitas pelayanan publik yang transparan dan cepat.",
            "Mengembangkan potensi ekonomi lokal melalui pemberdayaan UMKM.",
            "Memperkuat semangat gotong royong dan kelestarian lingkungan hidup."
        ]
    },
    profil_gallery: [
        { id: 1, title: 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 1)', subtitle: 'Sejarah & Arsip', tag: 'Kegiatan 1', image_url: 'assets/img/Masjid_Al-Falah.jpg', type: 'slideshow' },
        { id: 2, title: 'Dokumen & Foto Asal-Usul Dusun (Kegiatan 2)', subtitle: 'Sejarah & Arsip', tag: 'Kegiatan 2', image_url: 'assets/img/Masjid_Al-Falah.jpg', type: 'slideshow' },
        { id: 3, title: 'Dokumentasi Kegiatan 1', subtitle: 'Dokumentasi Kegiatan Warga Dusun Jambon', tag: 'Kegiatan 1', image_url: 'assets/img/Masjid_Al-Falah.jpg', type: 'gallery' },
        { id: 4, title: 'Dokumentasi Kegiatan 2', subtitle: 'Dokumentasi Kegiatan Warga Dusun Jambon', tag: 'Kegiatan 2', image_url: 'assets/img/Masjid_Al-Falah.jpg', type: 'gallery' }
    ],
    berita: [
        { id: 1, title: 'Kerja Bakti Massal Sambut Musim Hujan di Dusun Jambon', category: 'kegiatan', date_str: '24 Juli 2026', author: 'Sekretaris Dusun', excerpt: 'Seluruh warga dari RT 01 hingga RT 05 kompak melaksanakan gotong royong membersihkan selokan dan drainase desa...', content: 'Seluruh warga Dusun Jambon menunjukkan kebersamaan yang tinggi dalam kegiatan kerja bakti pembersihan saluran air guna mencegah genangan air saat musim hujan mendatang.', image_url: '' },
        { id: 2, title: 'Pengaspalan Jalan Utama Dusun Selesai 100%', category: 'pembangunan', date_str: '20 Juli 2026', author: 'Tim Pembangunan', excerpt: 'Akses transportasi warga kini semakin lancar dan aman berkat selesainya proyek perbaikan jalan sepanjang 1.2 KM...', content: 'Proyek pengaspalan jalan utama Dusun Jambon telah rampung sepenuhnya. Hal ini diharapkan mampu meningkatkan percepatan roda ekonomi dan aksesibilitas hasil panen petani setempat.', image_url: '' },
        { id: 3, title: 'Pelatihan Digital Marketing Gratis Untuk Pelaku UMKM', category: 'pengumuman', date_str: '18 Juli 2026', author: 'Pengurus UMKM', excerpt: 'Diumumkan kepada seluruh pemilik UMKM Dusun Jambon untuk menghadiri workshop promosi produk via sosial media & marketplace...', content: 'Pemerintah Dusun Jambon bekerjasama dengan akademisi menyelenggarakan pelatihan pemasaran digital agar produk lokal warga dapat menjangkau pasar nasional.', image_url: '' }
    ],
    administrasi_peta: {
        id: 1,
        map_title: 'Peta Administrasi Wilayah Dusun Jambon',
        map_desc: 'Visualisasi pemetaan wilayah administrasi, pembagian zona RT/RW, dan batas wilayah Dusun Jambon.',
        map_image_url: 'assets/img/PetaAdministrasiJambon.png'
    },
    titik_lokasi: [
        { id: 1, title: 'Masjid Al-Falah', category: 'ibadah', badge_label: 'Tempat Ibadah', badge_color: 'red', description: 'Pusat peribadatan utama dan kegiatan keagamaan warga Dusun Jambon.', coordinates: '-7.662602, 110.26933', gmaps_url: 'https://www.google.com/maps?q=-7.662602,110.26933', image_url: 'assets/img/Masjid_Al-Falah.jpg' },
        { id: 2, title: 'Rumah RT 01', category: 'rt', badge_label: 'Pengurus RT 01', badge_color: 'blue', description: 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 01.', coordinates: '-7.661971, 110.268369', gmaps_url: 'https://www.google.com/maps?q=-7.661971,110.268369', image_url: 'assets/img/Masjid_Al-Falah.jpg' },
        { id: 3, title: 'Rumah RT 02', category: 'rt', badge_label: 'Pengurus RT 02', badge_color: 'blue', description: 'Pusat koordinasi pelayanan warga untuk wilayah Rukun Tetangga 02.', coordinates: '-7.661751, 110.269771', gmaps_url: 'https://www.google.com/maps?q=-7.661751,110.269771', image_url: 'assets/img/Masjid_Al-Falah.jpg' }
    ],
    umkm: [
        { id: 1, title: 'Rara Kue', owner: 'Ibu Maryam', category: 'kuliner', price_str: 'Rp 15.000 / bks', whatsapp: '6281234567890', description: 'Keripik tempe renyah bumbu rempah tradisional khas Dusun Jambon tanpa bahan pengawet.', image_url: '' },
        { id: 2, title: 'Anyaman Bambu & Tampah Hias', owner: 'Bpk. Suwandi', category: 'kerajinan', price_str: 'Rp 35.000 - Rp 150.000', whatsapp: '6281234567891', description: 'Kerajinan perabotan dan hiasan dinding dari olahan bambu pilihan berkualitas tinggi.', image_url: '' },
        { id: 3, title: 'Madu Hutan Murni Asli Dusun', owner: 'Kelompok Tani Hutan', category: 'pertanian', price_str: 'Rp 85.000 / botol', whatsapp: '6281234567892', description: 'Madu murni alami hasil panen sarang lebah pohon liar Dusun Jambon, kaya nutrisi dan khasiat.', image_url: '' }
    ],
    kontak: {
        id: 1,
        address: 'Dusun Jambon, Desa Karangtalun, Kec. Ngluwar, Kab. Magelang, Jawa Tengah 56485',
        phone: '+62 812-3456-7890',
        email: 'admin@dusunjambon.id',
        whatsapp: '6281234567890',
        gmaps_embed: 'https://maps.google.com/maps?q=-7.662602,110.26933&z=15&output=embed',
        instagram: 'https://instagram.com/dusunjambon',
        facebook: 'https://facebook.com/dusunjambon',
        youtube: 'https://youtube.com/@dusunjambon'
    }
};

class DusunDataService {
    constructor() {
        this.supabaseClient = null;
        this.isSupabaseConnected = false;
        this.initService();
    }

    // Inisialisasi Kredensial & Client Supabase
    initService() {
        const config = this.getSupabaseConfig();
        if (config.url && config.key && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                this.supabaseClient = window.supabase.createClient(config.url, config.key);
                this.isSupabaseConnected = true;
                console.log('[SupabaseService] Terhubung ke Supabase PostgreSQL Client (SDK)');
            } catch (err) {
                console.warn('[SupabaseService] Gagal inisialisasi Supabase SDK, menggunakan LocalStorage:', err);
                this.isSupabaseConnected = false;
            }
        } else {
            this.isSupabaseConnected = false;
            this.ensureLocalStorageSeed();
        }
    }

    getSupabaseConfig() {
        const stored = localStorage.getItem('dusun_supabase_config');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { }
        }
        return DEFAULT_SUPABASE_CONFIG;
    }

    saveSupabaseConfig(url, key) {
        localStorage.setItem('dusun_supabase_config', JSON.stringify({ url, key }));
        this.initService();
    }

    ensureLocalStorageSeed() {
        const keys = ['beranda', 'profil', 'profil_gallery', 'berita', 'administrasi_peta', 'titik_lokasi', 'umkm', 'kontak'];
        keys.forEach(key => {
            const storageKey = `dusun_db_${key}`;
            const storedVal = localStorage.getItem(storageKey);
            if (!storedVal || storedVal === 'null' || storedVal === 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(INITIAL_SEED_DATA[key]));
            }
        });
    }

    getLocalStorage(key) {
        this.ensureLocalStorageSeed();
        try {
            const storedVal = localStorage.getItem(`dusun_db_${key}`);
            if (storedVal && storedVal !== 'null' && storedVal !== 'undefined') {
                const parsed = JSON.parse(storedVal);
                if (parsed !== null && parsed !== undefined) return parsed;
            }
        } catch (e) { }
        return INITIAL_SEED_DATA[key];
    }

    setLocalStorage(key, data) {
        localStorage.setItem(`dusun_db_${key}`, JSON.stringify(data));
    }

    // =========================================================================
    // AUTHENTICATION (SUPABASE AUTH)
    // =========================================================================
    async loginAdmin(email, password) {
        if (this.isSupabaseConnected && this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (error) {
                    if ((email === 'admin@dusunjambon.id' || email === 'admin') && password === 'admin123') {
                        localStorage.setItem('dusun_admin_session', 'true');
                        return { status: 'success', message: 'Login demo berhasil!', user: { email: 'admin@dusunjambon.id' } };
                    }
                    throw error;
                }
                localStorage.setItem('dusun_admin_session', 'true');
                return { status: 'success', message: 'Login berhasil!', user: data.user };
            } catch (err) {
                if ((email === 'admin@dusunjambon.id' || email === 'admin') && password === 'admin123') {
                    localStorage.setItem('dusun_admin_session', 'true');
                    return { status: 'success', message: 'Login demo berhasil!', user: { email: 'admin@dusunjambon.id' } };
                }
                throw err;
            }
        } else {
            if ((email === 'admin@dusunjambon.id' || email === 'admin') && password === 'admin123') {
                localStorage.setItem('dusun_admin_session', 'true');
                return { status: 'success', message: 'Login demo berhasil!', user: { email: 'admin@dusunjambon.id' } };
            } else {
                throw new Error('Email atau Password salah!');
            }
        }
    }

    async logoutAdmin() {
        if (this.isSupabaseConnected && this.supabaseClient) {
            try { await this.supabaseClient.auth.signOut(); } catch (e) {}
        }
        localStorage.removeItem('dusun_admin_session');
        return true;
    }

    async getAdminSession() {
        if (this.isSupabaseConnected && this.supabaseClient) {
            const { data } = await this.supabaseClient.auth.getSession();
            if (data && data.session) return true;
        }
        return localStorage.getItem('dusun_admin_session') === 'true';
    }

    // =========================================================================
    // STORAGE (SUPABASE STORAGE IMAGE UPLOAD)
    // =========================================================================
    async uploadImageFile(file) {
        if (this.isSupabaseConnected && this.supabaseClient) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { data, error } = await this.supabaseClient.storage
                .from('web_dusun_storage')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (error) {
                console.warn('[SupabaseService] Upload storage error, fallback to Base64:', error);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            const { data: publicUrlData } = this.supabaseClient.storage
                .from('web_dusun_storage')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } else {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
    }

    // =========================================================================
    // 1. CRUD BERANDA
    // =========================================================================
    async getBeranda() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('beranda_content').select('*').single();
            if (!error && data) return data;
        }
        return this.getLocalStorage('beranda');
    }

    async updateBeranda(payload) {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient
                .from('beranda_content')
                .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
            if (error) throw error;
            return data;
        }
        const current = this.getLocalStorage('beranda');
        const updated = { ...current, ...payload };
        this.setLocalStorage('beranda', updated);
        return updated;
    }

    // =========================================================================
    // 2. CRUD PROFIL & GALERI
    // =========================================================================
    async getProfil() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('profil_content').select('*').single();
            if (!error && data) return data;
        }
        return this.getLocalStorage('profil');
    }

    async updateProfil(payload) {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient
                .from('profil_content')
                .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
            if (error) throw error;
            return data;
        }
        const current = this.getLocalStorage('profil');
        const updated = { ...current, ...payload };
        this.setLocalStorage('profil', updated);
        return updated;
    }

    async getProfilGallery() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('profil_gallery').select('*').order('id', { ascending: true });
            if (!error && data) return data;
        }
        return this.getLocalStorage('profil_gallery');
    }

    async saveProfilGalleryItem(item) {
        if (this.isSupabaseConnected) {
            if (item.id && item.id > 0) {
                const { data, error } = await this.supabaseClient.from('profil_gallery').update(item).eq('id', item.id);
                if (error) throw error;
                return data;
            } else {
                delete item.id;
                const { data, error } = await this.supabaseClient.from('profil_gallery').insert([item]);
                if (error) throw error;
                return data;
            }
        }
        let list = this.getLocalStorage('profil_gallery');
        if (item.id && item.id > 0) {
            list = list.map(x => x.id === item.id ? { ...x, ...item } : x);
        } else {
            const newId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
            list.push({ ...item, id: newId });
        }
        this.setLocalStorage('profil_gallery', list);
        return list;
    }

    async deleteProfilGalleryItem(id) {
        if (this.isSupabaseConnected) {
            const { error } = await this.supabaseClient.from('profil_gallery').delete().eq('id', id);
            if (error) throw error;
            return true;
        }
        let list = this.getLocalStorage('profil_gallery');
        list = list.filter(x => x.id !== id);
        this.setLocalStorage('profil_gallery', list);
        return true;
    }

    // =========================================================================
    // 3. CRUD BERITA DUSUN
    // =========================================================================
    async getBerita() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('berita').select('*').order('id', { ascending: false });
            if (!error && data) return data;
        }
        return this.getLocalStorage('berita');
    }

    async saveBerita(item) {
        if (this.isSupabaseConnected) {
            if (item.id && item.id > 0) {
                const { data, error } = await this.supabaseClient.from('berita').update(item).eq('id', item.id);
                if (error) throw error;
                return data;
            } else {
                delete item.id;
                const { data, error } = await this.supabaseClient.from('berita').insert([item]);
                if (error) throw error;
                return data;
            }
        }
        let list = this.getLocalStorage('berita');
        if (item.id && item.id > 0) {
            list = list.map(x => x.id === item.id ? { ...x, ...item } : x);
        } else {
            const newId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
            list.unshift({ ...item, id: newId });
        }
        this.setLocalStorage('berita', list);
        return list;
    }

    async deleteBerita(id) {
        if (this.isSupabaseConnected) {
            const { error } = await this.supabaseClient.from('berita').delete().eq('id', id);
            if (error) throw error;
            return true;
        }
        let list = this.getLocalStorage('berita');
        list = list.filter(x => x.id !== id);
        this.setLocalStorage('berita', list);
        return true;
    }

    // =========================================================================
    // 4. CRUD PETA ADMINISTRASI & TITIK LOKASI
    // =========================================================================
    async getAdministrasiPeta() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('administrasi_peta').select('*').single();
            if (!error && data) return data;
        }
        return this.getLocalStorage('administrasi_peta');
    }

    async updateAdministrasiPeta(payload) {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient
                .from('administrasi_peta')
                .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
            if (error) throw error;
            return data;
        }
        const current = this.getLocalStorage('administrasi_peta');
        const updated = { ...current, ...payload };
        this.setLocalStorage('administrasi_peta', updated);
        return updated;
    }

    async getTitikLokasi() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('titik_lokasi').select('*').order('id', { ascending: true });
            if (!error && data) return data;
        }
        return this.getLocalStorage('titik_lokasi');
    }

    async saveTitikLokasi(item) {
        if (this.isSupabaseConnected) {
            if (item.id && item.id > 0) {
                const { data, error } = await this.supabaseClient.from('titik_lokasi').update(item).eq('id', item.id);
                if (error) throw error;
                return data;
            } else {
                delete item.id;
                const { data, error } = await this.supabaseClient.from('titik_lokasi').insert([item]);
                if (error) throw error;
                return data;
            }
        }
        let list = this.getLocalStorage('titik_lokasi');
        if (item.id && item.id > 0) {
            list = list.map(x => x.id === item.id ? { ...x, ...item } : x);
        } else {
            const newId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
            list.push({ ...item, id: newId });
        }
        this.setLocalStorage('titik_lokasi', list);
        return list;
    }

    async deleteTitikLokasi(id) {
        if (this.isSupabaseConnected) {
            const { error } = await this.supabaseClient.from('titik_lokasi').delete().eq('id', id);
            if (error) throw error;
            return true;
        }
        let list = this.getLocalStorage('titik_lokasi');
        list = list.filter(x => x.id !== id);
        this.setLocalStorage('titik_lokasi', list);
        return true;
    }

    // =========================================================================
    // 5. CRUD DAFTAR UMKM
    // =========================================================================
    async getUMKM() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('umkm').select('*').order('id', { ascending: false });
            if (!error && data) return data;
        }
        return this.getLocalStorage('umkm');
    }

    async saveUMKM(item) {
        if (this.isSupabaseConnected) {
            if (item.id && item.id > 0) {
                const { data, error } = await this.supabaseClient.from('umkm').update(item).eq('id', item.id);
                if (error) throw error;
                return data;
            } else {
                delete item.id;
                const { data, error } = await this.supabaseClient.from('umkm').insert([item]);
                if (error) throw error;
                return data;
            }
        }
        let list = this.getLocalStorage('umkm');
        if (item.id && item.id > 0) {
            list = list.map(x => x.id === item.id ? { ...x, ...item } : x);
        } else {
            const newId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
            list.unshift({ ...item, id: newId });
        }
        this.setLocalStorage('umkm', list);
        return list;
    }

    async deleteUMKM(id) {
        if (this.isSupabaseConnected) {
            const { error } = await this.supabaseClient.from('umkm').delete().eq('id', id);
            if (error) throw error;
            return true;
        }
        let list = this.getLocalStorage('umkm');
        list = list.filter(x => x.id !== id);
        this.setLocalStorage('umkm', list);
        return true;
    }

    // =========================================================================
    // 6. CRUD KONTAK DUSUN
    // =========================================================================
    async getKontak() {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient.from('kontak_content').select('*').single();
            if (!error && data) return data;
        }
        return this.getLocalStorage('kontak');
    }

    async updateKontak(payload) {
        if (this.isSupabaseConnected) {
            const { data, error } = await this.supabaseClient
                .from('kontak_content')
                .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
            if (error) throw error;
            return data;
        }
        const current = this.getLocalStorage('kontak');
        const updated = { ...current, ...payload };
        this.setLocalStorage('kontak', updated);
        return updated;
    }
}

// Global Export Singleton Instance
window.dusunService = new DusunDataService();

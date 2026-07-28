/**
 * ============================================================================
 * SUPABASE & POSTGRESQL DATA SERVICE - PORTAL DUSUN JAMBON
 * ============================================================================
 * Modul ini menangani seluruh koneksi ke Supabase PostgreSQL database,
 * Supabase Auth, dan Supabase Storage secara 100% Client-Side via Supabase JS SDK.
 * TIDAK MENGGUNAKAN LocalStorage SEBAGAI DATABASE UTAMA.
 * ============================================================================
 */

const DEFAULT_SUPABASE_CONFIG = {
    url: 'https://ydmmynesclhlqcijjwfu.supabase.co',
    key: 'sb_publishable_KQlwLZ8ulUlHcogrVk6okw_Sl1-ibBS'
};

class DusunDataService {
    constructor() {
        this.supabaseClient = null;
        this.isSupabaseConnected = false;
        this.initService();
    }

    // Inisialisasi Supabase Client SDK
    initService() {
        const url = DEFAULT_SUPABASE_CONFIG.url;
        const key = DEFAULT_SUPABASE_CONFIG.key;

        if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                this.supabaseClient = window.supabase.createClient(url, key);
                this.isSupabaseConnected = true;
                console.log('[SupabaseService] 100% Connected to Supabase PostgreSQL Client (SDK)');
            } catch (err) {
                console.error('[SupabaseService] Error initializing Supabase SDK:', err);
                this.isSupabaseConnected = false;
            }
        } else {
            console.error('[SupabaseService] Supabase SDK script not found or invalid credentials.');
            this.isSupabaseConnected = false;
        }
    }

    // =========================================================================
    // AUTHENTICATION (SUPABASE AUTH & DEMO FALLBACK)
    // =========================================================================
    async loginAdmin(email, password) {
        if (this.isSupabaseConnected && this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (!error && data && data.user) {
                    return { status: 'success', message: 'Login Supabase berhasil!', user: data.user, session: data.session };
                }
            } catch (err) {
                console.warn('[Supabase Auth] Remote auth attempt failed, checking demo fallback:', err);
            }
        }

        // Demo Admin Credentials Fallback (admin@dusunjambon.id / admin123)
        if ((email === 'admin@dusunjambon.id' || email === 'admin') && password === 'admin123') {
            const demoSession = { user: { email: 'admin@dusunjambon.id', role: 'admin' }, token: 'demo_session_active' };
            localStorage.setItem('dusun_admin_session', JSON.stringify(demoSession));
            return { status: 'success', message: 'Login Demo Admin Berhasil!', user: demoSession.user, session: demoSession };
        }

        throw new Error('Email atau Password salah. (Gunakan Demo: admin@dusunjambon.id / admin123)');
    }

    async logoutAdmin() {
        if (this.isSupabaseConnected && this.supabaseClient) {
            try { await this.supabaseClient.auth.signOut(); } catch (e) { }
        }
        localStorage.removeItem('dusun_admin_session');
        return true;
    }

    async getAdminSession() {
        if (this.isSupabaseConnected && this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.auth.getSession();
                if (!error && data && data.session) {
                    return data.session;
                }
            } catch (e) { }
        }
        const localSession = localStorage.getItem('dusun_admin_session');
        if (localSession) {
            try { return JSON.parse(localSession); } catch (e) { }
        }
        return null;
    }

    // =========================================================================
    // STORAGE (SUPABASE STORAGE IMAGE UPLOAD)
    // =========================================================================
    async uploadImageFile(file) {
        if (!this.isSupabaseConnected || !this.supabaseClient) {
            throw new Error('Supabase Storage tidak terhubung.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data, error } = await this.supabaseClient.storage
            .from('web_dusun_storage')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) {
            throw new Error('Gagal unggah ke Supabase Storage: ' + error.message);
        }

        const { data: publicUrlData } = this.supabaseClient.storage
            .from('web_dusun_storage')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }

    // =========================================================================
    // 1. CRUD BERANDA (beranda_content)
    // =========================================================================
    async getBeranda() {
        if (!this.isSupabaseConnected) return null;
        const { data, error } = await this.supabaseClient.from('beranda_content').select('*').single();
        if (error) {
            console.error('Error fetching beranda_content:', error);
            return null;
        }
        return data;
    }

    async updateBeranda(payload) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { data, error } = await this.supabaseClient
            .from('beranda_content')
            .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
        if (error) throw error;
        return data;
    }

    // =========================================================================
    // 2. CRUD PROFIL & GALERI (profil_content, profil_gallery)
    // =========================================================================
    async getProfil() {
        if (!this.isSupabaseConnected) return null;
        const { data, error } = await this.supabaseClient.from('profil_content').select('*').single();
        if (error) {
            console.error('Error fetching profil_content:', error);
            return null;
        }
        return data;
    }

    async updateProfil(payload) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { data, error } = await this.supabaseClient
            .from('profil_content')
            .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
        if (error) throw error;
        return data;
    }

    async getProfilGallery() {
        if (!this.isSupabaseConnected) return [];
        const { data, error } = await this.supabaseClient.from('profil_gallery').select('*').order('id', { ascending: true });
        if (error) {
            console.error('Error fetching profil_gallery:', error);
            return [];
        }
        return data || [];
    }

    async saveProfilGalleryItem(item) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
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

    async deleteProfilGalleryItem(id) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { error } = await this.supabaseClient.from('profil_gallery').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    // =========================================================================
    // 3. CRUD BERITA DUSUN (berita)
    // =========================================================================
    async getBerita() {
        if (!this.isSupabaseConnected) return [];
        const { data, error } = await this.supabaseClient.from('berita').select('*').order('id', { ascending: false });
        if (error) {
            console.error('Error fetching berita:', error);
            return [];
        }
        return data || [];
    }

    async saveBerita(item) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
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

    async deleteBerita(id) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { error } = await this.supabaseClient.from('berita').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    // =========================================================================
    // 4. CRUD PETA ADMINISTRASI & TITIK LOKASI (administrasi_peta, titik_lokasi)
    // =========================================================================
    async getAdministrasiPeta() {
        if (!this.isSupabaseConnected) return null;
        const { data, error } = await this.supabaseClient.from('administrasi_peta').select('*').single();
        if (error) {
            console.error('Error fetching administrasi_peta:', error);
            return null;
        }
        return data;
    }

    async updateAdministrasiPeta(payload) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { data, error } = await this.supabaseClient
            .from('administrasi_peta')
            .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
        if (error) throw error;
        return data;
    }

    async getTitikLokasi() {
        if (!this.isSupabaseConnected) return [];
        const { data, error } = await this.supabaseClient.from('titik_lokasi').select('*').order('id', { ascending: true });
        if (error) {
            console.error('Error fetching titik_lokasi:', error);
            return [];
        }
        return data || [];
    }

    async saveTitikLokasi(item) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
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

    async deleteTitikLokasi(id) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { error } = await this.supabaseClient.from('titik_lokasi').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    // =========================================================================
    // 5. CRUD DAFTAR UMKM (umkm)
    // =========================================================================
    async getUMKM() {
        if (!this.isSupabaseConnected) return [];
        const { data, error } = await this.supabaseClient.from('umkm').select('*').order('id', { ascending: false });
        if (error) {
            console.error('Error fetching umkm:', error);
            return [];
        }
        return data || [];
    }

    async saveUMKM(item) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
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

    async deleteUMKM(id) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { error } = await this.supabaseClient.from('umkm').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    // =========================================================================
    // 6. CRUD KONTAK DUSUN (kontak_content)
    // =========================================================================
    async getKontak() {
        if (!this.isSupabaseConnected) return null;
        const { data, error } = await this.supabaseClient.from('kontak_content').select('*').single();
        if (error) {
            console.error('Error fetching kontak_content:', error);
            return null;
        }
        return data;
    }

    async updateKontak(payload) {
        if (!this.isSupabaseConnected) throw new Error('Supabase Client disconnected');
        const { data, error } = await this.supabaseClient
            .from('kontak_content')
            .upsert([{ id: 1, ...payload, updated_at: new Date().toISOString() }]);
        if (error) throw error;
        return data;
    }
}

// Global Export Singleton Instance
window.dusunService = new DusunDataService();

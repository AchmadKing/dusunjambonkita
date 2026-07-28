/**
 * ============================================================================
 * ADMIN DASHBOARD SCRIPT - PORTAL DUSUN JAMBON
 * ============================================================================
 * Menangani autentikasi login admin, switching tab panel, manajemen form CRUD,
 * upload file gambar (Base64 / Data URL), render tabel data, dan Supabase sync.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const adminDashboardSection = document.getElementById('adminDashboardSection');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const btnLogout = document.getElementById('btnLogout');
    const dbStatusBadge = document.getElementById('dbStatusBadge');

    // ----------------------------------------------------------------------
    // 1. Image Upload Helper (Base64 Reader + Live Preview)
    // ----------------------------------------------------------------------
    function bindImageUpload(fileInputId, textInputId, previewImgId) {
        setTimeout(() => {
            const fileInput = document.getElementById(fileInputId);
            const textInput = document.getElementById(textInputId);
            const previewImg = document.getElementById(previewImgId);

            if (textInput && previewImg && textInput.value) {
                previewImg.src = textInput.value;
                previewImg.style.display = 'block';
            }

            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            const dataUrl = evt.target.result;
                            if (textInput) textInput.value = dataUrl;
                            if (previewImg) {
                                previewImg.src = dataUrl;
                                previewImg.style.display = 'block';
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            if (textInput && previewImg) {
                textInput.addEventListener('input', () => {
                    if (textInput.value) {
                        previewImg.src = textInput.value;
                        previewImg.style.display = 'block';
                    } else {
                        previewImg.style.display = 'none';
                    }
                });
            }
        }, 50);
    }

    // ----------------------------------------------------------------------
    // 2. Authentication Session Check & Login Handler
    // ----------------------------------------------------------------------
    function checkSession() {
        const loggedIn = localStorage.getItem('dusun_admin_session');
        if (loggedIn === 'true') {
            loginSection.style.display = 'none';
            adminDashboardSection.style.display = 'flex';
            updateDbBadge();
            loadAllTabData();
        } else {
            loginSection.style.display = 'flex';
            adminDashboardSection.style.display = 'none';
        }
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if ((username === 'admin@dusunjambon.id' || username === 'admin') && password === 'admin123') {
                localStorage.setItem('dusun_admin_session', 'true');
                showAdminToast('Login berhasil! Selamat datang Admin Dusun Jambon.');
                checkSession();
            } else {
                alert('Email atau Password salah! Gunakan admin@dusunjambon.id / admin123');
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin keluar dari Panel Admin?')) {
                localStorage.removeItem('dusun_admin_session');
                checkSession();
            }
        });
    }

    function updateDbBadge() {
        if (!dbStatusBadge) return;
        if (window.dusunService && window.dusunService.isSupabaseConnected) {
            dbStatusBadge.className = 'db-status-badge supabase';
            dbStatusBadge.innerHTML = `<i class="fa-solid fa-cloud"></i> Engine: PostgreSQL Supabase (Connected)`;
        } else {
            dbStatusBadge.className = 'db-status-badge local';
            dbStatusBadge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Engine: LocalStorage Fallback`;
        }
    }

    // ----------------------------------------------------------------------
    // 3. Tab Panel Navigation System
    // ----------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    const currentTabTitle = document.getElementById('currentTabTitle');

    const tabTitles = {
        'tab-beranda': 'Pengelolaan Halaman Beranda',
        'tab-profil': 'Pengelolaan Halaman Profil & Sejarah',
        'tab-berita': 'Pengelolaan Data Berita & Pengumuman',
        'tab-peta': 'Pengelolaan Peta Administrasi & Titik Lokasi Google Maps',
        'tab-umkm': 'Pengelolaan Katalog UMKM Warga',
        'tab-supabase': 'Pengaturan Database Supabase (PostgreSQL)'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');
            if (!targetTab) return;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            if (currentTabTitle && tabTitles[targetTab]) {
                currentTabTitle.textContent = tabTitles[targetTab];
            }
        });
    });

    // ----------------------------------------------------------------------
    // 4. Modal Admin Helper Functions
    // ----------------------------------------------------------------------
    const adminModalBackdrop = document.getElementById('adminModalBackdrop');
    const adminModalTitle = document.getElementById('adminModalTitle');
    const adminModalBody = document.getElementById('adminModalBody');

    window.openAdminModal = function (title, contentHTML) {
        if (adminModalTitle) adminModalTitle.textContent = title;
        if (adminModalBody) adminModalBody.innerHTML = contentHTML;
        if (adminModalBackdrop) adminModalBackdrop.classList.add('active');
    };

    window.closeAdminModal = function () {
        if (adminModalBackdrop) adminModalBackdrop.classList.remove('active');
    };

    if (adminModalBackdrop) {
        adminModalBackdrop.addEventListener('click', (e) => {
            if (e.target === adminModalBackdrop) closeAdminModal();
        });
    }

    // ----------------------------------------------------------------------
    // 5. Data Loaders for All Tabs
    // ----------------------------------------------------------------------
    async function loadAllTabData() {
        await loadBerandaTab();
        await loadProfilTab();
        await loadBeritaTab();
        await loadPetaTab();
        await loadUmkmTab();
        loadSupabaseTab();
    }

    // A. TAB BERANDA
    async function loadBerandaTab() {
        try {
            const data = await window.dusunService.getBeranda();
            if (data) {
                if (document.getElementById('berandaHeadline')) document.getElementById('berandaHeadline').value = data.hero_headline || '';
                if (document.getElementById('berandaHeadlineSpan')) document.getElementById('berandaHeadlineSpan').value = data.hero_headline_span || '';
                if (document.getElementById('berandaHeadlineRed')) document.getElementById('berandaHeadlineRed').value = data.hero_headline_red || '';
                if (document.getElementById('berandaDesc')) document.getElementById('berandaDesc').value = data.hero_desc || '';
                if (document.getElementById('berandaHeroImg')) document.getElementById('berandaHeroImg').value = data.hero_image_url || '';
                if (document.getElementById('berandaHeroCap')) document.getElementById('berandaHeroCap').value = data.hero_image_caption || '';
                if (document.getElementById('berandaKdTitle')) document.getElementById('berandaKdTitle').value = data.kepala_dusun_title || '';
                if (document.getElementById('berandaKdSpeech1')) document.getElementById('berandaKdSpeech1').value = data.kepala_dusun_speech_1 || '';
                if (document.getElementById('berandaKdSpeech2')) document.getElementById('berandaKdSpeech2').value = data.kepala_dusun_speech_2 || '';
                if (document.getElementById('berandaKdName')) document.getElementById('berandaKdName').value = data.kepala_dusun_name || '';
                if (document.getElementById('berandaKdImg')) document.getElementById('berandaKdImg').value = data.kepala_dusun_image_url || '';

                bindImageUpload('berandaHeroImgFile', 'berandaHeroImg', 'berandaHeroImgPreview');
                bindImageUpload('berandaKdImgFile', 'berandaKdImg', 'berandaKdImgPreview');
            }
        } catch (err) {
            console.error('Error loading Beranda tab:', err);
        }
    }

    const formBeranda = document.getElementById('formBeranda');
    if (formBeranda) {
        formBeranda.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                hero_headline: document.getElementById('berandaHeadline').value,
                hero_headline_span: document.getElementById('berandaHeadlineSpan').value,
                hero_headline_red: document.getElementById('berandaHeadlineRed').value,
                hero_desc: document.getElementById('berandaDesc').value,
                hero_image_url: document.getElementById('berandaHeroImg').value,
                hero_image_caption: document.getElementById('berandaHeroCap').value,
                kepala_dusun_title: document.getElementById('berandaKdTitle').value,
                kepala_dusun_speech_1: document.getElementById('berandaKdSpeech1').value,
                kepala_dusun_speech_2: document.getElementById('berandaKdSpeech2').value,
                kepala_dusun_name: document.getElementById('berandaKdName').value,
                kepala_dusun_image_url: document.getElementById('berandaKdImg') ? document.getElementById('berandaKdImg').value : ''
            };

            try {
                await window.dusunService.updateBeranda(payload);
                showAdminToast('Beranda berhasil diperbarui!');
            } catch (err) {
                alert('Gagal menyimpan beranda: ' + err.message);
            }
        });
    }

    // B. TAB PROFIL & GALERI
    async function loadProfilTab() {
        try {
            const profil = await window.dusunService.getProfil();
            if (profil) {
                if (document.getElementById('profilSejarah1')) document.getElementById('profilSejarah1').value = profil.sejarah_p1 || '';
                if (document.getElementById('profilSejarah2')) document.getElementById('profilSejarah2').value = profil.sejarah_p2 || '';
                if (document.getElementById('profilVisi')) document.getElementById('profilVisi').value = profil.visi_text || '';
                if (document.getElementById('profilMisi')) document.getElementById('profilMisi').value = Array.isArray(profil.misi_list) ? profil.misi_list.join('\n') : '';
            }

            const gallery = await window.dusunService.getProfilGallery();
            const tbody = document.getElementById('profilGalleryTableBody');
            if (tbody) {
                tbody.innerHTML = (gallery || []).map(item => `
                    <tr>
                        <td><img src="${item.image_url}" class="table-img-thumb" onerror="this.src='assets/kegiatan1.jpg'"></td>
                        <td><strong>${item.title}</strong><br><small style="color: var(--admin-text-muted);">${item.subtitle || ''}</small></td>
                        <td><span class="db-status-badge local">${item.tag}</span></td>
                        <td><strong>${item.type}</strong></td>
                        <td>
                            <button class="btn-action-edit" onclick="editGalleryItem(${item.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="btn-action-delete" onclick="deleteGalleryItem(${item.id})"><i class="fa-solid fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading Profil tab:', err);
        }
    }

    const formProfil = document.getElementById('formProfil');
    if (formProfil) {
        formProfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const misiArr = document.getElementById('profilMisi').value.split('\n').filter(x => x.trim().length > 0);
            const payload = {
                sejarah_p1: document.getElementById('profilSejarah1').value,
                sejarah_p2: document.getElementById('profilSejarah2').value,
                visi_text: document.getElementById('profilVisi').value,
                misi_list: misiArr
            };

            try {
                await window.dusunService.updateProfil(payload);
                showAdminToast('Data Profil & Visi Misi berhasil diperbarui!');
            } catch (err) {
                alert('Gagal menyimpan profil: ' + err.message);
            }
        });
    }

    window.openAddGalleryModal = function () {
        const html = `
            <form id="formModalGallery" onsubmit="saveGalleryModal(event)">
                <input type="hidden" id="galId" value="">
                <div class="admin-form-group">
                    <label>Judul / Caption Foto</label>
                    <input type="text" id="galTitle" class="admin-form-control" required>
                </div>
                <div class="admin-form-group">
                    <label>Sub-judul / Deskripsi Singkat</label>
                    <input type="text" id="galSubtitle" class="admin-form-control">
                </div>
                <div class="admin-form-group">
                    <label>Tag / Label Kategori</label>
                    <input type="text" id="galTag" class="admin-form-control" placeholder="Kegiatan 1" required>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload / Pilih Gambar Foto Galeri</label>
                    <input type="file" id="galImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="galImgUrl" class="admin-form-control" placeholder="assets/kegiatan1.jpg atau Upload File" required>
                    <div style="margin-top: 10px;">
                        <img id="galImgPreview" src="" style="max-height: 100px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Tipe Tampilan</label>
                    <select id="galType" class="admin-form-control">
                        <option value="slideshow">Slideshow Sejarah</option>
                        <option value="gallery">Galeri Dokumentasi</option>
                    </select>
                </div>
                <button type="submit" class="btn-admin-submit" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan Foto
                </button>
            </form>
        `;
        openAdminModal('Tambah Foto Galeri / Slideshow Baru', html);
        bindImageUpload('galImgFile', 'galImgUrl', 'galImgPreview');
    };

    window.editGalleryItem = async function (id) {
        const list = await window.dusunService.getProfilGallery();
        const item = list.find(x => x.id === id);
        if (!item) return;

        openAddGalleryModal();
        document.getElementById('galId').value = item.id;
        document.getElementById('galTitle').value = item.title;
        document.getElementById('galSubtitle').value = item.subtitle || '';
        document.getElementById('galTag').value = item.tag;
        document.getElementById('galImgUrl').value = item.image_url;
        document.getElementById('galType').value = item.type;
        document.getElementById('adminModalTitle').textContent = 'Edit Foto Galeri / Slideshow';
        bindImageUpload('galImgFile', 'galImgUrl', 'galImgPreview');
    };

    window.saveGalleryModal = async function (e) {
        e.preventDefault();
        const id = document.getElementById('galId').value;
        const item = {
            title: document.getElementById('galTitle').value,
            subtitle: document.getElementById('galSubtitle').value,
            tag: document.getElementById('galTag').value,
            image_url: document.getElementById('galImgUrl').value,
            type: document.getElementById('galType').value
        };
        if (id) item.id = parseInt(id, 10);

        try {
            await window.dusunService.saveProfilGalleryItem(item);
            closeAdminModal();
            loadProfilTab();
            showAdminToast('Foto galeri berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan item: ' + err.message);
        }
    };

    window.deleteGalleryItem = async function (id) {
        if (confirm('Hapus foto ini dari galeri profil?')) {
            await window.dusunService.deleteProfilGalleryItem(id);
            loadProfilTab();
            showAdminToast('Foto berhasil dihapus.');
        }
    };

    // C. TAB BERITA DUSUN
    async function loadBeritaTab() {
        try {
            const list = await window.dusunService.getBerita();
            const tbody = document.getElementById('beritaTableBody');
            if (tbody) {
                tbody.innerHTML = (list || []).map(b => `
                    <tr>
                        <td><strong>${b.title}</strong></td>
                        <td><span class="db-status-badge supabase">${b.category}</span></td>
                        <td>${b.date_str}</td>
                        <td>${b.author || 'Admin'}</td>
                        <td><small style="color: var(--admin-text-muted);">${(b.excerpt || '').substring(0, 50)}...</small></td>
                        <td>
                            <button class="btn-action-edit" onclick="editBerita(${b.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="btn-action-delete" onclick="deleteBerita(${b.id})"><i class="fa-solid fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading Berita tab:', err);
        }
    }

    window.openAddBeritaModal = function () {
        const html = `
            <form id="formModalBerita" onsubmit="saveBeritaModal(event)">
                <input type="hidden" id="beritaId" value="">
                <div class="admin-form-group">
                    <label>Judul Berita / Pengumuman</label>
                    <input type="text" id="beritaTitleInput" class="admin-form-control" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Kategori</label>
                        <select id="beritaCategory" class="admin-form-control">
                            <option value="kegiatan">Kegiatan Warga</option>
                            <option value="pembangunan">Pembangunan</option>
                            <option value="pengumuman">Pengumuman</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label>Tanggal Rilis</label>
                        <input type="text" id="beritaDate" class="admin-form-control" placeholder="27 Juli 2026" required>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Penulis / Pengirim</label>
                    <input type="text" id="beritaAuthor" class="admin-form-control" placeholder="Sekretaris Dusun" required>
                </div>
                <div class="admin-form-group">
                    <label>Ringkasan Singkat (Excerpt)</label>
                    <textarea id="beritaExcerpt" class="admin-form-control" rows="2" required></textarea>
                </div>
                <div class="admin-form-group">
                    <label>Isi Lengkap Berita</label>
                    <textarea id="beritaContent" class="admin-form-control" rows="5" required></textarea>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload / Pilih Gambar Berita (Opsional)</label>
                    <input type="file" id="beritaImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="beritaImg" class="admin-form-control" placeholder="assets/kegiatan1.jpg atau Upload File">
                    <div style="margin-top: 10px;">
                        <img id="beritaImgPreview" src="" style="max-height: 100px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <button type="submit" class="btn-admin-submit" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan Berita
                </button>
            </form>
        `;
        openAdminModal('Tambah Berita / Pengumuman Baru', html);
        bindImageUpload('beritaImgFile', 'beritaImg', 'beritaImgPreview');
    };

    window.editBerita = async function (id) {
        const list = await window.dusunService.getBerita();
        const b = list.find(x => x.id === id);
        if (!b) return;

        openAddBeritaModal();
        document.getElementById('beritaId').value = b.id;
        document.getElementById('beritaTitleInput').value = b.title;
        document.getElementById('beritaCategory').value = b.category;
        document.getElementById('beritaDate').value = b.date_str;
        document.getElementById('beritaAuthor').value = b.author || '';
        document.getElementById('beritaExcerpt').value = b.excerpt;
        document.getElementById('beritaContent').value = b.content;
        document.getElementById('beritaImg').value = b.image_url || '';
        document.getElementById('adminModalTitle').textContent = 'Edit Data Berita';
        bindImageUpload('beritaImgFile', 'beritaImg', 'beritaImgPreview');
    };

    window.saveBeritaModal = async function (e) {
        e.preventDefault();
        const id = document.getElementById('beritaId').value;
        const item = {
            title: document.getElementById('beritaTitleInput').value,
            category: document.getElementById('beritaCategory').value,
            date_str: document.getElementById('beritaDate').value,
            author: document.getElementById('beritaAuthor').value,
            excerpt: document.getElementById('beritaExcerpt').value,
            content: document.getElementById('beritaContent').value,
            image_url: document.getElementById('beritaImg').value
        };
        if (id) item.id = parseInt(id, 10);

        try {
            await window.dusunService.saveBerita(item);
            closeAdminModal();
            loadBeritaTab();
            showAdminToast('Berita berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan berita: ' + err.message);
        }
    };

    window.deleteBerita = async function (id) {
        if (confirm('Hapus artikel berita ini?')) {
            await window.dusunService.deleteBerita(id);
            loadBeritaTab();
            showAdminToast('Berita berhasil dihapus.');
        }
    };

    // D. TAB PETA & TITIK LOKASI
    async function loadPetaTab() {
        try {
            const peta = await window.dusunService.getAdministrasiPeta();
            if (peta) {
                if (document.getElementById('petaTitle')) document.getElementById('petaTitle').value = peta.map_title || '';
                if (document.getElementById('petaDesc')) document.getElementById('petaDesc').value = peta.map_desc || '';
                if (document.getElementById('petaImgUrl')) document.getElementById('petaImgUrl').value = peta.map_image_url || '';

                bindImageUpload('petaImgFile', 'petaImgUrl', 'petaImgPreview');
            }

            const list = await window.dusunService.getTitikLokasi();
            const tbody = document.getElementById('lokasiTableBody');
            if (tbody) {
                tbody.innerHTML = (list || []).map(l => `
                    <tr>
                        <td><img src="${l.image_url}" class="table-img-thumb" onerror="this.src='assets/Masjid_Al-Falah.jpg'"></td>
                        <td><strong>${l.title}</strong><br><small style="color: var(--admin-text-muted);">${(l.description || '').substring(0, 40)}...</small></td>
                        <td><span class="db-status-badge ${l.badge_color === 'red' ? 'supabase' : 'local'}">${l.badge_label || l.category}</span></td>
                        <td><code>${l.coordinates}</code></td>
                        <td><a href="${l.gmaps_url}" target="_blank" style="color: var(--admin-accent-blue);"><i class="fa-solid fa-up-right-from-square"></i> Buka Maps</a></td>
                        <td>
                            <button class="btn-action-edit" onclick="editLokasi(${l.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="btn-action-delete" onclick="deleteLokasi(${l.id})"><i class="fa-solid fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading Peta tab:', err);
        }
    }

    const formPeta = document.getElementById('formPeta');
    if (formPeta) {
        formPeta.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                map_title: document.getElementById('petaTitle').value,
                map_desc: document.getElementById('petaDesc').value,
                map_image_url: document.getElementById('petaImgUrl').value
            };

            try {
                await window.dusunService.updateAdministrasiPeta(payload);
                showAdminToast('Peta Administrasi berhasil diperbarui!');
            } catch (err) {
                alert('Gagal menyimpan peta: ' + err.message);
            }
        });
    }

    window.openAddLokasiModal = function () {
        const html = `
            <form id="formModalLokasi" onsubmit="saveLokasiModal(event)">
                <input type="hidden" id="lokasiId" value="">
                <div class="admin-form-group">
                    <label>Nama Tempat / Titik Lokasi</label>
                    <input type="text" id="lokasiTitle" class="admin-form-control" placeholder="Masjid Al-Falah" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Kategori</label>
                        <select id="lokasiCategory" class="admin-form-control">
                            <option value="ibadah">Tempat Ibadah</option>
                            <option value="rt">Kediaman Ketua RT</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label>Warna Badge Label</label>
                        <select id="lokasiBadgeColor" class="admin-form-control">
                            <option value="red">Merah (Ibadah/Penting)</option>
                            <option value="blue">Biru (RT/Pelayanan)</option>
                        </select>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Teks Label Badge</label>
                    <input type="text" id="lokasiBadgeLabel" class="admin-form-control" placeholder="Pengurus RT 01" required>
                </div>
                <div class="admin-form-group">
                    <label>Deskripsi Singkat Lokasi</label>
                    <textarea id="lokasiDesc" class="admin-form-control" rows="2" required></textarea>
                </div>
                <div class="admin-form-group">
                    <label>Koordinat (Latitude, Longitude)</label>
                    <input type="text" id="lokasiCoords" class="admin-form-control" placeholder="-7.662602, 110.26933" required>
                </div>
                <div class="admin-form-group">
                    <label>Link Google Maps Direct URL</label>
                    <input type="url" id="lokasiGmaps" class="admin-form-control" placeholder="https://www.google.com/maps?q=-7.662602,110.26933" required>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload / Pilih Foto Lokasi / Rumah RT</label>
                    <input type="file" id="lokasiImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="lokasiImg" class="admin-form-control" placeholder="assets/Masjid_Al-Falah.jpg atau Upload File" required>
                    <div style="margin-top: 10px;">
                        <img id="lokasiImgPreview" src="" style="max-height: 100px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <button type="submit" class="btn-admin-submit" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan Titik Lokasi
                </button>
            </form>
        `;
        openAdminModal('Tambah Titik Lokasi Penting & Koordinat', html);
        bindImageUpload('lokasiImgFile', 'lokasiImg', 'lokasiImgPreview');
    };

    window.editLokasi = async function (id) {
        const list = await window.dusunService.getTitikLokasi();
        const l = list.find(x => x.id === id);
        if (!l) return;

        openAddLokasiModal();
        document.getElementById('lokasiId').value = l.id;
        document.getElementById('lokasiTitle').value = l.title;
        document.getElementById('lokasiCategory').value = l.category;
        document.getElementById('lokasiBadgeColor').value = l.badge_color || 'blue';
        document.getElementById('lokasiBadgeLabel').value = l.badge_label;
        document.getElementById('lokasiDesc').value = l.description;
        document.getElementById('lokasiCoords').value = l.coordinates;
        document.getElementById('lokasiGmaps').value = l.gmaps_url;
        document.getElementById('lokasiImg').value = l.image_url;
        document.getElementById('adminModalTitle').textContent = 'Edit Titik Lokasi & Koordinat';
        bindImageUpload('lokasiImgFile', 'lokasiImg', 'lokasiImgPreview');
    };

    window.saveLokasiModal = async function (e) {
        e.preventDefault();
        const id = document.getElementById('lokasiId').value;
        const item = {
            title: document.getElementById('lokasiTitle').value,
            category: document.getElementById('lokasiCategory').value,
            badge_color: document.getElementById('lokasiBadgeColor').value,
            badge_label: document.getElementById('lokasiBadgeLabel').value,
            description: document.getElementById('lokasiDesc').value,
            coordinates: document.getElementById('lokasiCoords').value,
            gmaps_url: document.getElementById('lokasiGmaps').value,
            image_url: document.getElementById('lokasiImg').value
        };
        if (id) item.id = parseInt(id, 10);

        try {
            await window.dusunService.saveTitikLokasi(item);
            closeAdminModal();
            loadPetaTab();
            showAdminToast('Titik lokasi berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan lokasi: ' + err.message);
        }
    };

    window.deleteLokasi = async function (id) {
        if (confirm('Hapus titik lokasi koordinat ini?')) {
            await window.dusunService.deleteTitikLokasi(id);
            loadPetaTab();
            showAdminToast('Titik lokasi dihapus.');
        }
    };

    // E. TAB UMKM
    async function loadUmkmTab() {
        try {
            const list = await window.dusunService.getUMKM();
            const tbody = document.getElementById('umkmTableBody');
            if (tbody) {
                tbody.innerHTML = (list || []).map(u => `
                    <tr>
                        <td><img src="${u.image_url || 'assets/kegiatan1.jpg'}" class="table-img-thumb" onerror="this.src='assets/kegiatan1.jpg'"></td>
                        <td><strong>${u.title}</strong></td>
                        <td>${u.owner}</td>
                        <td><span class="db-status-badge supabase">${u.category}</span></td>
                        <td>${u.price_str}</td>
                        <td><code>+${u.whatsapp}</code></td>
                        <td>
                            <button class="btn-action-edit" onclick="editUmkm(${u.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="btn-action-delete" onclick="deleteUmkm(${u.id})"><i class="fa-solid fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading UMKM tab:', err);
        }
    }

    window.openAddUmkmAdminModal = function () {
        const html = `
            <form id="formModalUmkm" onsubmit="saveUmkmModal(event)">
                <input type="hidden" id="umkmId" value="">
                <div class="admin-form-group">
                    <label>Nama Usaha / Produk UMKM</label>
                    <input type="text" id="umkmTitleInput" class="admin-form-control" placeholder="Rara Kue" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Nama Pemilik Usaha</label>
                        <input type="text" id="umkmOwnerInput" class="admin-form-control" placeholder="Ibu Maryam" required>
                    </div>
                    <div class="admin-form-group">
                        <label>Kategori Usaha</label>
                        <select id="umkmCategoryInput" class="admin-form-control">
                            <option value="kuliner">Kuliner</option>
                            <option value="kerajinan">Kerajinan Tangan</option>
                            <option value="pertanian">Pertanian / Hasil Alam</option>
                            <option value="jasa">Jasa & Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Harga / Kisaran</label>
                        <input type="text" id="umkmPriceInput" class="admin-form-control" placeholder="Rp 15.000 / bks" required>
                    </div>
                    <div class="admin-form-group">
                        <label>Nomor WhatsApp (Gunakan Kode Negara 62)</label>
                        <input type="text" id="umkmWaInput" class="admin-form-control" placeholder="6281234567890" required>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Deskripsi Produk / Usaha</label>
                    <textarea id="umkmDescInput" class="admin-form-control" rows="3" required></textarea>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload / Pilih Foto Produk UMKM</label>
                    <input type="file" id="umkmImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="umkmImgInput" class="admin-form-control" placeholder="assets/kegiatan1.jpg atau Upload File">
                    <div style="margin-top: 10px;">
                        <img id="umkmImgPreview" src="" style="max-height: 100px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <button type="submit" class="btn-admin-submit" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan UMKM
                </button>
            </form>
        `;
        openAdminModal('Tambah Data UMKM Baru', html);
        bindImageUpload('umkmImgFile', 'umkmImgInput', 'umkmImgPreview');
    };

    window.editUmkm = async function (id) {
        const list = await window.dusunService.getUMKM();
        const u = list.find(x => x.id === id);
        if (!u) return;

        openAddUmkmAdminModal();
        document.getElementById('umkmId').value = u.id;
        document.getElementById('umkmTitleInput').value = u.title;
        document.getElementById('umkmOwnerInput').value = u.owner;
        document.getElementById('umkmCategoryInput').value = u.category;
        document.getElementById('umkmPriceInput').value = u.price_str;
        document.getElementById('umkmWaInput').value = u.whatsapp;
        document.getElementById('umkmDescInput').value = u.description;
        document.getElementById('umkmImgInput').value = u.image_url || '';
        document.getElementById('adminModalTitle').textContent = 'Edit Data UMKM';
        bindImageUpload('umkmImgFile', 'umkmImgInput', 'umkmImgPreview');
    };

    window.saveUmkmModal = async function (e) {
        e.preventDefault();
        const id = document.getElementById('umkmId').value;
        const item = {
            title: document.getElementById('umkmTitleInput').value,
            owner: document.getElementById('umkmOwnerInput').value,
            category: document.getElementById('umkmCategoryInput').value,
            price_str: document.getElementById('umkmPriceInput').value,
            whatsapp: document.getElementById('umkmWaInput').value,
            description: document.getElementById('umkmDescInput').value,
            image_url: document.getElementById('umkmImgInput').value
        };
        if (id) item.id = parseInt(id, 10);

        try {
            await window.dusunService.saveUMKM(item);
            closeAdminModal();
            loadUmkmTab();
            showAdminToast('Data UMKM berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan UMKM: ' + err.message);
        }
    };

    window.deleteUmkm = async function (id) {
        if (confirm('Hapus data UMKM ini?')) {
            await window.dusunService.deleteUMKM(id);
            loadUmkmTab();
            showAdminToast('Data UMKM dihapus.');
        }
    };

    // F. TAB SUPABASE SETTINGS
    function loadSupabaseTab() {
        const config = window.dusunService.getSupabaseConfig();
        if (document.getElementById('supabaseUrl')) document.getElementById('supabaseUrl').value = config.url || '';
        if (document.getElementById('supabaseKey')) document.getElementById('supabaseKey').value = config.key || '';
    }

    const formSupabase = document.getElementById('formSupabase');
    if (formSupabase) {
        formSupabase.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = document.getElementById('supabaseUrl').value.trim();
            const key = document.getElementById('supabaseKey').value.trim();

            window.dusunService.saveSupabaseConfig(url, key);
            updateDbBadge();
            showAdminToast('Pengaturan Supabase disimpan. Menghubungkan ke PostgreSQL...');
        });
    }

    // Toast Notification Generator
    function showAdminToast(message) {
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = 'background: #10b981; color: #fff; padding: 14px 20px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 10px;';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Initial load check
    checkSession();
});

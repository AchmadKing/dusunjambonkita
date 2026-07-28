/**
 * ============================================================================
 * ADMIN DASHBOARD SCRIPT - PORTAL DUSUN JAMBON
 * ============================================================================
 * Handles tab navigation, Supabase Auth, CRUD operations, image uploads 
 * directly via Supabase JS SDK (100% Client-Side, No LocalStorage DB).
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const adminDashboardSection = document.getElementById('adminDashboardSection');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const btnLogout = document.getElementById('btnLogout');
    const dbStatusBadge = document.getElementById('dbStatusBadge');

    // ----------------------------------------------------------------------
    // 1. Toast Notification Helper
    // ----------------------------------------------------------------------
    function showAdminToast(message) {
        let toast = document.getElementById('adminToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'adminToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: #059669;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.95rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 9999;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
        toast.style.opacity = '1';
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 3000);
    }

    // ----------------------------------------------------------------------
    // 2. Image Upload Helper via Supabase Storage JS SDK
    // ----------------------------------------------------------------------
    function bindImageUpload(fileInputId, textInputId, previewImgId) {
        const fileInput = document.getElementById(fileInputId);
        const textInput = document.getElementById(textInputId);
        const previewImg = document.getElementById(previewImgId);

        if (textInput && previewImg && textInput.value) {
            previewImg.src = textInput.value;
            previewImg.style.display = 'block';
        }

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (previewImg) {
                    previewImg.src = URL.createObjectURL(file);
                    previewImg.style.display = 'block';
                }

                try {
                    const uploadedUrl = await window.dusunService.uploadImageFile(file);
                    if (textInput) textInput.value = uploadedUrl;
                    if (previewImg) {
                        previewImg.src = uploadedUrl;
                        previewImg.style.display = 'block';
                    }
                    showAdminToast('Gambar berhasil diunggah ke Supabase Storage!');
                } catch (err) {
                    alert('Gagal mengunggah gambar: ' + (err.message || 'Error'));
                }
            });
        }

        if (textInput && previewImg) {
            textInput.addEventListener('input', () => {
                if (textInput.value.trim()) {
                    previewImg.src = textInput.value.trim();
                    previewImg.style.display = 'block';
                } else {
                    previewImg.style.display = 'none';
                }
            });
        }
    }

    bindImageUpload('berandaHeroImgFile', 'berandaHeroImg', 'berandaHeroImgPreview');
    bindImageUpload('berandaKdImgFile', 'berandaKdImg', 'berandaKdImgPreview');
    bindImageUpload('petaImgFile', 'petaImgUrl', 'petaImgPreview');

    // ----------------------------------------------------------------------
    // 3. Authentication Session Check & Login Handler (Supabase Auth)
    // ----------------------------------------------------------------------
    async function checkSession() {
        const session = await window.dusunService.getAdminSession();
        if (session) {
            if (loginSection) loginSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'flex';
            updateDbBadge();
            loadAllTabData();
        } else {
            if (loginSection) loginSection.style.display = 'flex';
            if (adminDashboardSection) adminDashboardSection.style.display = 'none';
        }
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            try {
                if (!window.dusunService || typeof window.dusunService.loginAdmin !== 'function') {
                    if ((username === 'admin@dusunjambon.id' || username === 'admin') && password === 'admin123') {
                        localStorage.setItem('dusun_admin_session', JSON.stringify({ user: { email: 'admin@dusunjambon.id', role: 'admin' } }));
                        showAdminToast('Login Demo Berhasil!');
                        checkSession();
                        return;
                    } else {
                        throw new Error('Gagal terhubung ke layanan otentikasi. Gunakan email: admin@dusunjambon.id & pass: admin123');
                    }
                }
                const res = await window.dusunService.loginAdmin(username, password);
                if (res && res.status === 'success') {
                    showAdminToast('Login berhasil! Selamat datang Admin Dusun.');
                    checkSession();
                }
            } catch (err) {
                alert('Login Gagal: ' + (err.message || 'Email atau Password salah'));
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar dari Panel Admin?')) {
                await window.dusunService.logoutAdmin();
                checkSession();
            }
        });
    }

    function updateDbBadge() {
        if (!dbStatusBadge) return;
        dbStatusBadge.className = 'db-status-badge supabase';
        dbStatusBadge.innerHTML = `<i class="fa-solid fa-cloud"></i> Database: Supabase PostgreSQL`;
    }

    // ----------------------------------------------------------------------
    // 4. Tab Panel Navigation System
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
        'tab-kontak': 'Pengelolaan Informasi Kontak Dusun',
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
    // 5. Modal Admin Helper Functions
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
    // 6. Data Loaders for All Tabs via Supabase JS SDK
    // ----------------------------------------------------------------------
    async function loadAllTabData() {
        await loadBerandaTab();
        await loadProfilTab();
        await loadBeritaTab();
        await loadPetaTab();
        await loadUmkmTab();
        await loadKontakTab();
    }

    // A. TAB BERANDA
    async function loadBerandaTab() {
        try {
            const b = await window.dusunService.getBeranda();
            if (b) {
                if (document.getElementById('berandaHeadline')) document.getElementById('berandaHeadline').value = b.hero_headline || '';
                if (document.getElementById('berandaHeadlineSpan')) document.getElementById('berandaHeadlineSpan').value = b.hero_headline_span || '';
                if (document.getElementById('berandaHeadlineRed')) document.getElementById('berandaHeadlineRed').value = b.hero_headline_red || '';
                if (document.getElementById('berandaDesc')) document.getElementById('berandaDesc').value = b.hero_desc || '';
                if (document.getElementById('berandaHeroImg')) document.getElementById('berandaHeroImg').value = b.hero_image_url || '';
                if (document.getElementById('berandaHeroCap')) document.getElementById('berandaHeroCap').value = b.hero_image_caption || '';
                if (document.getElementById('berandaKdTitle')) document.getElementById('berandaKdTitle').value = b.kepala_dusun_title || '';
                if (document.getElementById('berandaKdSpeech1')) document.getElementById('berandaKdSpeech1').value = b.kepala_dusun_speech_1 || '';
                if (document.getElementById('berandaKdSpeech2')) document.getElementById('berandaKdSpeech2').value = b.kepala_dusun_speech_2 || '';
                if (document.getElementById('berandaKdName')) document.getElementById('berandaKdName').value = b.kepala_dusun_name || '';
                if (document.getElementById('berandaKdImg')) document.getElementById('berandaKdImg').value = b.kepala_dusun_image_url || '';

                if (b.hero_image_url && document.getElementById('berandaHeroImgPreview')) {
                    document.getElementById('berandaHeroImgPreview').src = b.hero_image_url;
                    document.getElementById('berandaHeroImgPreview').style.display = 'block';
                }
                if (b.kepala_dusun_image_url && document.getElementById('berandaKdImgPreview')) {
                    document.getElementById('berandaKdImgPreview').src = b.kepala_dusun_image_url;
                    document.getElementById('berandaKdImgPreview').style.display = 'block';
                }
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
                showAdminToast('Halaman Beranda berhasil diperbarui di Supabase!');
            } catch (err) {
                alert('Gagal menyimpan beranda: ' + err.message);
            }
        });
    }

    // B. TAB PROFIL & GALERI
    async function loadProfilTab() {
        try {
            const p = await window.dusunService.getProfil();
            if (p) {
                if (document.getElementById('profilSejarah1')) document.getElementById('profilSejarah1').value = p.sejarah_p1 || '';
                if (document.getElementById('profilSejarah2')) document.getElementById('profilSejarah2').value = p.sejarah_p2 || '';
                if (document.getElementById('profilVisi')) document.getElementById('profilVisi').value = p.visi_text || '';
                let list = p.misi_list;
                if (typeof list === 'string') {
                    try { list = JSON.parse(list); } catch (e) { list = []; }
                }
                if (Array.isArray(list)) {
                    if (document.getElementById('profilMisi')) document.getElementById('profilMisi').value = list.join('\n');
                }
            }
            const gallery = await window.dusunService.getProfilGallery();
            renderGalleryTable(gallery || []);
        } catch (err) {
            console.error('Error loading Profil tab:', err);
        }
    }

    const formProfil = document.getElementById('formProfil');
    if (formProfil) {
        formProfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                sejarah_p1: document.getElementById('profilSejarah1').value,
                sejarah_p2: document.getElementById('profilSejarah2').value,
                visi_text: document.getElementById('profilVisi').value,
                misi_list: document.getElementById('profilMisi').value
            };

            try {
                await window.dusunService.updateProfil(payload);
                showAdminToast('Data Profil berhasil diperbarui di Supabase!');
            } catch (err) {
                alert('Gagal menyimpan profil: ' + err.message);
            }
        });
    }

    function renderGalleryTable(items) {
        const tbody = document.getElementById('profilGalleryTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--admin-text-muted);">Belum ada foto galeri.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><img src="${item.image_url}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${item.title}</strong><br><small style="color:var(--admin-text-muted);">${item.subtitle || ''}</small></td>
                <td><span class="admin-badge blue">${item.tag || 'Kegiatan'}</span></td>
                <td><code>${item.type || 'gallery'}</code></td>
                <td>
                    <button class="btn-action-edit" onclick="editGalleryModal(${item.id}, '${encodeURIComponent(JSON.stringify(item))}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action-delete" onclick="deleteGalleryItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.openAddGalleryModal = function () {
        openAdminModal('Tambah Foto Galeri / Slideshow', `
            <form id="formAddGallery">
                <input type="hidden" id="mgId" value="0">
                <div class="admin-form-group">
                    <label>Judul / Caption Foto</label>
                    <input type="text" id="mgTitle" class="admin-form-control" required>
                </div>
                <div class="admin-form-group">
                    <label>Sub-Judul / Keterangan</label>
                    <input type="text" id="mgSubtitle" class="admin-form-control">
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Tag / Kategori</label>
                        <input type="text" id="mgTag" class="admin-form-control" value="Kegiatan">
                    </div>
                    <div class="admin-form-group">
                        <label>Tipe Display</label>
                        <select id="mgType" class="admin-form-control">
                            <option value="gallery">Galeri Foto Grid</option>
                            <option value="slideshow">Slideshow Banner</option>
                        </select>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload Foto (Supabase Storage)</label>
                    <input type="file" id="mgImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="mgImg" class="admin-form-control" placeholder="URL Foto" required>
                    <div style="margin-top: 10px;">
                        <img id="mgImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <button type="submit" class="btn-admin-submit"><i class="fa-solid fa-floppy-disk"></i> Simpan Foto Galeri</button>
            </form>
        `);

        bindImageUpload('mgImgFile', 'mgImg', 'mgImgPreview');

        document.getElementById('formAddGallery').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('mgId').value);
            const payload = {
                id: id,
                title: document.getElementById('mgTitle').value,
                subtitle: document.getElementById('mgSubtitle').value,
                tag: document.getElementById('mgTag').value,
                type: document.getElementById('mgType').value,
                image_url: document.getElementById('mgImg').value
            };

            await window.dusunService.saveProfilGalleryItem(payload);
            showAdminToast('Foto galeri berhasil disimpan!');
            closeAdminModal();
            loadProfilTab();
        });
    };

    window.editGalleryModal = function (id, encodedObj) {
        const item = JSON.parse(decodeURIComponent(encodedObj));
        openAddGalleryModal();
        document.getElementById('adminModalTitle').textContent = 'Edit Foto Galeri';
        document.getElementById('mgId').value = item.id;
        document.getElementById('mgTitle').value = item.title;
        document.getElementById('mgSubtitle').value = item.subtitle || '';
        document.getElementById('mgTag').value = item.tag || 'Kegiatan';
        document.getElementById('mgType').value = item.type || 'gallery';
        document.getElementById('mgImg').value = item.image_url;
        if (item.image_url && document.getElementById('mgImgPreview')) {
            document.getElementById('mgImgPreview').src = item.image_url;
            document.getElementById('mgImgPreview').style.display = 'block';
        }
    };

    window.deleteGalleryItem = async function (id) {
        if (!confirm('Hapus foto ini dari galeri?')) return;
        await window.dusunService.deleteProfilGalleryItem(id);
        showAdminToast('Foto galeri dihapus');
        loadProfilTab();
    };

    // C. TAB BERITA
    async function loadBeritaTab() {
        try {
            const data = await window.dusunService.getBerita();
            renderBeritaTable(data || []);
        } catch (err) {
            console.error('Error loading Berita tab:', err);
        }
    }

    function renderBeritaTable(items) {
        const tbody = document.getElementById('beritaTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--admin-text-muted);">Belum ada data berita.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><strong>${item.title}</strong></td>
                <td><span class="admin-badge red">${item.category}</span></td>
                <td>${item.date_str}</td>
                <td>${item.author}</td>
                <td><small style="color:var(--admin-text-muted);">${(item.excerpt || '').substring(0, 45)}...</small></td>
                <td>
                    <button class="btn-action-edit" onclick="editBeritaModal(${item.id}, '${encodeURIComponent(JSON.stringify(item))}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action-delete" onclick="deleteBeritaItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.openAddBeritaModal = function () {
        openAdminModal('Tambah Berita Baru', `
            <form id="formAddBerita">
                <input type="hidden" id="mbId" value="0">
                <div class="admin-form-group">
                    <label>Judul Berita</label>
                    <input type="text" id="mbTitle" class="admin-form-control" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Kategori</label>
                        <select id="mbCategory" class="admin-form-control">
                            <option value="kegiatan">Kegiatan Warga</option>
                            <option value="pembangunan">Pembangunan</option>
                            <option value="pengumuman">Pengumuman</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label>Penulis</label>
                        <input type="text" id="mbAuthor" class="admin-form-control" value="Pengurus Dusun">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Tanggal Berita</label>
                    <input type="text" id="mbDate" class="admin-form-control" value="${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}">
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload Thumbnail Gambar (Supabase Storage)</label>
                    <input type="file" id="mbImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="mbImg" class="admin-form-control" placeholder="URL Gambar Thumbnail">
                    <div style="margin-top: 10px;">
                        <img id="mbImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Ringkasan Berita (Excerpt)</label>
                    <textarea id="mbExcerpt" class="admin-form-control" rows="2" required></textarea>
                </div>
                <div class="admin-form-group">
                    <label>Isi Lengkap Berita</label>
                    <textarea id="mbContent" class="admin-form-control" rows="5" required></textarea>
                </div>

                <hr style="border-color: var(--admin-border); margin: 24px 0;">

                <div class="admin-form-group">
                    <label style="font-size: 1.05rem; font-weight: 700;">
                        <i class="fa-solid fa-images" style="color: var(--admin-accent-blue);"></i> Gambar Isi Berita (Multi Upload)
                    </label>
                    <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                        Upload beberapa gambar untuk isi berita. Jika lebih dari 1, akan tampil sebagai slideshow otomatis.
                    </p>
                    <div id="mbMultiUploadList" class="multi-upload-list">
                        <!-- Multi-upload items will be added here -->
                    </div>
                    <button type="button" class="btn-add-multi-upload" onclick="addBeritaImageSlot()">
                        <i class="fa-solid fa-plus"></i> Tambah Foto Berita
                    </button>
                </div>

                <button type="submit" class="btn-admin-submit"><i class="fa-solid fa-floppy-disk"></i> Simpan Berita</button>
            </form>
        `);

        bindImageUpload('mbImgFile', 'mbImg', 'mbImgPreview');

        document.getElementById('formAddBerita').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: parseInt(document.getElementById('mbId').value),
                title: document.getElementById('mbTitle').value,
                category: document.getElementById('mbCategory').value,
                author: document.getElementById('mbAuthor').value,
                date_str: document.getElementById('mbDate').value,
                image_url: document.getElementById('mbImg').value,
                excerpt: document.getElementById('mbExcerpt').value,
                content: document.getElementById('mbContent').value
            };

            try {
                // Save berita first
                let savedBerita;
                if (payload.id && payload.id > 0) {
                    await window.dusunService.saveBerita(payload);
                    savedBerita = { id: payload.id };
                } else {
                    delete payload.id;
                    const { data, error } = await window.dusunService.supabaseClient
                        .from('berita').insert([payload]).select('id').single();
                    if (error) throw error;
                    savedBerita = data;
                }

                const beritaId = savedBerita.id || payload.id;

                // Save multi-upload images
                if (beritaId) {
                    await saveMultiUploadImages('berita', beritaId);
                }

                showAdminToast('Berita berhasil disimpan!');
                closeAdminModal();
                loadBeritaTab();
            } catch (err) {
                alert('Gagal menyimpan berita: ' + (err.message || err));
            }
        });
    };

    // Track multi-upload items
    let beritaMultiUploadCounter = 0;
    let beritaExistingImages = [];

    window.addBeritaImageSlot = function () {
        beritaMultiUploadCounter++;
        const container = document.getElementById('mbMultiUploadList');
        const slotId = `berita-upload-${beritaMultiUploadCounter}`;

        const slotHtml = `
            <div class="multi-upload-item" id="${slotId}" data-existing-id="0">
                <div class="multi-upload-item-header">
                    <span class="multi-upload-label"><i class="fa-solid fa-image"></i> Foto #${container.children.length + 1}</span>
                    <button type="button" class="btn-remove-upload" onclick="removeMultiUploadSlot('${slotId}')">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </div>
                <div class="multi-upload-item-body">
                    <input type="file" accept="image/*" class="admin-form-control multi-file-input" data-slot="${slotId}" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" class="admin-form-control multi-url-input" placeholder="URL Gambar" data-slot="${slotId}">
                    <div style="margin-top: 8px;">
                        <img class="multi-img-preview" src="" style="max-height: 100px; border-radius: 8px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                    <input type="text" class="admin-form-control multi-caption-input" placeholder="Keterangan / Caption gambar..." data-slot="${slotId}" style="margin-top: 8px;">
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', slotHtml);

        // Bind file input for this slot
        const slotEl = document.getElementById(slotId);
        const fileInput = slotEl.querySelector('.multi-file-input');
        const urlInput = slotEl.querySelector('.multi-url-input');
        const previewImg = slotEl.querySelector('.multi-img-preview');

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            previewImg.src = URL.createObjectURL(file);
            previewImg.style.display = 'block';

            try {
                const uploadedUrl = await window.dusunService.uploadImageFile(file);
                urlInput.value = uploadedUrl;
                previewImg.src = uploadedUrl;
                showAdminToast('Foto berhasil diunggah!');
            } catch (err) {
                alert('Gagal unggah: ' + (err.message || 'Error'));
            }
        });

        urlInput.addEventListener('input', () => {
            if (urlInput.value.trim()) {
                previewImg.src = urlInput.value.trim();
                previewImg.style.display = 'block';
            } else {
                previewImg.style.display = 'none';
            }
        });
    };

    window.removeMultiUploadSlot = function (slotId) {
        const slot = document.getElementById(slotId);
        if (slot) {
            const existingId = parseInt(slot.getAttribute('data-existing-id'));
            if (existingId > 0) {
                // Mark for deletion
                slot.setAttribute('data-deleted', 'true');
                slot.style.display = 'none';
            } else {
                slot.remove();
            }
        }
    };

    async function saveMultiUploadImages(type, parentId) {
        const listId = type === 'berita' ? 'mbMultiUploadList' : 'muMultiUploadList';
        const container = document.getElementById(listId);
        if (!container) return;

        const slots = container.querySelectorAll('.multi-upload-item');
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const existingId = parseInt(slot.getAttribute('data-existing-id') || '0');
            const isDeleted = slot.getAttribute('data-deleted') === 'true';

            if (isDeleted && existingId > 0) {
                // Delete existing image
                if (type === 'berita') {
                    await window.dusunService.deleteBeritaImage(existingId);
                } else {
                    await window.dusunService.deleteUmkmImage(existingId);
                }
                continue;
            }

            if (isDeleted) continue;

            const urlInput = slot.querySelector('.multi-url-input');
            const captionInput = slot.querySelector('.multi-caption-input');
            const imageUrl = urlInput ? urlInput.value.trim() : '';
            const caption = captionInput ? captionInput.value.trim() : '';

            if (!imageUrl) continue;

            const imgPayload = {
                image_url: imageUrl,
                caption: caption,
                sort_order: i
            };

            if (existingId > 0) {
                imgPayload.id = existingId;
            }

            if (type === 'berita') {
                imgPayload.berita_id = parentId;
                await window.dusunService.saveBeritaImage(imgPayload);
            } else {
                imgPayload.umkm_id = parentId;
                await window.dusunService.saveUmkmImage(imgPayload);
            }
        }
    }

    window.editBeritaModal = async function (id, encodedObj) {
        const b = JSON.parse(decodeURIComponent(encodedObj));
        openAddBeritaModal();
        document.getElementById('adminModalTitle').textContent = 'Edit Data Berita';
        document.getElementById('mbId').value = b.id;
        document.getElementById('mbTitle').value = b.title;
        document.getElementById('mbCategory').value = b.category;
        document.getElementById('mbAuthor').value = b.author;
        document.getElementById('mbDate').value = b.date_str;
        document.getElementById('mbImg').value = b.image_url || '';
        if (b.image_url && document.getElementById('mbImgPreview')) {
            document.getElementById('mbImgPreview').src = b.image_url;
            document.getElementById('mbImgPreview').style.display = 'block';
        }
        document.getElementById('mbExcerpt').value = b.excerpt;
        document.getElementById('mbContent').value = b.content;

        // Load existing multi-upload images
        try {
            const existingImages = await window.dusunService.getBeritaImages(b.id);
            if (existingImages && existingImages.length > 0) {
                existingImages.forEach(img => {
                    beritaMultiUploadCounter++;
                    const container = document.getElementById('mbMultiUploadList');
                    const slotId = `berita-upload-${beritaMultiUploadCounter}`;
                    const slotHtml = `
                        <div class="multi-upload-item" id="${slotId}" data-existing-id="${img.id}">
                            <div class="multi-upload-item-header">
                                <span class="multi-upload-label"><i class="fa-solid fa-image"></i> Foto Existing #${container.children.length + 1}</span>
                                <button type="button" class="btn-remove-upload" onclick="removeMultiUploadSlot('${slotId}')">
                                    <i class="fa-solid fa-trash"></i> Hapus
                                </button>
                            </div>
                            <div class="multi-upload-item-body">
                                <input type="file" accept="image/*" class="admin-form-control multi-file-input" data-slot="${slotId}" style="padding: 8px; margin-bottom: 8px;">
                                <input type="text" class="admin-form-control multi-url-input" placeholder="URL Gambar" data-slot="${slotId}" value="${img.image_url}">
                                <div style="margin-top: 8px;">
                                    <img class="multi-img-preview" src="${img.image_url}" style="max-height: 100px; border-radius: 8px; display: block; border: 1px solid var(--admin-border);">
                                </div>
                                <input type="text" class="admin-form-control multi-caption-input" placeholder="Keterangan / Caption gambar..." data-slot="${slotId}" style="margin-top: 8px;" value="${img.caption || ''}">
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', slotHtml);

                    // Bind file input for this existing slot
                    const slotEl = document.getElementById(slotId);
                    const fileInput = slotEl.querySelector('.multi-file-input');
                    const urlInput = slotEl.querySelector('.multi-url-input');
                    const previewImg = slotEl.querySelector('.multi-img-preview');

                    fileInput.addEventListener('change', async (ev) => {
                        const file = ev.target.files[0];
                        if (!file) return;
                        previewImg.src = URL.createObjectURL(file);
                        previewImg.style.display = 'block';
                        try {
                            const uploadedUrl = await window.dusunService.uploadImageFile(file);
                            urlInput.value = uploadedUrl;
                            previewImg.src = uploadedUrl;
                            showAdminToast('Foto berhasil diunggah!');
                        } catch (err) {
                            alert('Gagal unggah: ' + (err.message || 'Error'));
                        }
                    });

                    urlInput.addEventListener('input', () => {
                        if (urlInput.value.trim()) {
                            previewImg.src = urlInput.value.trim();
                            previewImg.style.display = 'block';
                        } else {
                            previewImg.style.display = 'none';
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Error loading existing berita images:', err);
        }
    };

    window.deleteBeritaItem = async function (id) {
        if (!confirm('Hapus berita ini beserta semua gambar terkait?')) return;
        await window.dusunService.deleteBerita(id);
        showAdminToast('Berita dihapus');
        loadBeritaTab();
    };

    // D. TAB PETA & TITIK LOKASI
    async function loadPetaTab() {
        try {
            const p = await window.dusunService.getAdministrasiPeta();
            if (p) {
                if (document.getElementById('petaTitle')) document.getElementById('petaTitle').value = p.map_title || '';
                if (document.getElementById('petaDesc')) document.getElementById('petaDesc').value = p.map_desc || '';
                if (document.getElementById('petaImgUrl')) document.getElementById('petaImgUrl').value = p.map_image_url || '';
                if (p.map_image_url && document.getElementById('petaImgPreview')) {
                    document.getElementById('petaImgPreview').src = p.map_image_url;
                    document.getElementById('petaImgPreview').style.display = 'block';
                }
            }
            const lokasi = await window.dusunService.getTitikLokasi();
            renderLokasiTable(lokasi || []);
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
                showAdminToast('Peta Administrasi berhasil diperbarui di Supabase!');
            } catch (err) {
                alert('Gagal menyimpan peta: ' + err.message);
            }
        });
    }

    function renderLokasiTable(items) {
        const tbody = document.getElementById('lokasiTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--admin-text-muted);">Belum ada titik lokasi.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><img src="${item.image_url || ''}" style="width: 45px; height: 35px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${item.title}</strong></td>
                <td><span class="admin-badge ${item.badge_color || 'blue'}">${item.badge_label || item.category}</span></td>
                <td><code>${item.coordinates}</code></td>
                <td><a href="${item.gmaps_url}" target="_blank" style="color:var(--admin-accent-blue); text-decoration:none;"><i class="fa-solid fa-map-pin"></i> Maps</a></td>
                <td>
                    <button class="btn-action-edit" onclick="editLokasiModal(${item.id}, '${encodeURIComponent(JSON.stringify(item))}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action-delete" onclick="deleteLokasiItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.openAddLokasiModal = function () {
        openAdminModal('Tambah Titik Lokasi Penting', `
            <form id="formAddLokasi">
                <input type="hidden" id="mlId" value="0">
                <div class="admin-form-group">
                    <label>Nama Lokasi</label>
                    <input type="text" id="mlTitle" class="admin-form-control" placeholder="Contoh: Rumah RT 01" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Kategori</label>
                        <select id="mlCategory" class="admin-form-control">
                            <option value="rt">Pengurus RT</option>
                            <option value="ibadah">Tempat Ibadah</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label>Label Badge</label>
                        <input type="text" id="mlBadge" class="admin-form-control" placeholder="Pengurus RT 01">
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Warna Badge</label>
                        <select id="mlColor" class="admin-form-control">
                            <option value="blue">Biru (RT)</option>
                            <option value="red">Merah (Ibadah)</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label>Koordinat Lat, Lng</label>
                        <input type="text" id="mlCoords" class="admin-form-control" placeholder="-7.661971, 110.268369" required>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>URL Google Maps</label>
                    <input type="text" id="mlGmaps" class="admin-form-control" placeholder="https://www.google.com/maps?q=..." required>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload Foto Lokasi (Supabase Storage)</label>
                    <input type="file" id="mlImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="mlImg" class="admin-form-control" placeholder="URL Foto Lokasi">
                    <div style="margin-top: 10px;">
                        <img id="mlImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Deskripsi Lokasi</label>
                    <textarea id="mlDesc" class="admin-form-control" rows="2" required></textarea>
                </div>
                <button type="submit" class="btn-admin-submit"><i class="fa-solid fa-floppy-disk"></i> Simpan Titik Lokasi</button>
            </form>
        `);

        bindImageUpload('mlImgFile', 'mlImg', 'mlImgPreview');

        document.getElementById('formAddLokasi').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('mlId').value);
            const payload = {
                id: id,
                title: document.getElementById('mlTitle').value,
                category: document.getElementById('mlCategory').value,
                badge_label: document.getElementById('mlBadge').value,
                badge_color: document.getElementById('mlColor').value,
                coordinates: document.getElementById('mlCoords').value,
                gmaps_url: document.getElementById('mlGmaps').value,
                image_url: document.getElementById('mlImg').value,
                description: document.getElementById('mlDesc').value
            };

            await window.dusunService.saveTitikLokasi(payload);
            showAdminToast('Titik lokasi berhasil disimpan!');
            closeAdminModal();
            loadPetaTab();
        });
    };

    window.editLokasiModal = function (id, encodedObj) {
        const item = JSON.parse(decodeURIComponent(encodedObj));
        openAddLokasiModal();
        document.getElementById('adminModalTitle').textContent = 'Edit Titik Lokasi';
        document.getElementById('mlId').value = item.id;
        document.getElementById('mlTitle').value = item.title;
        document.getElementById('mlCategory').value = item.category;
        document.getElementById('mlBadge').value = item.badge_label || '';
        document.getElementById('mlColor').value = item.badge_color || 'blue';
        document.getElementById('mlCoords').value = item.coordinates;
        document.getElementById('mlGmaps').value = item.gmaps_url;
        document.getElementById('mlImg').value = item.image_url || '';
        if (item.image_url && document.getElementById('mlImgPreview')) {
            document.getElementById('mlImgPreview').src = item.image_url;
            document.getElementById('mlImgPreview').style.display = 'block';
        }
        document.getElementById('mlDesc').value = item.description;
    };

    window.deleteLokasiItem = async function (id) {
        if (!confirm('Hapus titik lokasi ini?')) return;
        await window.dusunService.deleteTitikLokasi(id);
        showAdminToast('Titik lokasi dihapus');
        loadPetaTab();
    };

    // E. TAB UMKM
    async function loadUmkmTab() {
        try {
            const data = await window.dusunService.getUMKM();
            renderUmkmTable(data || []);
        } catch (err) {
            console.error('Error loading UMKM tab:', err);
        }
    }

    function renderUmkmTable(items) {
        const tbody = document.getElementById('umkmTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--admin-text-muted);">Belum ada data UMKM.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><img src="${item.image_url || ''}" style="width: 45px; height: 35px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${item.title}</strong></td>
                <td>${item.owner}</td>
                <td><span class="admin-badge blue">${item.category}</span></td>
                <td><strong style="color:var(--admin-accent-green);">${item.price_str}</strong></td>
                <td><code>${item.whatsapp}</code></td>
                <td>
                    <button class="btn-action-edit" onclick="editUmkmModal(${item.id}, '${encodeURIComponent(JSON.stringify(item))}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action-delete" onclick="deleteUmkmItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.openAddUmkmAdminModal = function () {
        openAdminModal('Tambah UMKM Baru', `
            <form id="formAddUmkm">
                <input type="hidden" id="muId" value="0">
                <div class="admin-form-group">
                    <label>Nama UMKM / Usaha</label>
                    <input type="text" id="muTitle" class="admin-form-control" required>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Nama Pemilik</label>
                        <input type="text" id="muOwner" class="admin-form-control" required>
                    </div>
                    <div class="admin-form-group">
                        <label>Kategori</label>
                        <select id="muCategory" class="admin-form-control">
                            <option value="kuliner">Kuliner & Camilan</option>
                            <option value="kerajinan">Kerajinan Tangan</option>
                            <option value="pertanian">Hasil Tani & Madu</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="admin-form-group">
                        <label>Harga / Rentang Harga</label>
                        <input type="text" id="muPrice" class="admin-form-control" placeholder="Contoh: Rp 15.000 / bks" required>
                    </div>
                    <div class="admin-form-group">
                        <label>No. WhatsApp (Format: 628xxx)</label>
                        <input type="text" id="muWa" class="admin-form-control" placeholder="6281234567890" required>
                    </div>
                </div>
                <div class="admin-form-group">
                    <label><i class="fa-solid fa-upload"></i> Upload Thumbnail Produk UMKM (Supabase Storage)</label>
                    <input type="file" id="muImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="muImg" class="admin-form-control" placeholder="URL Foto Thumbnail UMKM">
                    <div style="margin-top: 10px;">
                        <img id="muImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Deskripsi Produk UMKM</label>
                    <textarea id="muDesc" class="admin-form-control" rows="3" required></textarea>
                </div>

                <hr style="border-color: var(--admin-border); margin: 24px 0;">

                <div class="admin-form-group">
                    <label style="font-size: 1.05rem; font-weight: 700;">
                        <i class="fa-solid fa-images" style="color: var(--admin-accent-green);"></i> Foto Katalog Produk (Multi Upload)
                    </label>
                    <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                        Upload beberapa foto produk untuk katalog. Jika lebih dari 1, akan tampil sebagai slideshow di halaman detail.
                    </p>
                    <div id="muMultiUploadList" class="multi-upload-list">
                        <!-- Multi-upload items will be added here -->
                    </div>
                    <button type="button" class="btn-add-multi-upload" onclick="addUmkmImageSlot()">
                        <i class="fa-solid fa-plus"></i> Tambah Foto Katalog
                    </button>
                </div>

                <button type="submit" class="btn-admin-submit"><i class="fa-solid fa-floppy-disk"></i> Simpan UMKM</button>
            </form>
        `);

        bindImageUpload('muImgFile', 'muImg', 'muImgPreview');

        document.getElementById('formAddUmkm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: parseInt(document.getElementById('muId').value),
                title: document.getElementById('muTitle').value,
                owner: document.getElementById('muOwner').value,
                category: document.getElementById('muCategory').value,
                price_str: document.getElementById('muPrice').value,
                whatsapp: document.getElementById('muWa').value,
                image_url: document.getElementById('muImg').value,
                description: document.getElementById('muDesc').value
            };

            try {
                let savedUmkm;
                if (payload.id && payload.id > 0) {
                    await window.dusunService.saveUMKM(payload);
                    savedUmkm = { id: payload.id };
                } else {
                    delete payload.id;
                    const { data, error } = await window.dusunService.supabaseClient
                        .from('umkm').insert([payload]).select('id').single();
                    if (error) throw error;
                    savedUmkm = data;
                }

                const umkmId = savedUmkm.id || payload.id;

                // Save multi-upload images
                if (umkmId) {
                    await saveMultiUploadImages('umkm', umkmId);
                }

                showAdminToast('UMKM berhasil disimpan!');
                closeAdminModal();
                loadUmkmTab();
            } catch (err) {
                alert('Gagal menyimpan UMKM: ' + (err.message || err));
            }
        });
    };

    let umkmMultiUploadCounter = 0;

    window.addUmkmImageSlot = function () {
        umkmMultiUploadCounter++;
        const container = document.getElementById('muMultiUploadList');
        const slotId = `umkm-upload-${umkmMultiUploadCounter}`;

        const slotHtml = `
            <div class="multi-upload-item" id="${slotId}" data-existing-id="0">
                <div class="multi-upload-item-header">
                    <span class="multi-upload-label"><i class="fa-solid fa-image"></i> Katalog #${container.children.length + 1}</span>
                    <button type="button" class="btn-remove-upload" onclick="removeMultiUploadSlot('${slotId}')">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </div>
                <div class="multi-upload-item-body">
                    <input type="file" accept="image/*" class="admin-form-control multi-file-input" data-slot="${slotId}" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" class="admin-form-control multi-url-input" placeholder="URL Gambar Katalog" data-slot="${slotId}">
                    <div style="margin-top: 8px;">
                        <img class="multi-img-preview" src="" style="max-height: 100px; border-radius: 8px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                    <input type="text" class="admin-form-control multi-caption-input" placeholder="Keterangan produk / varian..." data-slot="${slotId}" style="margin-top: 8px;">
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', slotHtml);

        const slotEl = document.getElementById(slotId);
        const fileInput = slotEl.querySelector('.multi-file-input');
        const urlInput = slotEl.querySelector('.multi-url-input');
        const previewImg = slotEl.querySelector('.multi-img-preview');

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            previewImg.src = URL.createObjectURL(file);
            previewImg.style.display = 'block';

            try {
                const uploadedUrl = await window.dusunService.uploadImageFile(file);
                urlInput.value = uploadedUrl;
                previewImg.src = uploadedUrl;
                showAdminToast('Foto katalog berhasil diunggah!');
            } catch (err) {
                alert('Gagal unggah: ' + (err.message || 'Error'));
            }
        });

        urlInput.addEventListener('input', () => {
            if (urlInput.value.trim()) {
                previewImg.src = urlInput.value.trim();
                previewImg.style.display = 'block';
            } else {
                previewImg.style.display = 'none';
            }
        });
    };

    window.editUmkmModal = async function (id, encodedObj) {
        const u = JSON.parse(decodeURIComponent(encodedObj));
        openAddUmkmAdminModal();
        document.getElementById('adminModalTitle').textContent = 'Edit Data UMKM';
        document.getElementById('muId').value = u.id;
        document.getElementById('muTitle').value = u.title;
        document.getElementById('muOwner').value = u.owner;
        document.getElementById('muCategory').value = u.category;
        document.getElementById('muPrice').value = u.price_str;
        document.getElementById('muWa').value = u.whatsapp;
        document.getElementById('muImg').value = u.image_url || '';
        if (u.image_url && document.getElementById('muImgPreview')) {
            document.getElementById('muImgPreview').src = u.image_url;
            document.getElementById('muImgPreview').style.display = 'block';
        }
        document.getElementById('muDesc').value = u.description;

        // Load existing catalog images
        try {
            const existingImages = await window.dusunService.getUmkmImages(u.id);
            if (existingImages && existingImages.length > 0) {
                existingImages.forEach(img => {
                    umkmMultiUploadCounter++;
                    const container = document.getElementById('muMultiUploadList');
                    const slotId = `umkm-upload-${umkmMultiUploadCounter}`;
                    const slotHtml = `
                        <div class="multi-upload-item" id="${slotId}" data-existing-id="${img.id}">
                            <div class="multi-upload-item-header">
                                <span class="multi-upload-label"><i class="fa-solid fa-image"></i> Katalog Existing #${container.children.length + 1}</span>
                                <button type="button" class="btn-remove-upload" onclick="removeMultiUploadSlot('${slotId}')">
                                    <i class="fa-solid fa-trash"></i> Hapus
                                </button>
                            </div>
                            <div class="multi-upload-item-body">
                                <input type="file" accept="image/*" class="admin-form-control multi-file-input" data-slot="${slotId}" style="padding: 8px; margin-bottom: 8px;">
                                <input type="text" class="admin-form-control multi-url-input" placeholder="URL Gambar" data-slot="${slotId}" value="${img.image_url}">
                                <div style="margin-top: 8px;">
                                    <img class="multi-img-preview" src="${img.image_url}" style="max-height: 100px; border-radius: 8px; display: block; border: 1px solid var(--admin-border);">
                                </div>
                                <input type="text" class="admin-form-control multi-caption-input" placeholder="Keterangan produk / varian..." data-slot="${slotId}" style="margin-top: 8px;" value="${img.caption || ''}">
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', slotHtml);

                    const slotEl = document.getElementById(slotId);
                    const fileInput = slotEl.querySelector('.multi-file-input');
                    const urlInput = slotEl.querySelector('.multi-url-input');
                    const previewImg = slotEl.querySelector('.multi-img-preview');

                    fileInput.addEventListener('change', async (ev) => {
                        const file = ev.target.files[0];
                        if (!file) return;
                        previewImg.src = URL.createObjectURL(file);
                        previewImg.style.display = 'block';
                        try {
                            const uploadedUrl = await window.dusunService.uploadImageFile(file);
                            urlInput.value = uploadedUrl;
                            previewImg.src = uploadedUrl;
                            showAdminToast('Foto katalog berhasil diunggah!');
                        } catch (err) {
                            alert('Gagal unggah: ' + (err.message || 'Error'));
                        }
                    });

                    urlInput.addEventListener('input', () => {
                        if (urlInput.value.trim()) {
                            previewImg.src = urlInput.value.trim();
                            previewImg.style.display = 'block';
                        } else {
                            previewImg.style.display = 'none';
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Error loading existing UMKM images:', err);
        }
    };

    window.deleteUmkmItem = async function (id) {
        if (!confirm('Hapus UMKM ini beserta semua foto katalog?')) return;
        await window.dusunService.deleteUMKM(id);
        showAdminToast('UMKM dihapus');
        loadUmkmTab();
    };

    // F. TAB KONTAK
    async function loadKontakTab() {
        try {
            const k = await window.dusunService.getKontak();
            if (k) {
                if (document.getElementById('kontakAddress')) document.getElementById('kontakAddress').value = k.address || '';
                if (document.getElementById('kontakPhone')) document.getElementById('kontakPhone').value = k.phone || '';
                if (document.getElementById('kontakEmail')) document.getElementById('kontakEmail').value = k.email || '';
                if (document.getElementById('kontakWhatsapp')) document.getElementById('kontakWhatsapp').value = k.whatsapp || '';
                if (document.getElementById('kontakGmapsEmbed')) document.getElementById('kontakGmapsEmbed').value = k.gmaps_embed || '';
                if (document.getElementById('kontakInstagram')) document.getElementById('kontakInstagram').value = k.instagram || '';
                if (document.getElementById('kontakFacebook')) document.getElementById('kontakFacebook').value = k.facebook || '';
                if (document.getElementById('kontakYoutube')) document.getElementById('kontakYoutube').value = k.youtube || '';
            }
        } catch (err) {
            console.error('Error loading Kontak tab:', err);
        }
    }

    const formKontak = document.getElementById('formKontak');
    if (formKontak) {
        formKontak.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                address: document.getElementById('kontakAddress').value,
                phone: document.getElementById('kontakPhone').value,
                email: document.getElementById('kontakEmail').value,
                whatsapp: document.getElementById('kontakWhatsapp').value,
                gmaps_embed: document.getElementById('kontakGmapsEmbed').value,
                instagram: document.getElementById('kontakInstagram').value,
                facebook: document.getElementById('kontakFacebook').value,
                youtube: document.getElementById('kontakYoutube').value
            };

            try {
                await window.dusunService.updateKontak(payload);
                showAdminToast('Informasi Kontak berhasil diperbarui di Supabase!');
            } catch (err) {
                alert('Gagal menyimpan kontak: ' + err.message);
            }
        });
    }

    // Initial Session & Data Load
    checkSession();
});

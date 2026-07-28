/**
 * ============================================================================
 * ADMIN DASHBOARD SCRIPT - PORTAL DUSUN JAMBON
 * ============================================================================
 * Handles tab navigation, CRUD operations, image uploads to Supabase Storage,
 * live preview, table rendering, search filters, and validations.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
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
    // 2. File Upload Helper (Supabase Storage Upload + Live Preview)
    // ----------------------------------------------------------------------
    async function bindImageUpload(fileInputId, textInputId, previewImgId) {
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

                const formData = new FormData();
                formData.append('file', file);

                try {
                    let uploadEndpoint = 'api/upload.php';
                    let res = await fetch(uploadEndpoint, {
                        method: 'POST',
                        body: formData
                    });
                    if (!res.ok) {
                        res = await fetch('../api/upload.php', {
                            method: 'POST',
                            body: formData
                        });
                    }
                    const json = await res.json();

                    if (json.status === 'success' && json.url) {
                        if (textInput) textInput.value = json.url;
                        if (previewImg) {
                            previewImg.src = json.url;
                            previewImg.style.display = 'block';
                        }
                        showAdminToast('Gambar berhasil diunggah ke Supabase Storage!');
                    } else {
                        alert('Gagal mengunggah gambar: ' + (json.message || 'Error server'));
                    }
                } catch (err) {
                    alert('Terjadi kesalahan jaringan saat mengunggah gambar.');
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

    // Helper for API fetch with fallback
    async function fetchApi(endpoint, options = {}) {
        try {
            let res = await fetch(endpoint, options);
            if (!res.ok && !options.body) {
                res = await fetch('../' + endpoint, options);
            }
            return await res.json();
        } catch (e) {
            try {
                const res = await fetch('../' + endpoint, options);
                return await res.json();
            } catch (err) {
                console.error('Fetch API error for ' + endpoint, err);
                return null;
            }
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
    // 5. Data Loaders & Form Handlers
    // ----------------------------------------------------------------------

    // A. TAB BERANDA
    async function loadBerandaTab() {
        try {
            const json = await fetchApi('api/dashboard.php');
            if (json && json.status === 'success' && json.data && json.data.beranda) {
                const b = json.data.beranda;
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
                const json = await fetchApi('api/dashboard.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showAdminToast(json.message || 'Halaman Beranda berhasil diperbarui!');
            } catch (err) {
                alert('Gagal menyimpan beranda: ' + err.message);
            }
        });
    }

    // B. TAB PROFIL & GALERI
    async function loadProfilTab() {
        try {
            const json = await fetchApi('api/profil.php');
            if (json && json.status === 'success' && json.data) {
                const p = json.data.profil;
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
                renderGalleryTable(json.data.gallery || []);
            }
        } catch (err) {
            console.error('Error loading Profil tab:', err);
        }
    }

    const formProfil = document.getElementById('formProfil');
    if (formProfil) {
        formProfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                type: 'profil',
                sejarah_p1: document.getElementById('profilSejarah1').value,
                sejarah_p2: document.getElementById('profilSejarah2').value,
                visi_text: document.getElementById('profilVisi').value,
                misi_list: document.getElementById('profilMisi').value
            };

            try {
                const json = await fetchApi('api/profil.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showAdminToast(json.message || 'Data Profil berhasil diperbarui!');
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
                type: id > 0 ? 'gallery_edit' : 'gallery_add',
                id: id,
                title: document.getElementById('mgTitle').value,
                subtitle: document.getElementById('mgSubtitle').value,
                tag: document.getElementById('mgTag').value,
                display_type: document.getElementById('mgType').value,
                image_url: document.getElementById('mgImg').value
            };

            const json = await fetchApi('api/profil.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAdminToast(json.message || 'Foto galeri berhasil disimpan!');
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
        const json = await fetchApi(`api/profil.php?id=${id}`, { method: 'DELETE' });
        showAdminToast(json.message || 'Foto galeri dihapus');
        loadProfilTab();
    };

    // C. TAB BERITA
    async function loadBeritaTab() {
        try {
            const json = await fetchApi('api/berita.php?limit=100');
            if (json && json.status === 'success' && Array.isArray(json.data)) {
                renderBeritaTable(json.data);
            }
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
                <td><small style="color:var(--admin-text-muted);">${item.excerpt.substring(0, 45)}...</small></td>
                <td>
                    <button class="btn-action-edit" onclick="editBeritaModal(${item.id})"><i class="fa-solid fa-pen"></i></button>
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

            const json = await fetchApi('api/berita.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAdminToast(json.message || 'Berita berhasil disimpan!');
            closeAdminModal();
            loadBeritaTab();
        });
    };

    window.editBeritaModal = async function (id) {
        const json = await fetchApi(`api/berita.php?id=${id}`);
        if (json && json.status === 'success' && json.data) {
            openAddBeritaModal();
            document.getElementById('adminModalTitle').textContent = 'Edit Data Berita';
            const b = json.data;
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
        }
    };

    window.deleteBeritaItem = async function (id) {
        if (!confirm('Hapus berita ini?')) return;
        const json = await fetchApi(`api/berita.php?id=${id}`, { method: 'DELETE' });
        showAdminToast(json.message || 'Berita dihapus');
        loadBeritaTab();
    };

    // D. TAB PETA & TITIK LOKASI
    async function loadPetaTab() {
        try {
            const json = await fetchApi('api/administrasi.php');
            if (json && json.status === 'success' && json.data) {
                const p = json.data.peta;
                if (p) {
                    if (document.getElementById('petaTitle')) document.getElementById('petaTitle').value = p.map_title || '';
                    if (document.getElementById('petaDesc')) document.getElementById('petaDesc').value = p.map_desc || '';
                    if (document.getElementById('petaImgUrl')) document.getElementById('petaImgUrl').value = p.map_image_url || '';
                    if (p.map_image_url && document.getElementById('petaImgPreview')) {
                        document.getElementById('petaImgPreview').src = p.map_image_url;
                        document.getElementById('petaImgPreview').style.display = 'block';
                    }
                }
                renderLokasiTable(json.data.lokasi || []);
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
                type: 'peta',
                map_title: document.getElementById('petaTitle').value,
                map_desc: document.getElementById('petaDesc').value,
                map_image_url: document.getElementById('petaImgUrl').value
            };

            try {
                const json = await fetchApi('api/administrasi.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showAdminToast(json.message || 'Peta Administrasi berhasil diperbarui!');
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
                <td><img src="${item.image_url || 'assets/img/Masjid_Al-Falah.jpg'}" style="width: 45px; height: 35px; object-fit: cover; border-radius: 6px;"></td>
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
                type: id > 0 ? 'lokasi_edit' : 'lokasi_add',
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

            const json = await fetchApi('api/administrasi.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAdminToast(json.message || 'Titik lokasi berhasil disimpan!');
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
        const json = await fetchApi(`api/administrasi.php?id=${id}`, { method: 'DELETE' });
        showAdminToast(json.message || 'Titik lokasi dihapus');
        loadPetaTab();
    };

    // E. TAB UMKM
    async function loadUmkmTab() {
        try {
            const json = await fetchApi('api/umkm.php?limit=100');
            if (json && json.status === 'success' && Array.isArray(json.data)) {
                renderUmkmTable(json.data);
            }
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
                <td><img src="${item.image_url || 'assets/img/Masjid_Al-Falah.jpg'}" style="width: 45px; height: 35px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${item.title}</strong></td>
                <td>${item.owner}</td>
                <td><span class="admin-badge blue">${item.category}</span></td>
                <td><strong style="color:var(--admin-accent-green);">${item.price_str}</strong></td>
                <td><code>${item.whatsapp}</code></td>
                <td>
                    <button class="btn-action-edit" onclick="editUmkmModal(${item.id})"><i class="fa-solid fa-pen"></i></button>
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
                    <label><i class="fa-solid fa-upload"></i> Upload Foto Produk UMKM (Supabase Storage)</label>
                    <input type="file" id="muImgFile" accept="image/*" class="admin-form-control" style="padding: 8px; margin-bottom: 8px;">
                    <input type="text" id="muImg" class="admin-form-control" placeholder="URL Foto UMKM">
                    <div style="margin-top: 10px;">
                        <img id="muImgPreview" src="" style="max-height: 120px; border-radius: 10px; display: none; border: 1px solid var(--admin-border);">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Deskripsi Produk UMKM</label>
                    <textarea id="muDesc" class="admin-form-control" rows="3" required></textarea>
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

            const json = await fetchApi('api/umkm.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAdminToast(json.message || 'UMKM berhasil disimpan!');
            closeAdminModal();
            loadUmkmTab();
        });
    };

    window.editUmkmModal = async function (id) {
        const json = await fetchApi(`api/umkm.php?id=${id}`);
        if (json && json.status === 'success' && json.data) {
            openAddUmkmAdminModal();
            document.getElementById('adminModalTitle').textContent = 'Edit Data UMKM';
            const u = json.data;
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
        }
    };

    window.deleteUmkmItem = async function (id) {
        if (!confirm('Hapus UMKM ini?')) return;
        const json = await fetchApi(`api/umkm.php?id=${id}`, { method: 'DELETE' });
        showAdminToast(json.message || 'UMKM dihapus');
        loadUmkmTab();
    };

    // F. TAB KONTAK
    async function loadKontakTab() {
        try {
            const json = await fetchApi('api/kontak.php');
            if (json && json.status === 'success' && json.data) {
                const k = json.data;
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
                const json = await fetchApi('api/kontak.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showAdminToast(json.message || 'Informasi Kontak berhasil diperbarui!');
            } catch (err) {
                alert('Gagal menyimpan kontak: ' + err.message);
            }
        });
    }

    // Initial Load
    loadBerandaTab();
    loadProfilTab();
    loadBeritaTab();
    loadPetaTab();
    loadUmkmTab();
    loadKontakTab();
});

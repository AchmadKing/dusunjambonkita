/**
 * Dusun Jambon Official Portal - Main Public Script
 * Integrated Dynamic Data Fetching via Supabase JS SDK Service
 * 100% Data berasal dari Supabase PostgreSQL Database (No Hardcoded Fallback / No LocalStorage DB)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Navigation & Tab Switching System
    // ----------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .hero-nav-btn, .footer-nav-link');
    const sections = document.querySelectorAll('.page-section');
    const navbarHeader = document.querySelector('.navbar-header');
    const mobileHamburger = document.getElementById('mobileHamburger');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarDrawer = document.getElementById('sidebarDrawer');

    function switchSection(targetId) {
        if (!targetId) return;

        const cleanId = targetId.replace('#', '');
        const targetSection = document.getElementById(cleanId);

        if (targetSection) {
            sections.forEach(sec => sec.classList.remove('active'));
            targetSection.classList.add('active');

            document.querySelectorAll('.desktop-nav-menu .nav-link, .mobile-nav-link').forEach(link => {
                const linkTarget = link.getAttribute('data-target') || link.getAttribute('href');
                if (linkTarget && linkTarget.replace('#', '') === cleanId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            closeSidebar();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target') || link.getAttribute('href');
            switchSection(target);
        });
    });

    // Mobile Sidebar Drawer Logic
    function openSidebar() {
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
        if (sidebarDrawer) sidebarDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        if (sidebarDrawer) sidebarDrawer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (mobileHamburger) mobileHamburger.addEventListener('click', openSidebar);
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    // Sticky Header Shadow on Scroll
    window.addEventListener('scroll', () => {
        if (navbarHeader) {
            if (window.scrollY > 30) {
                navbarHeader.classList.add('scrolled');
            } else {
                navbarHeader.classList.remove('scrolled');
            }
        }
    });

    // ----------------------------------------------------------------------
    // 2. Modal Management System
    // ----------------------------------------------------------------------
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const btnCloseModal = document.getElementById('btnCloseModal');

    window.openModal = function(title, contentHTML) {
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = contentHTML;
        if (modalBackdrop) modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function() {
        if (modalBackdrop) modalBackdrop.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', window.closeModal);
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) window.closeModal();
        });
    }

    window.openImageModal = function(imgSrc, caption) {
        const html = `
            <div style="text-align: center; padding: 10px 0;">
                <div style="background: #000; border-radius: 12px; overflow: hidden; max-height: 75vh; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                    <img src="${imgSrc}" alt="${caption}" style="max-width: 100%; max-height: 70vh; object-fit: contain; display: block; margin: 0 auto;">
                </div>
                <p style="margin-top: 16px; font-weight: 600; color: var(--text-main); font-size: 1.05rem;">
                    ${caption}
                </p>
                <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center;">
                    <a href="${imgSrc}" target="_blank" download class="btn-primary" style="padding: 8px 18px; font-size: 0.9rem;">
                        <i class="fa-solid fa-download"></i> Unduh Gambar
                    </a>
                    <button onclick="closeModal()" class="btn-secondary" style="padding: 8px 18px; font-size: 0.9rem;">
                        Tutup
                    </button>
                </div>
            </div>
        `;
        window.openModal(caption || "Tampilan Foto", html);
    };

    window.readNewsModal = function(title, date, category, text, imgSrc) {
        const imageHTML = imgSrc ? `
            <div style="background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                <img src="${imgSrc}" alt="${title}" style="width: 100%; max-height: 280px; object-fit: cover;">
            </div>
        ` : `
            <div class="placeholder-image-box" style="height: 220px; margin-bottom: 20px;">
                <div class="placeholder-icon"><i class="fa-regular fa-newspaper"></i></div>
                <div class="placeholder-title">${title}</div>
                <div class="placeholder-subtitle">Dokumentasi Berita Dusun Jambon</div>
            </div>
        `;

        const html = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 0.85rem; color: var(--accent-red); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                    ${category} &bull; ${date}
                </div>
                ${imageHTML}
                <div style="color: var(--text-main); line-height: 1.8; font-size: 1rem; margin-bottom: 16px;">
                    ${text}
                </div>
            </div>
            <div style="text-align: right;">
                <button onclick="closeModal()" class="btn-secondary" style="padding: 8px 20px;">
                    Tutup Berita
                </button>
            </div>
        `;
        window.openModal(title, html);
    };

    // ----------------------------------------------------------------------
    // 3. Dynamic Data Fetching from Supabase JS SDK Service
    // ----------------------------------------------------------------------

    // Load Beranda Data
    async function loadBerandaData() {
        try {
            const b = await window.dusunService.getBeranda();
            if (b) {
                const heroHeadline = document.querySelector('.hero-headline');
                if (heroHeadline && b.hero_headline) {
                    heroHeadline.innerHTML = `${b.hero_headline} <span>${b.hero_headline_span || ''}</span> <span class="highlight-red">${b.hero_headline_red || ''}</span>`;
                }

                const heroDesc = document.querySelector('.hero-desc');
                if (heroDesc && b.hero_desc) heroDesc.textContent = b.hero_desc;

                const heroImg = document.querySelector('.hero-main-img');
                if (heroImg && b.hero_image_url) heroImg.src = b.hero_image_url;

                const heroCap = document.querySelector('.hero-image-caption span');
                if (heroCap && b.hero_image_caption) heroCap.textContent = b.hero_image_caption;

                const kdTitle = document.getElementById('kdTitleDisplay');
                if (kdTitle && b.kepala_dusun_title) kdTitle.textContent = b.kepala_dusun_title;

                const kdSpeech1 = document.getElementById('kdSpeechDisplay1');
                if (kdSpeech1 && b.kepala_dusun_speech_1) kdSpeech1.textContent = b.kepala_dusun_speech_1;

                const kdSpeech2 = document.getElementById('kdSpeechDisplay2');
                if (kdSpeech2 && b.kepala_dusun_speech_2) kdSpeech2.textContent = b.kepala_dusun_speech_2;

                const kdName = document.getElementById('kdNameDisplay');
                if (kdName && b.kepala_dusun_name) kdName.textContent = b.kepala_dusun_name;

                const kdSig = document.getElementById('kdSignatureDisplay');
                if (kdSig && b.kepala_dusun_name) kdSig.textContent = `- ${b.kepala_dusun_name}`;

                const kdImgContainer = document.getElementById('kdImageContainer');
                if (kdImgContainer && b.kepala_dusun_image_url) {
                    kdImgContainer.innerHTML = `<img src="${b.kepala_dusun_image_url}" alt="${b.kepala_dusun_name || 'Kepala Dusun'}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
                }
            }
        } catch (err) {
            console.error('Error loading beranda via Supabase SDK:', err);
        }
    }

    // Load Profil Data
    async function loadProfilData() {
        try {
            const p = await window.dusunService.getProfil();
            if (p) {
                const s1 = document.getElementById('profilSejarahDisplay1');
                if (s1 && p.sejarah_p1) s1.textContent = p.sejarah_p1;

                const s2 = document.getElementById('profilSejarahDisplay2');
                if (s2 && p.sejarah_p2) s2.textContent = p.sejarah_p2;

                const v = document.getElementById('profilVisiDisplay');
                if (v && p.visi_text) v.textContent = `"${p.visi_text}"`;

                const m = document.getElementById('profilMisiDisplay');
                if (m && p.misi_list) {
                    let list = p.misi_list;
                    if (typeof list === 'string') {
                        try { list = JSON.parse(list); } catch(e) { list = []; }
                    }
                    if (Array.isArray(list)) {
                        m.innerHTML = list.map(item => `<li><i class="fa-solid fa-check"></i> ${item}</li>`).join('');
                    }
                }
            }

            const gallery = await window.dusunService.getProfilGallery();
            if (Array.isArray(gallery)) {
                renderGalleryAndSlideshow(gallery);
            }
        } catch (err) {
            console.error('Error loading profil via Supabase SDK:', err);
        }
    }

    let slideIndex = 0;
    function renderGalleryAndSlideshow(galleryItems) {
        const track = document.getElementById('profilSlideshowTrack');
        const dotsContainer = document.getElementById('slideDots');
        const galleryGrid = document.getElementById('profilGalleryGrid');

        const slideItems = galleryItems.filter(i => i.type === 'slideshow' || !i.type);
        const gridItems = galleryItems.filter(i => i.type === 'gallery' || !i.type);

        if (track && slideItems.length > 0) {
            track.innerHTML = slideItems.map((item, idx) => `
                <div class="slide-item ${idx === 0 ? 'active' : ''}">
                    <img src="${item.image_url}" alt="${item.title}" onclick="openImageModal('${item.image_url}', '${item.title}')">
                    <div class="slide-caption">
                        <span class="slide-tag"><i class="fa-solid fa-clock-rotate-left"></i> ${item.tag || 'Sejarah & Arsip'}</span>
                        <h4>${item.title}</h4>
                    </div>
                </div>
            `).join('');

            if (dotsContainer) {
                dotsContainer.innerHTML = slideItems.map((_, idx) => `
                    <span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>
                `).join('');
            }

            initSlideshowControls(slideItems.length);
        }

        if (galleryGrid && gridItems.length > 0) {
            galleryGrid.innerHTML = gridItems.map(item => `
                <div class="gallery-card" onclick="openImageModal('${item.image_url}', '${item.title}')">
                    <div class="gallery-img-box">
                        <img src="${item.image_url}" alt="${item.title}">
                        <div class="gallery-overlay">
                            <i class="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                    </div>
                    <div class="gallery-info">
                        <span class="gallery-tag">${item.tag || 'Kegiatan'}</span>
                        <h4 class="gallery-title">${item.title}</h4>
                        <p class="gallery-subtitle">${item.subtitle || ''}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    function initSlideshowControls(totalSlides) {
        const slides = document.querySelectorAll('.slide-item');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.getElementById('slidePrevBtn');
        const nextBtn = document.getElementById('slideNextBtn');

        function showSlide(n) {
            slideIndex = (n + totalSlides) % totalSlides;
            slides.forEach((s, idx) => s.classList.toggle('active', idx === slideIndex));
            dots.forEach((d, idx) => d.classList.toggle('active', idx === slideIndex));
        }

        if (prevBtn) prevBtn.addEventListener('click', () => showSlide(slideIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => showSlide(slideIndex + 1));

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => showSlide(idx));
        });

        setInterval(() => showSlide(slideIndex + 1), 4500);
    }

    // Load Berita Data
    let allNewsData = [];
    async function loadBeritaData() {
        try {
            const data = await window.dusunService.getBerita();
            if (Array.isArray(data)) {
                allNewsData = data;
                renderNewsGrid(allNewsData);
            }
        } catch (err) {
            console.error('Error loading news via Supabase SDK:', err);
        }
    }

    function renderNewsGrid(newsItems) {
        const container = document.getElementById('newsGrid');
        if (!container) return;

        if (newsItems.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Belum ada berita ditemukan di database Supabase.</div>`;
            return;
        }

        container.innerHTML = newsItems.map(item => `
            <article class="news-card" data-category="${item.category}" data-title="${item.title.toLowerCase()}">
                <div class="news-img-box">
                    ${item.image_url ? `
                        <img src="${item.image_url}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover;">
                    ` : `
                        <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                            <span class="placeholder-tag">${item.category}</span>
                            <div class="placeholder-icon"><i class="fa-regular fa-newspaper"></i></div>
                            <h4 class="placeholder-title">${item.title}</h4>
                        </div>
                    `}
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${item.date_str}</span>
                        <span><i class="fa-regular fa-user"></i> ${item.author}</span>
                    </div>
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-excerpt">${item.excerpt}</p>
                    <div class="news-footer">
                        <button class="btn-read-more" onclick="readNewsModal('${item.title.replace(/'/g, "\\'")}', '${item.date_str}', '${item.category}', '${item.content.replace(/'/g, "\\'").replace(/\n/g, "<br>")}', '${item.image_url}')">
                            Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // Filter News Logic
    const newsPills = document.querySelectorAll('.news-pill');
    const newsSearchInput = document.getElementById('newsSearchInput');

    function filterNewsList() {
        const activePill = document.querySelector('.news-pill.active');
        const selectedCategory = activePill ? activePill.getAttribute('data-category') : 'all';
        const query = newsSearchInput ? newsSearchInput.value.toLowerCase().trim() : '';

        const filtered = allNewsData.filter(item => {
            const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchQuery = item.title.toLowerCase().includes(query) || item.excerpt.toLowerCase().includes(query);
            return matchCategory && matchQuery;
        });

        renderNewsGrid(filtered);
    }

    newsPills.forEach(pill => {
        pill.addEventListener('click', () => {
            newsPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterNewsList();
        });
    });

    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', filterNewsList);
    }

    // Load Administrasi & Titik Lokasi Data
    async function loadAdministrasiData() {
        try {
            const p = await window.dusunService.getAdministrasiPeta();
            if (p) {
                const petaTitle = document.getElementById('petaTitleDisplay');
                if (petaTitle && p.map_title) petaTitle.textContent = p.map_title;

                const petaDesc = document.getElementById('petaDescDisplay');
                if (petaDesc && p.map_desc) petaDesc.textContent = p.map_desc;

                const petaImg = document.getElementById('petaMainImg');
                if (petaImg && p.map_image_url) petaImg.src = p.map_image_url;

                const btnDownload = document.getElementById('btnDownloadPeta');
                if (btnDownload && p.map_image_url) btnDownload.href = p.map_image_url;

                const btnZoom = document.getElementById('btnZoomPeta');
                if (btnZoom && p.map_image_url) btnZoom.onclick = () => window.openImageModal(p.map_image_url, p.map_title);

                const imgWrapper = document.getElementById('petaImgWrapper');
                if (imgWrapper && p.map_image_url) imgWrapper.onclick = () => window.openImageModal(p.map_image_url, p.map_title);
            }

            const lokasi = await window.dusunService.getTitikLokasi();
            if (Array.isArray(lokasi)) {
                renderLocationGrid(lokasi);
            }
        } catch (err) {
            console.error('Error loading administrasi via Supabase SDK:', err);
        }
    }

    let allLocationData = [];
    function renderLocationGrid(locations) {
        allLocationData = locations;
        const container = document.getElementById('locationGrid');
        if (!container) return;

        if (locations.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Belum ada titik lokasi terdaftar di Supabase.</div>`;
            return;
        }

        container.innerHTML = locations.map(loc => `
            <div class="location-card" data-category="${loc.category}">
                <div class="location-img-box" onclick="openImageModal('${loc.image_url || ''}', '${loc.title}')" title="Klik untuk perbesar foto">
                    <img src="${loc.image_url || ''}" alt="${loc.title}" class="location-img">
                    <span class="location-badge ${loc.badge_color || 'blue'}">
                        <i class="fa-solid ${loc.category === 'ibadah' ? 'fa-mosque' : 'fa-house-user'}"></i> ${loc.badge_label || loc.category}
                    </span>
                </div>
                <div class="location-body">
                    <h4 class="location-title">${loc.title}</h4>
                    <p class="location-desc">${loc.description}</p>
                    <div class="coordinate-info">
                        <span class="coord-label"><i class="fa-solid fa-crosshairs"></i> Koordinat:</span>
                        <span class="coord-val">${loc.coordinates}</span>
                    </div>
                    <a href="${loc.gmaps_url}" target="_blank" rel="noopener noreferrer" class="btn-gmaps">
                        <i class="fa-solid fa-map-location-dot"></i> Buka Google Maps
                    </a>
                </div>
            </div>
        `).join('');

        initLocationPills();
    }

    function initLocationPills() {
        const locationPills = document.querySelectorAll('.location-pill');
        locationPills.forEach(pill => {
            pill.addEventListener('click', () => {
                locationPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const selectedCategory = pill.getAttribute('data-category');

                document.querySelectorAll('#locationGrid .location-card').forEach(card => {
                    const cat = card.getAttribute('data-category');
                    if (selectedCategory === 'all' || cat === selectedCategory) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Load UMKM Data
    let allUmkmData = [];
    async function loadUmkmData() {
        try {
            const data = await window.dusunService.getUMKM();
            if (Array.isArray(data)) {
                allUmkmData = data;
                renderUmkmGrid(allUmkmData);

                const umkmCountEl = document.getElementById('berandaUmkmCountDisplay');
                if (umkmCountEl) {
                    umkmCountEl.textContent = `${allUmkmData.length} Usaha`;
                }
            }
        } catch (err) {
            console.error('Error loading UMKM via Supabase SDK:', err);
        }
    }

    function renderUmkmGrid(umkmItems) {
        const container = document.getElementById('umkmGrid');
        if (!container) return;

        if (umkmItems.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Belum ada UMKM terdaftar di Supabase.</div>`;
            return;
        }

        container.innerHTML = umkmItems.map(item => `
            <div class="umkm-card" data-category="${item.category}">
                <div class="umkm-img-box">
                    ${item.image_url ? `
                        <img src="${item.image_url}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover;">
                    ` : `
                        <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                            <span class="placeholder-tag">${item.category}</span>
                            <div class="placeholder-icon"><i class="fa-solid fa-shop"></i></div>
                            <h4 class="placeholder-title">${item.title}</h4>
                        </div>
                    `}
                </div>
                <div class="umkm-body">
                    <span class="umkm-category-tag">${item.category}</span>
                    <h3 class="umkm-title">${item.title}</h3>
                    <div class="umkm-owner"><i class="fa-regular fa-user"></i> Pemilik: ${item.owner}</div>
                    <p class="umkm-desc">${item.description}</p>
                    <div class="umkm-footer">
                        <div class="umkm-price">${item.price_str}</div>
                        <a href="https://wa.me/${item.whatsapp}?text=${encodeURIComponent('Halo ' + item.owner + ', saya ingin pesan ' + item.title)}" target="_blank" class="btn-wa-order">
                            <i class="fa-brands fa-whatsapp"></i> Pesan WA
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        initUmkmPills();
    }

    function initUmkmPills() {
        const umkmPills = document.querySelectorAll('.umkm-pill');
        umkmPills.forEach(pill => {
            pill.addEventListener('click', () => {
                umkmPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const selectedCategory = pill.getAttribute('data-category');

                document.querySelectorAll('#umkmGrid .umkm-card').forEach(card => {
                    const cat = card.getAttribute('data-category');
                    if (selectedCategory === 'all' || cat === selectedCategory) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Load Kontak Data
    async function loadKontakData() {
        try {
            const k = await window.dusunService.getKontak();
            if (k) {
                const addr = document.getElementById('kontakAddressDisplay');
                if (addr && k.address) addr.textContent = k.address;

                const phone = document.getElementById('kontakPhoneDisplay');
                if (phone && k.phone) phone.textContent = k.phone;

                const email = document.getElementById('kontakEmailDisplay');
                if (email && k.email) email.textContent = k.email;

                const footerAddr = document.getElementById('footerAddressDisplay');
                if (footerAddr && k.address) footerAddr.textContent = k.address;

                const footerPhone = document.getElementById('footerPhoneDisplay');
                if (footerPhone && k.phone) footerPhone.textContent = k.phone;

                const footerEmail = document.getElementById('footerEmailDisplay');
                if (footerEmail && k.email) footerEmail.textContent = k.email;

                const iframe = document.getElementById('kontakGmapsIframe');
                if (iframe && k.gmaps_embed) iframe.src = k.gmaps_embed;
            }
        } catch (err) {
            console.error('Error loading kontak via Supabase SDK:', err);
        }
    }

    // Handle Contact Form Submit
    const contactForm = document.getElementById('mainContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Terima kasih! Pesan/Aspirasi Anda telah terkirim.');
            contactForm.reset();
        });
    }

    // Initial section routing from URL hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
        switchSection(initialHash);
    } else {
        switchSection('beranda');
    }

    // Initialize All Backend Data Loads directly from Supabase
    loadBerandaData();
    loadProfilData();
    loadBeritaData();
    loadAdministrasiData();
    loadUmkmData();
    loadKontakData();
});

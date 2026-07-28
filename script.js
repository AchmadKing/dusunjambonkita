/**
 * Dusun Jambon Official Portal - JavaScript Interactive Logic
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

    // Function to switch active section/page
    function switchSection(targetId) {
        if (!targetId) return;

        // Normalize target ID (remove hash if present)
        const cleanId = targetId.replace('#', '');
        const targetSection = document.getElementById(cleanId);

        if (targetSection) {
            // Hide all sections
            sections.forEach(sec => sec.classList.remove('active'));
            // Show target section
            targetSection.classList.add('active');

            // Update active state in desktop & mobile nav
            document.querySelectorAll('.desktop-nav-menu .nav-link, .mobile-nav-link').forEach(link => {
                const linkTarget = link.getAttribute('data-target') || link.getAttribute('href');
                if (linkTarget && linkTarget.replace('#', '') === cleanId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Scroll to top of window smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Close mobile sidebar if open
            closeSidebar();
        }
    }

    // Attach click listeners to all navigation triggers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target') || link.getAttribute('href');
            switchSection(target);
        });
    });

    // ----------------------------------------------------------------------
    // 2. Mobile Sidebar Drawer Logic
    // ----------------------------------------------------------------------
    function openSidebar() {
        sidebarBackdrop.classList.add('active');
        sidebarDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebarBackdrop.classList.remove('active');
        sidebarDrawer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (mobileHamburger) {
        mobileHamburger.addEventListener('click', openSidebar);
    }
    if (btnCloseSidebar) {
        btnCloseSidebar.addEventListener('click', closeSidebar);
    }
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    // Sticky Header Shadow on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbarHeader.classList.add('scrolled');
        } else {
            navbarHeader.classList.remove('scrolled');
        }
    });

    // ----------------------------------------------------------------------
    // 3. News Search & Category Filtering
    // ----------------------------------------------------------------------
    const newsSearchInput = document.getElementById('newsSearchInput');
    const newsPills = document.querySelectorAll('.news-pill');
    const newsCards = document.querySelectorAll('.news-card');

    let currentNewsCategory = 'all';
    let currentNewsQuery = '';

    function filterNews() {
        newsCards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchCategory = currentNewsCategory === 'all' || category === currentNewsCategory;
            const matchQuery = title.includes(currentNewsQuery);

            if (matchCategory && matchQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    newsPills.forEach(pill => {
        pill.addEventListener('click', () => {
            newsPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentNewsCategory = pill.getAttribute('data-category');
            filterNews();
        });
    });

    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', (e) => {
            currentNewsQuery = e.target.value.toLowerCase().trim();
            filterNews();
        });
    }

    // ----------------------------------------------------------------------
    // 4. UMKM Category Filtering
    // ----------------------------------------------------------------------
    const umkmPills = document.querySelectorAll('.umkm-pill');
    const umkmCards = document.querySelectorAll('.umkm-card');

    umkmPills.forEach(pill => {
        pill.addEventListener('click', () => {
            umkmPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const category = pill.getAttribute('data-category');

            umkmCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 5. Location Category Filtering
    // ----------------------------------------------------------------------
    const locationPills = document.querySelectorAll('.location-pill');
    const locationCards = document.querySelectorAll('.location-card');

    locationPills.forEach(pill => {
        pill.addEventListener('click', () => {
            locationPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const category = pill.getAttribute('data-category');

            locationCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 6. Modal Management System
    // ----------------------------------------------------------------------
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const btnCloseModal = document.getElementById('btnCloseModal');

    function openModal(title, contentHTML) {
        modalTitle.textContent = title;
        modalBody.innerHTML = contentHTML;
        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
    }



    // Trigger Image Modal (Lightbox View)
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
        openModal(caption || "Tampilan Foto", html);
    };

    // Trigger News Detail Modal
    window.readNewsModal = function(title, date, category, text) {
        const html = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                    ${category} &bull; ${date}
                </div>
                <div class="placeholder-image-box" style="height: 220px; margin-bottom: 20px;">
                    <div class="placeholder-icon"><i class="fa-regular fa-newspaper"></i></div>
                    <div class="placeholder-title">[Gambar] ${title}</div>
                    <div class="placeholder-subtitle">Dokumentasi Berita Dusun Jambon</div>
                </div>
                <p style="color: var(--text-muted); line-height: 1.8; font-size: 1rem; margin-bottom: 16px;">
                    ${text}
                </p>
                <p style="color: var(--text-muted); line-height: 1.8; font-size: 1rem;">
                    Kegiatan ini dihadiri oleh jajaran perangkat Dusun Jambon beserta seluruh warga masyarakat setempat dengan antusiasme yang tinggi. Diharapkan program ini memberikan manfaat nyata secara berkelanjutan.
                </p>
            </div>
            <button onclick="closeModal()" class="btn-secondary" style="width: 100%; justify-content: center;">
                Tutup Berita
            </button>
        `;
        openModal(title, html);
    };

    // Trigger Add UMKM Modal
    window.openAddUmkmModal = function() {
        const html = `
            <form id="addUmkmForm" onsubmit="handleFormSubmit(event, 'Pendaftaran UMKM Anda telah diterima untuk ditinjau!')">
                <div class="form-group">
                    <label class="form-label">Nama Usaha / UMKM</label>
                    <input type="text" class="form-input" placeholder="Contoh: Keripik Tempe Jambon Renyah" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Kategori Usaha</label>
                    <select class="form-select" required>
                        <option value="Kuliner">Kuliner / Makanan & Minuman</option>
                        <option value="Kerajinan">Kerajinan Tangan / Kriya</option>
                        <option value="Pertanian">Pertanian & Peternakan</option>
                        <option value="Jasa">Jasa & Produk Lainnya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Pemilik Usaha</label>
                    <input type="text" class="form-input" placeholder="Nama pemilik" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Nomor WhatsApp Pemesanan</label>
                    <input type="tel" class="form-input" placeholder="08xxxxxxxxxx" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Kisaran Harga Produk</label>
                    <input type="text" class="form-input" placeholder="Contoh: Rp 10.000 - Rp 50.000" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Deskripsi Singkat Usaha</label>
                    <textarea class="form-textarea" placeholder="Jelaskan keunggulan dan spesifikasi produk Anda..." required></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-plus-circle"></i> Daftarkan UMKM
                </button>
            </form>
        `;
        openModal("Form Daftarkan UMKM Dusun Jambon", html);
    };

    // Form Submit Helper with Toast Feedback
    window.handleFormSubmit = function(e, successMsg) {
        e.preventDefault();
        closeModal();
        showToast(successMsg);
    };

    // Contact Form Handler
    const mainContactForm = document.getElementById('mainContactForm');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            mainContactForm.reset();
            showToast('Pesan Anda berhasil dikirim ke Pengurus Dusun Jambon!');
        });
    }

    // ----------------------------------------------------------------------
    // 7. Profile Sejarah & Arsip Slideshow Logic
    // ----------------------------------------------------------------------
    const slideshowContainer = document.getElementById('profileSejarahSlideshow');
    if (slideshowContainer) {
        const slideItems = slideshowContainer.querySelectorAll('.slide-item');
        const dots = slideshowContainer.querySelectorAll('.slide-dots .dot');
        const prevBtn = document.getElementById('slidePrevBtn');
        const nextBtn = document.getElementById('slideNextBtn');
        let currentSlideIndex = 0;
        let slideTimer = null;

        function showSlide(index) {
            if (index < 0) index = slideItems.length - 1;
            if (index >= slideItems.length) index = 0;
            currentSlideIndex = index;

            slideItems.forEach((slide, i) => {
                if (i === currentSlideIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            dots.forEach((dot, i) => {
                if (i === currentSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            showSlide(currentSlideIndex + 1);
        }

        function prevSlide() {
            showSlide(currentSlideIndex - 1);
        }

        function startAutoSlide() {
            stopAutoSlide();
            slideTimer = setInterval(nextSlide, 4000);
        }

        function stopAutoSlide() {
            if (slideTimer) clearInterval(slideTimer);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoSlide();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetIdx = parseInt(e.target.getAttribute('data-index'), 10);
                if (!isNaN(targetIdx)) {
                    showSlide(targetIdx);
                    startAutoSlide();
                }
            });
        });

        slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
        slideshowContainer.addEventListener('mouseleave', startAutoSlide);

        // Start slideshow initially
        startAutoSlide();
    }

    // ----------------------------------------------------------------------
    // 8. Toast Notification Generator
    // ----------------------------------------------------------------------
    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = '0.35s ease';
            setTimeout(() => toast.remove(), 350);
        }, 4000);
    }

    // ----------------------------------------------------------------------
    // 9. Dynamic Data Syncing with Supabase Data Service
    // ----------------------------------------------------------------------
    async function loadDynamicContent() {
        if (!window.dusunService) return;

        try {
            // A. Render Beranda Content
            const beranda = await window.dusunService.getBeranda();
            if (beranda) {
                const heroHeadline = document.querySelector('.hero-headline');
                if (heroHeadline) {
                    heroHeadline.innerHTML = `${beranda.hero_headline} <span>${beranda.hero_headline_span}</span> <span class="highlight-red">${beranda.hero_headline_red}</span>`;
                }
                const heroDesc = document.querySelector('.hero-desc');
                if (heroDesc) heroDesc.textContent = beranda.hero_desc;

                const heroImg = document.querySelector('.hero-main-img');
                if (heroImg && beranda.hero_image_url) heroImg.src = beranda.hero_image_url;

                const heroCap = document.querySelector('.hero-image-caption span');
                if (heroCap && beranda.hero_image_caption) heroCap.textContent = beranda.hero_image_caption;

                const speechCard = document.querySelector('#beranda .history-card');
                if (speechCard) {
                    const h3 = speechCard.querySelector('h3');
                    if (h3 && beranda.kepala_dusun_title) h3.textContent = beranda.kepala_dusun_title;
                    const pList = speechCard.querySelectorAll('p');
                    if (pList.length >= 2) {
                        pList[0].textContent = beranda.kepala_dusun_speech_1;
                        pList[1].textContent = beranda.kepala_dusun_speech_2;
                    }
                    const nameDiv = speechCard.querySelector('div[style*="accent-red"]');
                    if (nameDiv && beranda.kepala_dusun_name) nameDiv.textContent = `- ${beranda.kepala_dusun_name}`;
                }
            }

            // B. Render Profil & Visi Misi
            const profil = await window.dusunService.getProfil();
            if (profil) {
                const sejarahCard = document.querySelector('#profil .history-card');
                if (sejarahCard) {
                    const pList = sejarahCard.querySelectorAll('p');
                    if (pList.length >= 2) {
                        pList[0].textContent = profil.sejarah_p1;
                        pList[1].textContent = profil.sejarah_p2;
                    }
                }
                const visiBody = document.querySelector('.vm-card:not(.mission) .vm-body p');
                if (visiBody && profil.visi_text) visiBody.textContent = `"${profil.visi_text}"`;

                const misiUl = document.querySelector('.vm-card.mission .vm-body ul');
                if (misiUl && Array.isArray(profil.misi_list)) {
                    misiUl.innerHTML = profil.misi_list.map(m => `<li><i class="fa-solid fa-check"></i> ${m}</li>`).join('');
                }
            }

            // C. Render Berita
            const beritaList = await window.dusunService.getBerita();
            const newsGrid = document.getElementById('newsGrid');
            if (newsGrid && Array.isArray(beritaList) && beritaList.length > 0) {
                newsGrid.innerHTML = beritaList.map(b => `
                    <article class="news-card" data-category="${b.category}" data-title="${b.title}">
                        <div class="news-img-box">
                            ${b.image_url ? `<img src="${b.image_url}" alt="${b.title}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                            <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                                <span class="placeholder-tag">${b.category}</span>
                                <div class="placeholder-icon"><i class="fa-solid fa-newspaper"></i></div>
                                <h4 class="placeholder-title">${b.title}</h4>
                            </div>`}
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span><i class="fa-regular fa-calendar"></i> ${b.date_str}</span>
                                <span><i class="fa-regular fa-user"></i> ${b.author || 'Pengurus Dusun'}</span>
                            </div>
                            <h3 class="news-title">${b.title}</h3>
                            <p class="news-excerpt">${b.excerpt}</p>
                            <div class="news-footer">
                                <button class="btn-read-more" onclick="readNewsModal('${b.title.replace(/'/g, "\\'")}', '${b.date_str}', '${b.category}', '${b.content.replace(/'/g, "\\'")}')">
                                    Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </article>
                `).join('');
            }

            // D. Render Administrasi Peta & Titik Lokasi
            const peta = await window.dusunService.getAdministrasiPeta();
            if (peta) {
                const mapTitle = document.querySelector('.map-header-info h3');
                if (mapTitle && peta.map_title) mapTitle.textContent = peta.map_title;
                const mapDesc = document.querySelector('.map-header-info p');
                if (mapDesc && peta.map_desc) mapDesc.textContent = peta.map_desc;
                const mapImg = document.querySelector('.map-main-img');
                if (mapImg && peta.map_image_url) mapImg.src = peta.map_image_url;
            }

            const lokasiList = await window.dusunService.getTitikLokasi();
            const lokasiGrid = document.querySelector('.location-grid');
            if (lokasiGrid && Array.isArray(lokasiList) && lokasiList.length > 0) {
                lokasiGrid.innerHTML = lokasiList.map(l => `
                    <div class="location-card" data-category="${l.category}">
                        <div class="location-img-box" onclick="openImageModal('${l.image_url}', '${l.title.replace(/'/g, "\\'")}')">
                            <img src="${l.image_url}" alt="${l.title}" class="location-img" onerror="this.src='assets/Masjid_Al-Falah.jpg'">
                            <span class="location-badge ${l.badge_color || 'blue'}"><i class="fa-solid fa-location-dot"></i> ${l.badge_label || l.category}</span>
                        </div>
                        <div class="location-body">
                            <h4 class="location-title">${l.title}</h4>
                            <p class="location-desc">${l.description}</p>
                            <div class="coordinate-info">
                                <span class="coord-label"><i class="fa-solid fa-crosshairs"></i> Koordinat:</span>
                                <span class="coord-val">${l.coordinates}</span>
                            </div>
                            <a href="${l.gmaps_url}" target="_blank" rel="noopener noreferrer" class="btn-gmaps">
                                <i class="fa-solid fa-map-location-dot"></i> Buka Google Maps
                            </a>
                        </div>
                    </div>
                `).join('');
            }

            // E. Render UMKM
            const umkmList = await window.dusunService.getUMKM();
            const umkmGrid = document.querySelector('.umkm-grid');
            if (umkmGrid && Array.isArray(umkmList) && umkmList.length > 0) {
                umkmGrid.innerHTML = umkmList.map(u => `
                    <div class="umkm-card" data-category="${u.category}">
                        <div class="umkm-img-box">
                            ${u.image_url ? `<img src="${u.image_url}" alt="${u.title}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                            <div class="placeholder-image-box" style="border-radius: 0; min-height: 100%;">
                                <span class="placeholder-tag">${u.category}</span>
                                <div class="placeholder-icon"><i class="fa-solid fa-shop"></i></div>
                                <h4 class="placeholder-title">${u.title}</h4>
                            </div>`}
                        </div>
                        <div class="umkm-body">
                            <span class="umkm-category-tag">${u.category}</span>
                            <h3 class="umkm-title">${u.title}</h3>
                            <div class="umkm-owner"><i class="fa-regular fa-user"></i> Pemilik: ${u.owner}</div>
                            <p class="umkm-desc">${u.description}</p>
                            <div class="umkm-footer">
                                <div class="umkm-price">${u.price_str}</div>
                                <a href="https://wa.me/${u.whatsapp.replace(/\+/g, '')}?text=Halo%20${encodeURIComponent(u.owner)},%20saya%20tertarik%20dengan%20${encodeURIComponent(u.title)}" target="_blank" class="btn-wa-order">
                                    <i class="fa-brands fa-whatsapp"></i> Pesan WA
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }



        } catch (err) {
            console.error('[loadDynamicContent] Error:', err);
        }
    }

    // Jalankan sync data dinamis saat halaman siap
    loadDynamicContent();
});

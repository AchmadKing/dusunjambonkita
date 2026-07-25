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

    // Trigger Service Request Modal
    window.requestServiceModal = function(serviceName) {
        const html = `
            <form id="serviceForm" onsubmit="handleFormSubmit(event, 'Permohonan ${serviceName} berhasil dikirim!')">
                <div class="form-group">
                    <label class="form-label">Nama Lengkap Pemohon</label>
                    <input type="text" class="form-input" placeholder="Masukkan nama sesuai KTP" required>
                </div>
                <div class="form-group">
                    <label class="form-label">NIK (Nomor Induk Kependudukan)</label>
                    <input type="text" class="form-input" placeholder="16 Digit NIK" required pattern="[0-9]{16}">
                </div>
                <div class="form-group">
                    <label class="form-label">RT / RW</label>
                    <select class="form-select" required>
                        <option value="">-- Pilih RT/RW --</option>
                        <option value="RT 01 / RW 01">RT 01 / RW 01</option>
                        <option value="RT 02 / RW 01">RT 02 / RW 01</option>
                        <option value="RT 03 / RW 02">RT 03 / RW 02</option>
                        <option value="RT 04 / RW 02">RT 04 / RW 02</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nomor WhatsApp / HP Active</label>
                    <input type="tel" class="form-input" placeholder="08xxxxxxxxxx" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Keterangan / Keperluan Tambahan</label>
                    <textarea class="form-textarea" placeholder="Tuliskan keperluan pengurusan surat secara rinci..."></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
                    <i class="fa-solid fa-paper-plane"></i> Kirim Permohonan
                </button>
            </form>
        `;
        openModal(`Pengajuan Surat: ${serviceName}`, html);
    };

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
});

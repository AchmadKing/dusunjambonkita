    <!-- ==========================================================================
         MODAL DIALOG CONTAINER
         ========================================================================== -->
    <div id="modalBackdrop" class="modal-backdrop">
        <div class="modal-container">
            <div class="modal-header">
                <h3 id="modalTitle" class="modal-title">Judul Modal</h3>
                <button id="btnCloseModal" class="btn-close-modal" aria-label="Tutup Modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="modalBody" class="modal-body">
                <!-- Content injected dynamically via script.js -->
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         FOOTER SECTION
         ========================================================================== -->
    <footer class="main-footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="nav-brand">
                        <div class="brand-icon">
                            <i class="fa-solid fa-building-columns"></i>
                        </div>
                        <div class="brand-text">
                            <span class="brand-title">Dusun Jambon</span>
                            <span class="brand-subtitle">Portal Resmi Dusun</span>
                        </div>
                    </div>
                    <p>
                        Wadah informasi resmi, transparansi pelayanan administrasi, dan pemberdayaan potensi ekonomi
                        warga Dusun Jambon.
                    </p>
                </div>

                <div class="footer-col">
                    <h5>Navigasi Cepat</h5>
                    <ul class="footer-links">
                        <li><a href="#beranda" class="footer-nav-link" data-target="beranda">Beranda</a></li>
                        <li><a href="#profil" class="footer-nav-link" data-target="profil">Profil & Sejarah</a></li>
                        <li><a href="#berita" class="footer-nav-link" data-target="berita">Berita Dusun</a></li>
                        <li><a href="#administrasi" class="footer-nav-link" data-target="administrasi">Peta Administrasi</a></li>
                        <li><a href="#umkm" class="footer-nav-link" data-target="umkm">Daftar UMKM</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5>Informasi Publik</h5>
                    <ul class="footer-links">
                        <li><a href="#administrasi" class="footer-nav-link" data-target="administrasi">Peta Wilayah Dusun</a></li>
                        <li><a href="#administrasi" class="footer-nav-link" data-target="administrasi">Titik Lokasi Penting</a></li>
                        <li><a href="#berita" class="footer-nav-link" data-target="berita">Warta & Pengumuman</a></li>
                        <li><a href="#umkm" class="footer-nav-link" data-target="umkm">Katalog Produk UMKM</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5>Kontak Dusun</h5>
                    <ul class="footer-links">
                        <li><a href="#kontak" class="footer-nav-link" data-target="kontak"><i
                                    class="fa-solid fa-location-dot"></i> <span id="footerAddressDisplay">Dusun Jambon, Karangtalun</span></a></li>
                        <li><a href="#kontak" class="footer-nav-link" data-target="kontak"><i
                                    class="fa-solid fa-phone"></i>
                                <span id="footerPhoneDisplay">+62 812-3456-7890</span></a></li>
                        <li><a href="#kontak" class="footer-nav-link" data-target="kontak"><i
                                    class="fa-solid fa-envelope"></i>
                            <span id="footerEmailDisplay">admin@dusunjambon.id</span></a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <div>
                    &copy; <?= date('Y') ?> Dusun Jambon. Dibuat dengan transparansi & dedikasi untuk warga.
                </div>
                <div>
                    Portal Resmi Dusun Jambon
                </div>
            </div>
        </div>
    </footer>

    <!-- Custom JavaScript -->
    <script src="assets/js/script.js"></script>
</body>
</html>

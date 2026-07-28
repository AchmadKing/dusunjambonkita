<!-- Mobile Sidebar Drawer Navigation (HP) -->
<div id="sidebarBackdrop" class="mobile-sidebar-backdrop"></div>
<aside id="sidebarDrawer" class="mobile-sidebar-drawer">
    <div class="sidebar-header">
        <div class="nav-brand">
            <div class="brand-icon">
                <i class="fa-solid fa-building-columns"></i>
            </div>
            <div class="brand-text">
                <span class="brand-title">Dusun Jambon</span>
                <span class="brand-subtitle">Menu Navigation</span>
            </div>
        </div>
        <button id="btnCloseSidebar" class="btn-close-sidebar" aria-label="Tutup Menu">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
    <ul class="mobile-nav-menu">
        <li>
            <a href="#beranda" class="mobile-nav-link active" data-target="beranda">
                <i class="fa-solid fa-house"></i> Beranda
            </a>
        </li>
        <li>
            <a href="#profil" class="mobile-nav-link" data-target="profil">
                <i class="fa-solid fa-id-card"></i> Profil & Sejarah
            </a>
        </li>
        <li>
            <a href="#berita" class="mobile-nav-link" data-target="berita">
                <i class="fa-solid fa-newspaper"></i> Berita Dusun
            </a>
        </li>
        <li>
            <a href="#administrasi" class="mobile-nav-link" data-target="administrasi">
                <i class="fa-solid fa-file-signature"></i> Administrasi
            </a>
        </li>
        <li>
            <a href="#umkm" class="mobile-nav-link" data-target="umkm">
                <i class="fa-solid fa-store"></i> Daftar UMKM
            </a>
        </li>
        <li>
            <a href="#kontak" class="mobile-nav-link" data-target="kontak">
                <i class="fa-solid fa-phone"></i> Kontak Dusun
            </a>
        </li>
    </ul>
    <div class="sidebar-footer">
        <p>&copy; <?= date('Y') ?> Dusun Jambon. All Rights Reserved.</p>
    </div>
</aside>

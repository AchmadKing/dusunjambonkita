<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'Portal Resmi Dusun Jambon - Informasi & Transparansi Dusun') ?></title>

    <!-- Meta SEO -->
    <meta name="description" content="Website Resmi Dusun Jambon. Informasi Peta Administrasi, Profil & Sejarah, Berita Dusun, Directory UMKM Warga, dan Kontak Pengurus.">
    <meta name="keywords" content="Dusun Jambon, Desa Jambon, Portal Dusun, Administrasi Dusun, UMKM Dusun, Berita Desa">
    <meta name="author" content="Pemerintah Dusun Jambon">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- FontAwesome 6 Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Main Stylesheets -->
    <link rel="stylesheet" href="assets/css/style.css">
    <?php if (isset($isAdmin) && $isAdmin): ?>
        <link rel="stylesheet" href="assets/css/admin-style.css">
    <?php endif; ?>
</head>
<body class="<?= isset($isAdmin) && $isAdmin ? 'admin-body' : '' ?>">

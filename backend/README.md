# GASS API Backend - PHP

Backend API untuk GASS (Gas API Simulation System) dengan sistem migrasi database terstruktur.

## Database Migrations

Sistem migrasi menggunakan file SQL terpisah untuk setiap table dengan tracking otomatis.

### Files:
- `migrations/` - Directory berisi semua file migrasi SQL
- `seeds/` - Directory berisi semua file seed SQL
- `migrate.php` - Wrapper script untuk menjalankan migrasi dari root directory
- `seed.php` - Wrapper script untuk menjalankan seeds dari root directory
- `migrations/migrate.php` - Script migrasi utama dengan tracking
- `seeds/seed.php` - Script seeder utama dengan tracking
- `migrations/README.md` - Dokumentasi lengkap migrasi
- `seeds/README.md` - Dokumentasi lengkap seed data

### Cara Menjalankan Migrasi & Seeding:

1. Buat file `.env` di `backend-php/` dengan konfigurasi database:

```env
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=gassapi
DB_PORT=3306
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

2. Jalankan migrasi dari root directory:

```bash
# Lihat status migrasi
php backend-php/migrate.php --status

# Jalankan semua migrasi pending
php backend-php/migrate.php

# Fresh start (drop semua table & recreate)
php backend-php/migrate.php --fresh

# Jalankan migrasi + seed data (recommended untuk development)
php backend-php/migrate.php --seed
```

## Database Seeding

System seeding menyediakan sample data untuk development environment:

### Cara Menjalankan Seeds:

```bash
# Jalankan semua seeds
php backend-php/seed.php

# Jalankan seeds spesifik
php backend-php/seed.php --class=UsersSeeder

# Refresh seed data
php backend-php/seed.php --refresh

# Lihat status seeds
php backend-php/seed.php --status
```

### Sample Data yang Tersedia:

- **Users**: Admin account + 5 test users (password: `password`)
- **Projects**: 5 sample API projects (e-commerce, weather, user management, etc.)
- **Collections & Endpoints**: Organized API endpoints untuk setiap project
- **Environments**: Dev, staging, production configurations
- **Flows**: Sample API automation workflows
- **Test Flows**: Automated test scenarios dengan execution history
- **Project Members**: Team membership assignments
- **MCP Tokens**: Sample client tokens untuk testing

### Quick Start untuk Development:

```bash
# Setup complete database dengan sample data
php backend-php/migrate.php --seed

# Login credentials:
# Admin: admin@gassapi.com / password
# Test User: john.doe@test.com / password
```

### Struktur Migrasi:

- **000_setup_database.sql** - Setup database dan disable FK checks
- **001-013** - Create tables per file (diurutkan berdasarkan dependencies)
- **999_complete_migration.sql** - Re-enable FK checks

Lihat `migrations/README.md` untuk dokumentasi lengkap tentang struktur table dan dependencies.

## Catatan:
- Sistem migrasi tracking otomatis status setiap file
- Support rollback dan fresh install
- Setiap table dalam file terpisah untuk kemudahan maintenance
- Foreign key dependencies di-handle dengan proper ordering

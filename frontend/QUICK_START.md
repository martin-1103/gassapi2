# 🚀 GASS API Frontend - Quick Start Guide

## Setup (5 menit)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Aplikasi akan buka di `http://localhost:5173`

### 3. Login
Buat akun baru atau login dengan akun existing:
- **Register:** Klik "Daftar di sini" di halaman login
- **Login:** Masukkan email dan password

---

## 📖 User Guide

### Membuat Project Pertama

1. **Dashboard** → Klik "Project Baru"
2. Isi nama project (contoh: "My API Project")
3. Isi deskripsi (opsional)
4. Klik "Buat"

### Membuat Collection

1. Klik project untuk masuk ke **Workspace**
2. Di sidebar kiri, klik ikon **+** di header "Collections"
3. Isi nama collection (contoh: "User API")
4. Klik "Buat"

### Membuat Environment

1. Di workspace, klik "**Buat Environment**" di header
2. Isi nama (contoh: "Development")
3. Tambah variables:
   - Key: `base_url`, Value: `https://api.example.com`
   - Key: `api_key`, Value: `your-api-key`
4. Centang "Set sebagai default" (opsional)
5. Klik "Buat Environment"

### Membuat Endpoint

1. Hover mouse ke collection di sidebar
2. Klik ikon **+** yang muncul
3. Isi:
   - **Nama:** "Get Users"
   - **Method:** GET
   - **URL:** `{{base_url}}/users`
4. Klik "Buat Endpoint"

Endpoint akan auto-open di tab!

### Testing Endpoint

1. **Edit URL jika perlu:** `{{base_url}}/users/123`
2. **Tambah Headers:** (klik tab Headers)
   ```json
   {
     "Authorization": "Bearer {{api_key}}",
     "Content-Type": "application/json"
   }
   ```
3. **Tambah Body:** (untuk POST/PUT, klik tab Body)
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
   ```
4. **Klik "Send"** 🚀
5. **Lihat Response** di tab Response:
   - Status code (hijau = sukses, merah = error)
   - Response time (ms)
   - Response body (formatted JSON)

### Tips & Tricks

#### Variable Interpolation
Gunakan format `{{variable_name}}` di mana saja:
```
URL: {{base_url}}/users/{{user_id}}
Headers: { "Authorization": "Bearer {{token}}" }
Body: { "api_key": "{{api_key}}" }
```

#### Multiple Tabs
- Buka multiple endpoints di tabs berbeda
- Klik tab untuk switch
- Klik **X** untuk close tab
- Tab tersimpan otomatis

#### Keyboard Shortcuts (Future)
- `Ctrl+S` - Save endpoint
- `Ctrl+Enter` - Send request
- `Ctrl+W` - Close tab

---

## 🎯 Workflow Example

### Complete API Testing Flow

1. **Buat Project:** "E-Commerce API"
2. **Buat Environments:**
   - Development: `base_url = http://localhost:3000`
   - Production: `base_url = https://api.myapp.com`
3. **Buat Collections:**
   - Auth API
   - User API
   - Product API
   - Order API
4. **Buat Endpoints di Auth API:**
   - POST `/auth/register`
   - POST `/auth/login`
   - POST `/auth/logout`
5. **Test Login:**
   - Method: POST
   - URL: `{{base_url}}/auth/login`
   - Body: `{ "email": "test@example.com", "password": "password" }`
   - Send & copy token dari response
6. **Save Token di Environment:**
   - Klik "Buat Environment" → Edit existing
   - Tambah variable: `token = <paste-token-here>`
7. **Test Protected Endpoint:**
   - Method: GET
   - URL: `{{base_url}}/users/me`
   - Headers: `{ "Authorization": "Bearer {{token}}" }`
   - Send → See your user data!

---

## 🐛 Troubleshooting

### Login Gagal
- Pastikan backend API running
- Check URL backend: `/gassapi2/backend/`
- Check email/password correct
- Check network tab di browser DevTools

### Request Gagal / CORS Error
- Pastikan backend API allow CORS
- Check backend API logs
- Check URL endpoint correct
- Check Authorization header correct

### Variables Tidak Ter-interpolate
- Pastikan environment sudah dipilih
- Pastikan variable name exact match (case-sensitive)
- Format harus `{{variable}}` dengan double curly braces

### Tab Tidak Terbuka
- Refresh page
- Clear localStorage (F12 → Application → Local Storage → Clear)
- Check console untuk errors

---

## 📱 Responsive Design

Aplikasi responsive untuk:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ⚠️ Tablet (768px+) - Sidebar auto-collapse
- ⚠️ Mobile (< 768px) - Limited support (future enhancement)

---

## 🔥 Power User Tips

### Bulk Testing
1. Buat multiple endpoints di collection
2. Buka semua di tabs
3. Test satu-per-satu dengan `Ctrl+Tab` untuk navigate

### Environment Switching
Switch antara Dev/Staging/Prod dengan 1 klik di environment dropdown!

### Copy-Paste JSON
Response JSON bisa langsung di-copy dari Response tab untuk:
- Save sebagai test data
- Share dengan team
- Debug issues

### Variable Hierarchy
Variables diambil dari (priority tertinggi ke rendah):
1. Environment variables
2. Collection variables  
3. Global variables

---

## 📞 Need Help?

- Read **README.md** untuk dokumentasi lengkap
- Read **FRONTEND_IMPLEMENTATION_SUMMARY.md** untuk architecture details
- Check kode di `src/` untuk reference
- Check backend API docs di `backend/docs/`

---

**Happy API Testing! 🚀**

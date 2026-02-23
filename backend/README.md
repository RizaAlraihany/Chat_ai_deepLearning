# **🤖 AI Chat Application \- Deep Learning Lanjut**

Aplikasi AI Chatbot interaktif yang mengintegrasikan **Generative AI (Google Gemini)** dengan arsitektur **Decoupled (React & Laravel 11\)**. Proyek ini dibangun sebagai pemenuhan Ujian Akhir Semester (UAS) untuk mata kuliah Deep Learning Lanjut.

Berbeda dengan chatbot konvensional, aplikasi ini memanfaatkan _Large Language Model_ (LLM) untuk memahami konteks percakapan secara dinamis dan memungkinkan modifikasi "kepribadian" AI secara _real-time_ lewat dasbor admin.

## **✨ Fitur Utama**

### **💬 1\. Antarmuka Percakapan Cerdas (Smart Chat)**

- Interaksi chat responsif menggunakan **React.js**.
- Pendekatan _Optimistic UI_ untuk pengalaman pengguna yang mulus.
- Indikator mengetik (Typing Animation) yang natural.
- Pengelompokan riwayat percakapan secara otomatis (Sidebar History).

### **🧠 2\. Integrasi Generative AI & Memori**

- Terhubung langsung dengan **Google Gemini API** (gemini-2.5-flash).
- **Contextual Memory**: AI mampu mengingat konteks dari 10 percakapan sebelumnya (diambil dari database).
- Bypass batasan _stateless_ pada API REST konvensional.

### **⚙️ 3\. Manajemen Persona AI (Admin Panel)**

- Konfigurasi _System Instruction_ (Peran/Sifat AI) secara _real-time_.
- Pengaturan _Temperature_ (Tingkat kreativitas/logika).
- Pengaturan _Max Tokens_ (Panjang maksimal balasan).
- Pemilihan _Model Name_ yang dinamis (contoh: gemini-2.5-flash / gemini-pro).

### **🔒 4\. Autentikasi & Multi-Role**

- Registrasi dan Login pengguna yang aman.
- Autentikasi API berbasis token menggunakan **Laravel Sanctum**.
- Pemisahan hak akses antara Admin (mengelola sistem) dan User (pengguna chat biasa).

## **🧩 Struktur Database**

### **👤 Tabel Users**

| Field      | Keterangan        |
| :--------- | :---------------- |
| id (PK)    | ID unik           |
| name       | Nama lengkap user |
| email      | Email unik user   |
| password   | Password (Hashed) |
| role       | admin atau user   |
| timestamps | Otomatis Laravel  |

### **💬 Tabel Conversations**

| Field        | Keterangan            |
| :----------- | :-------------------- |
| id (PK)      | ID unik percakapan    |
| user_id (FK) | Relasi ke tabel users |
| title        | Judul chat otomatis   |
| timestamps   | Otomatis Laravel      |

### **📝 Tabel Messages**

| Field           | Keterangan                     |
| :-------------- | :----------------------------- |
| id (PK)         | ID unik pesan                  |
| conversation_id | Relasi ke conversations        |
| role            | Siapa yang bicara (user/model) |
| content         | Isi teks percakapan            |
| timestamps      | Otomatis Laravel               |

### **⚙️ Tabel AI Settings (Singleton)**

| Field              | Keterangan                            |
| :----------------- | :------------------------------------ |
| id (PK)            | ID unik (Selalu 1\)                   |
| system_instruction | Persona / Instruksi untuk AI          |
| model_name         | Nama model Gemini                     |
| max_tokens         | Batas output token                    |
| temperature        | Parameter kreativitas AI (0.0 \- 2.0) |
| timestamps         | Otomatis Laravel                      |

## **⚙️ Instalasi**

Pastikan **PHP 8.2+**, **Node.js**, **Composer**, dan **MySQL** telah terinstal.

1. **Clone repository (Jika menggunakan Git)**

git clone \[https://github.com/RizaAlraihany/uai\_chat\_project.git\](https://github.com/RizaAlraihany/uai\_chat\_project.git)  
cd uai_chat_project

2. **Setup Backend (Laravel)**

cd backend  
composer install  
cp .env.example .env  
php artisan key:generate

3. **Konfigurasi Database & API Key di .env (Backend)**

DB_DATABASE=ai_chat_db  
DB_USERNAME=root  
DB_PASSWORD=

\# Dapatkan API Key dari Google AI Studio  
GEMINI_API_KEY=KODE_RAHASIA_GEMINI_ANDA

4. **Jalankan Migrasi & Seeder**

php artisan migrate:fresh \--seed

5. **Jalankan Server Backend**

php artisan serve

6. **Setup Frontend (React / Vite) \- Buka Terminal Baru**

cd frontend  
npm install  
npm run dev

## **🔑 Login Default**

Akun ini dibuat otomatis saat Anda menjalankan php artisan migrate:fresh \--seed.

| Role  | Email             | Password    | Akses                 |
| :---- | :---------------- | :---------- | :-------------------- |
| Admin | admin@example.com | password123 | Chat & Dasbor Persona |
| User  | user@example.com  | password123 | Antarmuka Chat Saja   |

## **🖯️ Routes Utama (API)**

### **🔐 Autentikasi (Public)**

- POST /api/register – Daftar akun baru
- POST /api/login – Autentikasi dan ambil token Sanctum

### **💬 Percakapan (Protected: User & Admin)**

- GET /api/conversations – Ambil daftar riwayat chat user
- POST /api/chat – Kirim pesan ke AI dan simpan ke database
- POST /api/logout – Akhiri sesi (Hapus Token)

### **⚙️ Pengaturan AI (Protected: Admin Only)**

- GET /api/admin/settings – Ambil data konfigurasi AI saat ini
- POST /api/admin/settings – Perbarui Persona, Model, dan Parameter AI

## **🧪 Teknologi yang Digunakan**

| Komponen     | Teknologi                                |
| :----------- | :--------------------------------------- |
| **Backend**  | Laravel 11                               |
| **Frontend** | React.js (Vite)                          |
| **Database** | MySQL                                    |
| **AI Model** | Google Gemini API                        |
| **Styling**  | Tailwind CSS                             |
| **Icons**    | Lucide React                             |
| **HTTP**     | Axios (Frontend) & Http Facade (Backend) |

## **🔒 Keamanan**

- **Sanctum Authentication**: Melindungi API Endpoint dengan Bearer Tokens.
- **CSRF Protection**: Stateful routing middleware dengan sanctum/csrf-cookie.
- **Role-Based Access Control (RBAC)**: Kustom middleware AdminMiddleware untuk memblokir akses _user_ biasa ke dasbor AI.
- **CORS Restricted**: API hanya menerima _request_ dari domain Frontend yang didaftarkan.

## **🚀 Optimasi**

- **Context Window Management**: Backend secara cerdas hanya menyuntikkan 10 pesan terakhir ke dalam _payload_ Gemini API agar tidak membebani limit token.
- **Optimistic UI Updates**: Pesan pengguna ditampilkan langsung di antarmuka React sebelum menunggu respon _delay_ jaringan API.

## **📸 Preview Tampilan**

| Halaman Landing                                                                                  | Halaman Chat (User) | Admin Dashboard (Persona) |
| :----------------------------------------------------------------------------------------------- | :------------------ | :------------------------ |
|                                                                                                  |                     |                           |
| _(Silakan buat folder preview atau assets dan masukkan screenshot jika akan diunggah ke GitHub)_ |                     |                           |

## **🗁 Struktur Folder**

/  
├── backend/ \# API Server (Laravel)  
│ ├── app/Http/Controllers/ \# Logika API (Chat, Auth, Admin)  
│ ├── app/Http/Middleware/ \# Security Logic  
│ ├── app/Models/ \# Representasi Database  
│ ├── app/Services/ \# Logika Integrasi Gemini API  
│ ├── routes/api.php \# Endpoint API  
│ └── database/ \# Migrations & Seeders  
│  
└── frontend/ \# Client (React)  
 ├── src/App.jsx \# Core UI, State, & Logic  
 ├── src/index.css \# Tailwind Directives  
 └── tailwind.config.js \# Konfigurasi Styling

## **🧬 Rencana Pengembangan Berikutnya**

- \[ \] Dukungan fitur _Multimodal_ (Upload gambar ke AI).
- \[ \] Implementasi respons _Streaming_ (Mengetik kata per kata seperti ChatGPT asli).
- \[ \] Opsi ganti tema terang / gelap (Dark Mode).
- \[ \] Ekspor riwayat percakapan ke PDF / Txt.

## **👨‍💻 Pengembang**

**Dibuat oleh:** [Riza Alraihany](https://github.com/RizaAlraihany)

📧 Terbuka untuk kolaborasi & pengembangan fitur baru.

## **🦦 License**

MIT License – silakan digunakan untuk keperluan komersial maupun non-komersial.

“Membangun jembatan antara imajinasi dan realitas melalui kecerdasan buatan.” 🤖✨

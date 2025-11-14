# Panduan Deployment ke VPS dengan Docker

## Masalah CSP yang Telah Diperbaiki

Error CSP (Content Security Policy) yang menyebabkan halaman login terus refresh telah diperbaiki dengan mengubah `connect-src` dari wildcard yang tidak valid menjadi protokol yang lebih fleksibel.

### Perubahan:
- ❌ **Sebelum**: `connect-src 'self' http://192.168.*:*` (format wildcard tidak valid)
- ✅ **Setelah**: `connect-src 'self' http: https: ws: wss:` (mengizinkan semua koneksi HTTP/HTTPS)

## Langkah Deployment

### 1. Persiapan File Environment

Buat file `.env` di root project dengan konfigurasi sesuai VPS Anda:

```bash
# Contoh untuk VPS dengan IP 192.168.1.100
VITE_API_BASE_URL=http://192.168.1.100:8000/api/v1

# Atau jika menggunakan domain
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

NODE_ENV=production
```

### 2. Build Docker Image

```bash
# Build image untuk production
docker build -t myakuntansi-frontend -f Dockerfile .

# Atau untuk development
docker build -t myakuntansi-frontend-dev -f Dockerfile.dev .
```

### 3. Jalankan Container

#### Menggunakan Docker Run:
```bash
docker run -d \
  --name myakuntansi-frontend \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://YOUR_VPS_IP:8000/api/v1 \
  myakuntansi-frontend
```

#### Menggunakan Docker Compose (Production):
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Menggunakan Docker Compose (Development):
```bash
docker-compose up -d
```

### 4. Verifikasi Deployment

1. Buka browser dan akses: `http://YOUR_VPS_IP`
2. Periksa console browser (F12) untuk memastikan tidak ada error CSP
3. Coba login untuk memastikan koneksi ke API backend berhasil

### 5. Troubleshooting

#### Jika masih ada error CSP:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Periksa console browser untuk error spesifik

#### Jika tidak bisa connect ke API:
1. Pastikan backend API sudah running
2. Periksa `VITE_API_BASE_URL` di file `.env`
3. Pastikan firewall VPS mengizinkan port yang digunakan
4. Test API endpoint langsung: `curl http://YOUR_VPS_IP:8000/api/v1/health`

#### Jika halaman blank atau tidak load:
1. Periksa nginx logs: `docker logs myakuntansi-frontend`
2. Pastikan build berhasil tanpa error
3. Periksa file `dist/index.html` ada setelah build

## Konfigurasi Nginx (Sudah Termasuk)

File `nginx.conf` sudah dikonfigurasi dengan:
- ✅ Gzip compression
- ✅ SPA routing (try_files)
- ✅ Cache headers

## Security Headers

Aplikasi sudah dilengkapi dengan security headers:
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## Update Aplikasi

Untuk update aplikasi di VPS:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild image
docker build -t myakuntansi-frontend -f Dockerfile .

# 3. Stop dan remove container lama
docker stop myakuntansi-frontend
docker rm myakuntansi-frontend

# 4. Jalankan container baru
docker run -d \
  --name myakuntansi-frontend \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://YOUR_VPS_IP:8000/api/v1 \
  myakuntansi-frontend

# Atau dengan docker-compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoring

Untuk melihat logs aplikasi:
```bash
# Real-time logs
docker logs -f myakuntansi-frontend

# Last 100 lines
docker logs --tail 100 myakuntansi-frontend
```

## Backup

Pastikan backup file penting:
- `.env` - konfigurasi environment
- `docker-compose.prod.yml` - konfigurasi docker
- Source code di repository Git

## Kontak Support

Jika masih ada masalah, periksa:
1. Browser console (F12 > Console)
2. Network tab (F12 > Network)
3. Docker logs
4. Backend API logs

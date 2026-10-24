# Vanzz Wawa

Web app chat, telpon, dan video call (Firebase) yang dibungkus jadi APK dengan Capacitor.

## Struktur
- `www/` — semua file web (index, login, dashboard, dst.)
- `firebase-rules.txt` — rules Realtime Database (tempel ulang ke Firebase tiap ada update node baru)
- `capacitor.config.json` — konfigurasi app (`com.vanzz.wawa`)
- `.github/workflows/build-apk.yml` — build APK otomatis

## Cara rilis APK
1. Edit file di `www/`, commit, push.
2. Buat tag: `git tag v1.0.0 && git push origin v1.0.0`
3. Tunggu tab **Actions** selesai. APK muncul di **Releases** (atau di Artifacts kalau dijalankan manual).

## Tanda tangan APK (disarankan)
Tanpa keystore, APK yang dihasilkan adalah debug dan tanda tangannya berubah tiap build, jadi update menimpa app lama bisa gagal. Buat keystore sekali:

    keytool -genkey -v -keystore release.keystore -alias wawa -keyalg RSA -keysize 2048 -validity 10000

Lalu di GitHub: Settings > Secrets and variables > Actions, tambah:
- `KEYSTORE_BASE64` — hasil `base64 -w0 release.keystore`
- `KEYSTORE_PASSWORD` — password keystore
- `KEY_ALIAS` — `wawa`

Simpan keystore di tempat aman (jangan di-commit). Kalau hilang, update app tidak bisa dirilis.

## Catatan Firebase
- Authentication > Settings > Authorized domains: pastikan `localhost` ada (APK berjalan di `https://localhost`).
- Kunci aplikasi (sidik jari) memakai WebAuthn dan bisa tidak jalan di WebView Android; uji di HP.

## Ikon & splash screen
Taruh `icon.png` (1024x1024) dan `splash.png` (2732x2732) di folder `resources/`. Build berikutnya otomatis membuat semua ukuran ikon dan splash Android.

# Render Deployment Checklist

## ✅ Pre-Deployment

- [x] GitHub repository tayyor
- [x] Barcha fayllar GitHub da
- [x] .gitignore to'g'ri sozlangan
- [x] Backend package.json to'g'ri
- [x] Frontend fayllar tayyor
- [x] API URL dynamic qilindi

## 🚀 Deployment Qadamlari

### 1. GitHub Repository Tayyorlash

```bash
# Barcha o'zgarishlarni commit qiling
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Render.com da Backend Deploy Qilish

**Sozlamalar:**
```
Name: totp-backend
Environment: Node
Build Command: npm install --prefix backend
Start Command: npm start --prefix backend
Plan: Free
```

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=[GENERATE RANDOM KEY]
JWT_EXPIRE=7d
TOTP_WINDOW=2
FRONTEND_URL=https://totp-frontend.onrender.com
```

**JWT_SECRET yaratish:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Render.com da Frontend Deploy Qilish

**Sozlamalar:**
```
Name: totp-frontend
Build Command: echo "Frontend ready"
Publish Directory: frontend
Plan: Free
```

### 4. Frontend API URL Yangilash

Frontend avtomatik API URL ni topadi:
- Lokal: `http://localhost:5000/api`
- Render: `https://totp-backend.onrender.com/api`

## 🧪 Testing

### Backend Test

```bash
# Health check
curl https://totp-backend.onrender.com/api/health

# Response:
# {
#   "success": true,
#   "message": "Server is running",
#   "environment": "production",
#   "timestamp": "2024-03-03T..."
# }
```

### Frontend Test

1. https://totp-frontend.onrender.com ga kiring
2. Ro'yxatdan o'ting
3. Kiring
4. 2FA sozlang

## 🔧 Troubleshooting

### Backend Build Xatosi

**Xato:** `npm: command not found`
- **Yechim**: Render Node.js o'rnatadi, build command to'g'ri bo'lsa tekshiring

**Xato:** `Cannot find module 'express'`
- **Yechim**: `npm install --prefix backend` to'g'ri yozilganligini tekshiring

### Frontend API ga Ulanmaydi

**Xato:** `CORS error` yoki `Failed to fetch`
- **Yechim 1**: Backend URL to'g'ri bo'lsa tekshiring
- **Yechim 2**: Backend CORS sozlamalarini tekshiring
- **Yechim 3**: Network tab da request ko'ring

### 2FA Ishlamaydi

**Xato:** `Invalid TOTP code`
- **Yechim 1**: Vaqt sinxronizatsiyasini tekshiring
- **Yechim 2**: Secret kalit to'g'ri skanerlangan bo'lsa tekshiring
- **Yechim 3**: Authenticator ilovasini qayta o'rnating

## 📊 Monitoring

### Logs Ko'rish

1. Render dashboard da service tanlang
2. **Logs** bo'limiga kiring
3. Real-time logs ko'ring

### Health Check

```bash
# Har 5 daqiqada tekshirish
watch -n 300 'curl -s https://totp-backend.onrender.com/api/health | jq'
```

## 🔐 Security

- [x] JWT_SECRET kuchli va noyob
- [x] NODE_ENV=production
- [x] CORS to'g'ri sozlangan
- [x] HTTPS yoqilgan (Render avtomatik)
- [ ] Rate limiting qo'shish (ixtiyoriy)
- [ ] Security headers qo'shish (ixtiyoriy)

## 📈 Performance

- Backend: Free plan (512MB RAM)
- Frontend: Static site (tez)
- Database: JSON faylda (lokal)

**Optimization:**
- [ ] Caching qo'shish
- [ ] CDN ishlash
- [ ] Database migration (ixtiyoriy)

## 🔄 Updates

Kodni yangilash uchun:

```bash
# Lokal o'zgarishlar
git add .
git commit -m "Update message"
git push origin main

# Render avtomatik redeploy qiladi
```

## 📝 Notes

- Render free plan 15 daqiqadan so'ng service o'chadi
- Ma'lumotlar bazasi faylda saqlandi (persistent)
- Backup qilish uchun ma'lumotlar bazasini yuklab oling

## ✨ Deployment Tugallandi!

```
Frontend: https://totp-frontend.onrender.com
Backend: https://totp-backend.onrender.com
API: https://totp-backend.onrender.com/api
```

Tabriklaymiz! 🎉 Loyihangiz Render da ishga tushdi!

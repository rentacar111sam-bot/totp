# Render ga Deployment Qo'llanmasi

Render.com da TOTP Authentication System ni deploy qilish uchun to'liq qo'llanma.

## Qadam 1: Render.com da Account Yaratish

1. https://render.com ga kiring
2. GitHub bilan sign up qiling
3. Email tasdiqlang

## Qadam 2: GitHub Repository Tayyorlash

```bash
# Loyihani GitHub ga push qiling
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Qadam 3: Backend Deploy Qilish

### 3.1 Yangi Web Service Yaratish

1. Render dashboard ga kiring
2. **New +** tugmasini bosing
3. **Web Service** tanlang
4. GitHub repository tanlang
5. Quyidagi sozlamalarni kiriting:

**Asosiy Sozlamalar:**
- **Name**: `totp-backend`
- **Environment**: `Node`
- **Build Command**: `npm install --prefix backend`
- **Start Command**: `npm start --prefix backend`
- **Plan**: Free (yoki Pro)

### 3.2 Environment Variables Qo'shish

Render dashboard da **Environment** bo'limiga kiring va quyidagilarni qo'shing:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_random_key_here_change_this
JWT_EXPIRE=7d
TOTP_WINDOW=2
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**JWT_SECRET yaratish:**
```bash
# Terminal da
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Deploy Qilish

1. **Create Web Service** tugmasini bosing
2. Render avtomatik build va deploy qiladi
3. Deploy tugallanganda URL olasiz (masalan: `https://totp-backend.onrender.com`)

## Qadam 4: Frontend Deploy Qilish

### 4.1 Yangi Static Site Yaratish

1. Render dashboard ga kiring
2. **New +** tugmasini bosing
3. **Static Site** tanlang
4. GitHub repository tanlang
5. Quyidagi sozlamalarni kiriting:

**Asosiy Sozlamalar:**
- **Name**: `totp-frontend`
- **Build Command**: `echo "Frontend ready"`
- **Publish Directory**: `frontend`

### 4.2 Deploy Qilish

1. **Create Static Site** tugmasini bosing
2. Render avtomatik deploy qiladi
3. Frontend URL olasiz (masalan: `https://totp-frontend.onrender.com`)

## Qadam 5: Frontend API URL ni Yangilash

Frontend fayllarida API URL ni yangilash kerak:

### 5.1 `frontend/js/app.js` ni O'zgartirishning Ikkinchi Usuli

Render environment variables bilan:

```javascript
// Render da
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:5000/api'
  : 'https://totp-backend.onrender.com/api';
```

### 5.2 Yoki Direct URL

```javascript
const API_BASE_URL = 'https://totp-backend.onrender.com/api';
```

Keyin push qiling:
```bash
git add frontend/js/app.js
git commit -m "Update API URL for Render deployment"
git push origin main
```

## Qadam 6: CORS Sozlamalarini Tekshirish

Backend `.env` faylida:
```env
FRONTEND_URL=https://totp-frontend.onrender.com
```

## Qadam 7: Test Qilish

1. Frontend URL ga kiring: `https://totp-frontend.onrender.com`
2. Ro'yxatdan o'ting
3. Kiring
4. 2FA sozlang

## Muammolarni Hal Qilish

### Backend ishlamaydi

**Logs ko'rish:**
1. Render dashboard da backend service tanlang
2. **Logs** bo'limiga kiring
3. Xatolarni ko'ring

**Umumiy muammolar:**

```
Error: Cannot find module 'express'
→ Build Command to'g'ri: npm install --prefix backend

Error: PORT already in use
→ Render avtomatik PORT sozlaydi, .env da PORT o'zgartirishga hojat yo'q

Error: CORS error
→ FRONTEND_URL ni tekshiring
```

### Frontend API ga ulanmaydi

1. Backend URL to'g'ri bo'lsa tekshiring
2. CORS headers tekshiring
3. Network tab da request ko'ring

### 2FA ishlamaydi

1. Vaqt sinxronizatsiyasini tekshiring
2. Secret kalit to'g'ri skanerlangan bo'lsa tekshiring
3. Authenticator ilovasini tekshiring

## Render Free Plan Cheklovlari

- **Inactivity**: 15 daqiqadan so'ng service o'chadi
- **Build time**: 30 daqiqaga cheklangan
- **Disk space**: 0.5 GB
- **Memory**: 512 MB

**Yechim**: Pro planga o'tish yoki ma'lumotlar bazasini tashqi joyda saqlash

## Ma'lumotlar Bazasini Zaxiralash

Render da ma'lumotlar bazasi faylini zaxiralash:

```bash
# Lokal
curl https://totp-backend.onrender.com/api/health

# Backup script
#!/bin/bash
curl -o backup_$(date +%Y%m%d).json \
  https://totp-backend.onrender.com/api/backup
```

## Production Sozlamalar

### Security Headers Qo'shish

Backend `server.js` da:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Rate Limiting Qo'shish

```bash
npm install express-rate-limit --prefix backend
```

`backend/server.js` da:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring

### Render Alerts Sozlash

1. Render dashboard da service tanlang
2. **Settings** → **Alerts**
3. Email alerts yoqing

### Logs Monitoring

```bash
# Real-time logs
curl -N https://totp-backend.onrender.com/api/health
```

## Custom Domain Qo'shish

1. Render dashboard da service tanlang
2. **Settings** → **Custom Domain**
3. Domain qo'shing
4. DNS records yangilang

## Qo'shimcha Resurslar

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Troubleshooting](https://render.com/docs/troubleshooting)

## Deployment Checklist

- [ ] GitHub repository tayyor
- [ ] .env faylida JWT_SECRET o'zgartirilgan
- [ ] Backend Render da deploy qilindi
- [ ] Frontend Render da deploy qilindi
- [ ] API URL frontend da yangilandi
- [ ] CORS sozlamalar to'g'ri
- [ ] Test qilindi (ro'yxatdan o'tish, kirish, 2FA)
- [ ] Logs tekshirildi
- [ ] Custom domain qo'shildi (ixtiyoriy)

## Support

Muammolar bo'lsa:
1. Render logs ko'ring
2. GitHub issues yarating
3. Render support ga murojaat qiling

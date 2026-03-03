# Deployment Qo'llanmasi

## 1. VPS ga Deployment (Ubuntu/Debian)

### Qadam 1: Server sozlash

```bash
# System yangilash
sudo apt update && sudo apt upgrade -y

# Node.js o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git o'rnatish
sudo apt install -y git

# PM2 o'rnatish (process manager)
sudo npm install -g pm2
```

### Qadam 2: Loyihani klonlash

```bash
cd /home/username
git clone https://github.com/your-username/totp-auth-system.git
cd totp-auth-system
```

### Qadam 3: Backend sozlash

```bash
cd backend
npm install --production
cp .env.example .env
```

`.env` faylini o'zingizning sozlamalaringiz bilan o'zgartiring:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_very_secure_random_key_here
JWT_EXPIRE=7d
TOTP_WINDOW=2
FRONTEND_URL=https://your-domain.com
```

### Qadam 4: PM2 bilan ishga tushirish

```bash
# Backend
pm2 start server.js --name "totp-backend"

# Frontend (yangi terminal)
cd ../frontend
pm2 start server.js --name "totp-frontend"

# Avtomatik restart
pm2 startup
pm2 save
```

### Qadam 5: Nginx konfiguratsiyasi

```bash
sudo apt install -y nginx
```

`/etc/nginx/sites-available/totp` faylini yaratish:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx ni yoqish:

```bash
sudo ln -s /etc/nginx/sites-available/totp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Qadam 6: SSL sertifikati (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 2. Docker bilan Deployment

### Qadam 1: Docker o'rnatish

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Qadam 2: Docker Compose bilan ishga tushirish

```bash
cd /path/to/totp-auth-system
docker-compose up -d
```

### Qadam 3: Logs ko'rish

```bash
docker-compose logs -f
```

---

## 3. Heroku ga Deployment

### Qadam 1: Heroku CLI o'rnatish

```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

### Qadam 2: Heroku app yaratish

```bash
heroku create your-app-name
```

### Qadam 3: Environment variables sozlash

```bash
heroku config:set JWT_SECRET="your_super_secret_key"
heroku config:set NODE_ENV="production"
```

### Qadam 4: Deploy

```bash
git push heroku main
```

---

## 4. Netlify ga Frontend Deployment

### Qadam 1: Netlify ga ulanish

https://app.netlify.com ga kiring va GitHub bilan ulanish

### Qadam 2: Repository ulanish

- Repository tanlang
- Build command: `echo 'Frontend ready'`
- Publish directory: `frontend`

### Qadam 3: Environment variables

Netlify settings da:
- `REACT_APP_API_URL=https://your-backend-url.com/api`

---

## 5. Vercel ga Frontend Deployment

### Qadam 1: Vercel CLI o'rnatish

```bash
npm install -g vercel
vercel login
```

### Qadam 2: Deploy

```bash
cd frontend
vercel
```

---

## Xavfsizlik Tekshiruvi

- [ ] JWT_SECRET kuchli va noyob
- [ ] HTTPS yoqilgan
- [ ] CORS to'g'ri sozlangan
- [ ] Rate limiting qo'shilgan
- [ ] Ma'lumotlar bazasi zaxiralangan
- [ ] Logs monitoring qo'shilgan
- [ ] Firewall sozlangan

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup

### Ma'lumotlar bazasini zaxiralash

```bash
# Lokal
cp backend/data/totp_auth.json backup/totp_auth_$(date +%Y%m%d).json

# Remote
scp user@server:/path/to/backend/data/totp_auth.json ./backup/
```

## Muammolarni Hal Qilish

### Port band bo'lsa

```bash
lsof -i :5000
kill -9 <PID>
```

### PM2 restart

```bash
pm2 restart all
pm2 restart totp-backend
```

### Nginx restart

```bash
sudo systemctl restart nginx
```

## Qo'shimcha Resurslar

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)

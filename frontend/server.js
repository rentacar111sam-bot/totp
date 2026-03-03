// Frontend uchun simple HTTP server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Fayl yo'li
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  // Fayl turini aniqlash
  const ext = path.extname(filePath);
  let contentType = 'text/html';

  switch (ext) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
  }

  // Faylni o'qish va yuborish
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Fayl topilmadi</h1>');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Frontend Server Started              ║
╚════════════════════════════════════════╝

  Frontend running on: http://localhost:${PORT}
  Backend API: http://localhost:5000

  Sahifalar:
  - http://localhost:${PORT}           (Bosh sahifa)
  - http://localhost:${PORT}/register.html (Ro'yxatdan o'tish)
  - http://localhost:${PORT}/login.html    (Kirish)
  - http://localhost:${PORT}/dashboard.html (Bosh panel)
  `);
});

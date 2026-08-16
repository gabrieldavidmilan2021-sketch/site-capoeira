const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'store.json');
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

function ensureStore() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ featuredProducts: [], bestSellers: [], lojaProducts: [], categorySectionImages: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { featuredProducts: [], bestSellers: [], lojaProducts: [], categorySectionImages: [] }; }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(ROOT + path.sep)) return sendJson(response, 403, { error: 'Acesso negado' });
  fs.readFile(filePath, (error, content) => {
    if (error) return sendJson(response, 404, { error: 'Arquivo não encontrado' });
    response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    response.end(content);
  });
}

http.createServer((request, response) => {
  if (request.url.startsWith('/api/store')) {
    if (request.method === 'GET') return sendJson(response, 200, readStore());
    if (request.method !== 'PUT') return sendJson(response, 405, { error: 'Método não permitido' });
    let raw = '';
    request.on('data', chunk => { raw += chunk; if (raw.length > 5_000_000) request.destroy(); });
    request.on('end', () => {
      try {
        const data = JSON.parse(raw || '{}');
        const store = {
          featuredProducts: Array.isArray(data.featuredProducts) ? data.featuredProducts : [],
          bestSellers: Array.isArray(data.bestSellers) ? data.bestSellers : [],
          lojaProducts: Array.isArray(data.lojaProducts) ? data.lojaProducts : [],
          categorySectionImages: Array.isArray(data.categorySectionImages) ? data.categorySectionImages : []
        };
        ensureStore();
        fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
        sendJson(response, 200, { ok: true });
      } catch { sendJson(response, 400, { error: 'Dados inválidos' }); }
    });
    return;
  }
  serveStatic(request, response);
}).listen(PORT, () => console.log(`Loja disponível em http://localhost:${PORT}`));

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getVisitorId(request) {
  const cookies = String(request.headers.cookie || '').split(';');
  const visitorCookie = cookies.find(cookie => cookie.trim().startsWith('visitor_id='));
  return visitorCookie ? decodeURIComponent(visitorCookie.trim().slice('visitor_id='.length)) : '';
}

function createVisitorId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function registerVisit(request, response) {
  const store = readStore();
  const month = getCurrentMonth();
  const visitorId = getVisitorId(request) || createVisitorId();
  const visitStats = store.visitStats && typeof store.visitStats === 'object' ? store.visitStats : {};
  const monthStats = visitStats[month] && typeof visitStats[month] === 'object' ? visitStats[month] : { visits: 0, visitors: [] };
  const visitors = Array.isArray(monthStats.visitors) ? monthStats.visitors : [];

  monthStats.visits = Number(monthStats.visits) + 1;
  if (!visitors.includes(visitorId)) visitors.push(visitorId);
  monthStats.visitors = visitors.slice(-100000);
  visitStats[month] = monthStats;
  store.visitStats = visitStats;

  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  response.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Set-Cookie': `visitor_id=${encodeURIComponent(visitorId)}; Max-Age=31536000; Path=/; SameSite=Lax`
  });
  response.end(JSON.stringify({ month, visits: monthStats.visits, visitors: visitors.length }));
}

function getVisitStats() {
  const store = readStore();
  const stats = store.visitStats && typeof store.visitStats === 'object' ? store.visitStats : {};
  return Object.entries(stats)
    .map(([month, value]) => ({ month, visits: Number(value.visits) || 0, visitors: Array.isArray(value.visitors) ? value.visitors.length : 0 }))
    .sort((a, b) => b.month.localeCompare(a.month));
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

const server = http.createServer((request, response) => {
  if (request.url === '/api/visit') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: 'Método não permitido' });
    return registerVisit(request, response);
  }

  if (request.url === '/api/visits') {
    if (request.method !== 'GET') return sendJson(response, 405, { error: 'Método não permitido' });
    return sendJson(response, 200, { months: getVisitStats() });
  }

  if (request.url.startsWith('/api/store')) {
    if (request.method === 'GET') return sendJson(response, 200, readStore());
    if (request.method !== 'PUT') return sendJson(response, 405, { error: 'Método não permitido' });
    let raw = '';
    let requestTooLarge = false;
    request.on('data', chunk => {
      raw += chunk;
      if (raw.length > 25_000_000) {
        requestTooLarge = true;
        request.removeAllListeners('data');
        sendJson(response, 413, { error: 'Imagem muito grande. Escolha uma imagem menor.' });
        request.destroy();
      }
    });
    request.on('end', () => {
      if (requestTooLarge) return;
      try {
        const data = JSON.parse(raw || '{}');
        const store = {
          featuredProducts: Array.isArray(data.featuredProducts) ? data.featuredProducts : [],
          bestSellers: Array.isArray(data.bestSellers) ? data.bestSellers : [],
          lojaProducts: Array.isArray(data.lojaProducts) ? data.lojaProducts : [],
          categorySectionImages: Array.isArray(data.categorySectionImages) ? data.categorySectionImages : [],
          visitStats: data.visitStats && typeof data.visitStats === 'object' ? data.visitStats : readStore().visitStats || {}
        };
        ensureStore();
        fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
        sendJson(response, 200, { ok: true });
      } catch { sendJson(response, 400, { error: 'Dados inválidos' }); }
    });
    return;
  }
  serveStatic(request, response);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Loja disponível em http://localhost:${PORT}`);
  Object.values(os.networkInterfaces()).flat().forEach(network => {
    if (network && network.family === 'IPv4' && !network.internal) {
      console.log(`Acesso pelo celular: http://${network.address}:${PORT}`);
    }
  });
});

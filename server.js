/**
 * 人格搭子 · 互补匹配系统 — 管理后端
 * 零依赖，仅用 Node 内置模块。运行：node server.js
 * 默认端口 3000（可用 PORT 环境变量修改）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const PORT = process.env.PORT || 3000;

/* ───────── 数据文件工具 ───────── */
function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
function hash(pw, salt) {
  return crypto.createHash('sha256').update(salt + ':' + pw).digest('hex');
}

/* ───────── 初始化种子数据 ───────── */
ensureDir();
const seedAuth = { password: process.env.ADMIN_PASSWORD || 'admin123', salt: crypto.randomBytes(8).toString('hex') };
if (!fs.existsSync(AUTH_FILE)) {
  const rawPw = seedAuth.password;
  seedAuth.password = hash(rawPw, seedAuth.salt);
  writeJSON(AUTH_FILE, seedAuth);
  console.log('🔐 首次启动，管理员密码：' + rawPw + ' （登录后请在后台立即修改）');
}
let auth = readJSON(AUTH_FILE, seedAuth);
const seed = require('./seed.js');

if (!fs.existsSync(CONFIG_FILE)) {
  // 种子配置：从内置数据生成（前端兜底数据同款）
  writeJSON(CONFIG_FILE, seed);
  console.log('📝 已生成默认内容配置 config.json');
}
if (!fs.existsSync(RECORDS_FILE)) writeJSON(RECORDS_FILE, []);

let config = readJSON(CONFIG_FILE, {});
let records = readJSON(RECORDS_FILE, []);

/* ───────── 会话令牌 ───────── */
const sessions = new Map(); // token -> expiry
function makeToken() {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, Date.now() + 1000 * 60 * 60 * 12); // 12 小时
  return t;
}
function checkToken(t) {
  if (!t) return false;
  const exp = sessions.get(t);
  if (!exp) return false;
  if (Date.now() > exp) { sessions.delete(t); return false; }
  return true;
}

/* ───────── 工具函数 ───────── */
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > 2e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
  });
}
function staticType(p) {
  const m = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
  return m[path.extname(p).toLowerCase()] || 'application/octet-stream';
}
function serveStatic(res, urlPath) {
  let p = path.normalize(path.join(PUBLIC, urlPath));
  if (!p.startsWith(PUBLIC)) { send(res, 403, { error: 'Forbidden' }); return; }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found'); return; }
    res.writeHead(200, { 'Content-Type': staticType(p) });
    res.end(data);
  });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

/* ───────── 路由 ───────── */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // 静态文件
  if (!p.startsWith('/api/')) return serveStatic(res, p === '/' ? '/index.html' : p);

  try {
    /* 登录 */
    if (p === '/api/login' && req.method === 'POST') {
      const body = await readBody(req);
      if (hash(String(body.password || ''), auth.salt) === auth.password) {
        send(res, 200, { ok: true, token: makeToken() });
      } else send(res, 401, { error: '密码错误' });
      return;
    }

    /* 前端公共配置（无需登录） */
    if (p === '/api/config' && req.method === 'GET') { send(res, 200, config); return; }

    /* 记录上报（无需登录，简单校验防刷） */
    if (p === '/api/records' && req.method === 'POST') {
      const body = await readBody(req);
      if (body && typeof body.code === 'string' && body.code.length === 6) {
        records.push({ code: body.code, pcts: body.pcts || {}, ts: body.ts || new Date().toISOString() });
        if (records.length > 50000) records = records.slice(-50000);
        writeJSON(RECORDS_FILE, records);
        send(res, 200, { ok: true });
      } else send(res, 400, { error: '数据无效' });
      return;
    }

    /* 以下接口需要登录 */
    if (!checkToken(req.headers['x-token'])) { send(res, 401, { error: '未登录或已过期' }); return; }

    /* 保存内容配置（null 字段自动恢复为种子默认值） */
    if (p === '/api/config' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body || typeof body !== 'object') { send(res, 400, { error: '数据无效' }); return; }
      config = {
        questions: Array.isArray(body.questions) ? body.questions : seed.questions,
        personalities: (body.personalities && typeof body.personalities === 'object') ? body.personalities : seed.personalities,
        templates: (body.templates && typeof body.templates === 'object') ? body.templates : seed.templates,
        dims: seed.dims,
        traits: seed.traits
      };
      writeJSON(CONFIG_FILE, config);
      send(res, 200, { ok: true });
      return;
    }

    /* 记录列表 */
    if (p === '/api/records' && req.method === 'GET') {
      send(res, 200, records);
      return;
    }

    /* 统计 */
    if (p === '/api/stats' && req.method === 'GET') {
      const total = records.length;
      const today = records.filter((r) => (r.ts || '').slice(0, 10) === todayStr()).length;
      const dist = {};
      records.forEach((r) => { const c = r.code || '?'; dist[c] = (dist[c] || 0) + 1; });
      const top = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([code, count]) => ({ code, count }));
      send(res, 200, { total, today, top });
      return;
    }

    /* 修改密码 */
    if (p === '/api/password' && req.method === 'POST') {
      const body = await readBody(req);
      const np = String(body.password || '');
      if (np.length < 6) { send(res, 400, { error: '密码至少 6 位' }); return; }
      auth = { password: hash(np, auth.salt), salt: auth.salt };
      writeJSON(AUTH_FILE, auth);
      send(res, 200, { ok: true });
      return;
    }

    /* 清空记录 */
    if (p === '/api/records' && req.method === 'DELETE') {
      records = [];
      writeJSON(RECORDS_FILE, records);
      send(res, 200, { ok: true });
      return;
    }

    send(res, 404, { error: 'Not Found' });
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('🧩 人格搭子 · 互补匹配系统');
  console.log(`🌐 前端入口   http://localhost:${PORT}/`);
  console.log(`🔐 管理后台   http://localhost:${PORT}/admin.html`);
  console.log('========================================');
});

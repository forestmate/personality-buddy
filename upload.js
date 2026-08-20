/**
 * 通过 GitHub Contents API 批量上传文件（绕开 git push 网络问题）
 * 用法: GH_TOKEN=xxx node upload.js
 */
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GH_TOKEN;
const OWNER = 'forestmate';
const REPO = 'personality-buddy';
const BRANCH = 'main';
const ROOT = path.join(__dirname);

if (!TOKEN) { console.error('缺少 GH_TOKEN'); process.exit(1); }

function walk(dir, base = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const it of items) {
    const rel = base ? base + '/' + it.name : it.name;
    if (it.isDirectory()) {
      if (['.git', 'data', 'node_modules'].includes(it.name)) continue;
      files.push(...walk(path.join(dir, it.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

async function upload(relPath) {
  const content = fs.readFileSync(path.join(ROOT, relPath));
  const b64 = content.toString('base64');
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${relPath}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'buddy-upload'
        },
        body: JSON.stringify({ message: `add ${relPath}`, content: b64, branch: BRANCH })
      });
      const j = await r.json();
      if (r.status === 201) { console.log(`✅ ${relPath}`); return true; }
      if (r.status === 422 && /nothing to commit|already exists/i.test(j.message || '')) {
        console.log(`⏭️  ${relPath} (已存在)`); return true;
      }
      console.log(`❌ ${relPath} [${r.status}] ${j.message || ''} (尝试 ${attempt}/3)`);
    } catch (e) {
      console.log(`❌ ${relPath} 网络错误: ${e.message} (尝试 ${attempt}/3)`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  return false;
}

(async () => {
  const files = walk(ROOT);
  console.log(`待上传 ${files.length} 个文件:`, files.join(', '));
  let ok = 0;
  for (const f of files) { if (await upload(f)) ok++; }
  console.log(`\n完成: ${ok}/${files.length} 上传成功`);
})();

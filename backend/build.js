// Vercel에 제공할 프론트엔드 파일만 dist 폴더로 복사합니다.
const { mkdirSync, copyFileSync } = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
mkdirSync(path.join(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js']) {
  copyFileSync(path.join(root, 'frontend', file), path.join(root, 'dist', file));
}

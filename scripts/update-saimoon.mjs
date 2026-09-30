import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const saimoonDir = path.resolve(rootDir, 'saimoon');

console.log('🚀 Starting saimoon folder update...');

if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ dist/ directory not found or index.html missing. Run vite build first.');
  process.exit(1);
}

// Ensure saimoon dir exists
if (!fs.existsSync(saimoonDir)) {
  fs.mkdirSync(saimoonDir, { recursive: true });
}

// 1. Remove old hashed assets in saimoon/assets to prevent stale chunk accumulation
const saimoonAssetsDir = path.join(saimoonDir, 'assets');
if (fs.existsSync(saimoonAssetsDir)) {
  console.log('🧹 Cleaning old saimoon/assets...');
  fs.rmSync(saimoonAssetsDir, { recursive: true, force: true });
}

// 2. Copy everything from dist to saimoon (except any zip)
console.log('📦 Copying build artifacts from dist to saimoon...');
const distItems = fs.readdirSync(distDir);
for (const item of distItems) {
  const src = path.join(distDir, item);
  const dest = path.join(saimoonDir, item);
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`  ✓ ${item}`);
}

// 3. Create/update saimoon/saimoon.zip
// Package non-video assets into saimoon.zip (GitHub safe < 100MB)
console.log('🗜️  Generating updated saimoon/saimoon.zip...');
const zipFile = path.join(saimoonDir, 'saimoon.zip');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  // Use PowerShell on Windows or zip on Unix to create saimoon.zip
  if (process.platform === 'win32') {
    // Stage items to zip excluding backgrounds and saimoon.zip
    const stageDir = path.join(rootDir, 'node_modules', '.cache', 'saimoon-zip-stage');
    if (fs.existsSync(stageDir)) {
      fs.rmSync(stageDir, { recursive: true, force: true });
    }
    fs.mkdirSync(stageDir, { recursive: true });

    for (const item of fs.readdirSync(saimoonDir)) {
      if (item === 'backgrounds' || item === 'saimoon.zip') continue;
      const itemSrc = path.join(saimoonDir, item);
      const itemDest = path.join(stageDir, item);
      fs.cpSync(itemSrc, itemDest, { recursive: true, force: true });
    }

    const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${stageDir}\\*' -DestinationPath '${zipFile}' -Force"`;
    execSync(psCmd, { stdio: 'inherit' });
    fs.rmSync(stageDir, { recursive: true, force: true });
  } else {
    execSync(`cd "${saimoonDir}" && zip -r saimoon.zip . -x "backgrounds/*" "saimoon.zip"`, { stdio: 'inherit' });
  }

  const zipStat = fs.statSync(zipFile);
  console.log(`  ✓ saimoon.zip created (${(zipStat.size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (err) {
  console.warn('⚠️ Could not generate saimoon.zip:', err.message);
}

console.log('✅ saimoon folder updated perfectly!');

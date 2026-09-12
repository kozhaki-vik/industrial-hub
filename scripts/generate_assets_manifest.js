import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../src/assets/items');
const outputFile = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '../assets_manifest.json');

console.log(`[Manifest Generator] Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

function calculateFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const files = fs.readdirSync(targetDir);
const manifestFiles = {};
let processed = 0;

for (const file of files) {
  if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.webp')) continue;
  const fullPath = path.join(targetDir, file);
  const stat = fs.statSync(fullPath);
  const hash = calculateFileHash(fullPath);

  manifestFiles[file] = {
    hash,
    size: stat.size
  };
  processed++;
}

const manifest = {
  version: 1,
  updatedAt: new Date().toISOString(),
  count: processed,
  files: manifestFiles
};

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`[Manifest Generator] Successfully generated ${outputFile} with ${processed} assets.`);

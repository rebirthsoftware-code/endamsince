import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/endam-logo.png';
const OUT = 'public/icons';
fs.mkdirSync(OUT, { recursive: true });

const BG = { r: 6, g: 6, b: 6, alpha: 1 }; // koyu zemin

async function makeIcon(size, padding = 0.18, outName) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(SRC)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, outName));
  console.log('->', outName);
}

await makeIcon(192, 0.18, 'icon-192.png');
await makeIcon(512, 0.18, 'icon-512.png');
await makeIcon(180, 0.14, 'apple-touch-icon.png');
await makeIcon(32,  0.10, 'favicon-32.png');
console.log('Done');

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="brand-gR" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF6B5E"/>
      <stop offset="100%" stop-color="#FF3030"/>
    </linearGradient>
    <linearGradient id="brand-gD" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1F2937"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#brand-gD)"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="5"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="url(#brand-gR)" stroke-width="5" stroke-linecap="round" stroke-dasharray="104 138.2" transform="rotate(-90 32 32)"/>
  <polygon points="28,24 28,40 41,32" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  
  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg, 'utf8');
  console.log('Wrote public/favicon.svg');

  // 2. Write logo.svg
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svg, 'utf8');
  console.log('Wrote public/logo.svg');

  // 3. Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  const svgBuffer = Buffer.from(svg);

  for (const s of sizes) {
    const outPath = path.join(publicDir, s.name);
    await sharp(svgBuffer)
      .resize(s.size, s.size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${s.name} (${s.size}x${s.size})`);
  }

  // 4. Generate favicon.ico
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (16x16, 32x32, 48x48)');

  // 5. Generate og-image.png (1200x630)
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#09090b" />
        <stop offset="100%" stop-color="#141419" />
      </linearGradient>
      <linearGradient id="og-gR" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF6B5E" />
        <stop offset="100%" stop-color="#FF3030" />
      </linearGradient>
      <linearGradient id="og-gD" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1F2937" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <circle cx="210" cy="315" r="160" fill="#FF3030" opacity="0.12" filter="url(#glow)" />

    <g transform="translate(120, 225) scale(2.8125)">
      <circle cx="32" cy="32" r="30" fill="url(#og-gD)"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="url(#og-gR)" stroke-width="5" stroke-linecap="round" stroke-dasharray="104 138.2" transform="rotate(-90 32 32)"/>
      <polygon points="28,24 28,40 41,32" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
    </g>

    <text x="350" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
      YT Playlist <tspan fill="#A1A1AA">Cal</tspan>
    </text>

    <text x="350" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="600" fill="#E4E4E7">
      YouTube Playlist Length &amp; Watch Time Calculator
    </text>

    <text x="350" y="395" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#71717A">
      Instant total duration • Playback speeds (1.25×, 1.5×, 2×) • Daily watch planner
    </text>

    <rect x="0" y="622" width="1200" height="8" fill="url(#og-gR)" />
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png (1200x630)');
}

function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = count * dirEntrySize;
  let offset = headerSize + totalDirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  const buffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // offset to image data

    entries.push(entry);
    buffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...buffers]);
}

run().catch(console.error);

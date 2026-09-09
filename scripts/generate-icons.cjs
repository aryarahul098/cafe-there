const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // Helper to make chunk
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Drawing function for Cafe There icon
// Dark stone rounded background + warm golden coffee cup symbol
function drawCafeIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Base background: Dark stone #1c1917 (28, 25, 23)
  let bgR = 28, bgG = 25, bgB = 23;

  // Maskable needs full bleed
  if (!isMaskable) {
    // Rounded squircle
    const cornerR = w * 0.22;
    const nx = Math.abs(x - cx);
    const ny = Math.abs(y - cy);
    const innerW = w / 2 - cornerR;
    const innerH = h / 2 - cornerR;
    if (nx > innerW && ny > innerH) {
      const cornerDist = Math.sqrt((nx - innerW) ** 2 + (ny - innerH) ** 2);
      if (cornerDist > cornerR) {
        return [0, 0, 0, 0]; // Transparent outside
      }
    }
  }

  // Amber glow around center
  const glowDist = dist / (r * 0.65);
  if (glowDist < 1.0) {
    const glowAmt = (1.0 - glowDist) * 0.4;
    bgR = Math.min(255, bgR + Math.round(245 * glowAmt));
    bgG = Math.min(255, bgG + Math.round(158 * glowAmt));
    bgB = Math.min(255, bgB + Math.round(11 * glowAmt));
  }

  // Draw coffee cup & saucer in safe zone
  const scale = isMaskable ? 0.72 : 0.85;
  const sx = (x - cx) / (w * scale * 0.5);
  const sy = (y - cy) / (h * scale * 0.5);

  // Cup body: between sy = -0.1 to 0.45, sx tapered
  if (sy >= -0.1 && sy <= 0.45) {
    const taper = 0.55 - (sy + 0.1) * 0.25;
    if (Math.abs(sx) <= taper) {
      // Golden Amber #f59e0b to #d97706
      return [245, 158, 11, 255];
    }
  }

  // Cup rim ellipse: sy between -0.2 and -0.05
  const rimX = sx / 0.56;
  const rimY = (sy + 0.1) / 0.12;
  if (rimX * rimX + rimY * rimY <= 1.0) {
    if (rimX * rimX + rimY * rimY <= 0.6) {
      // Dark espresso inside cup
      return [120, 53, 15, 255];
    }
    // Rim highlight
    return [254, 243, 199, 255];
  }

  // Cup Handle on the right: sx between 0.4 and 0.75, sy between 0.0 and 0.35
  const handleX = (sx - 0.5) / 0.25;
  const handleY = (sy - 0.18) / 0.18;
  const hDist = Math.sqrt(handleX * handleX + handleY * handleY);
  if (hDist <= 1.0 && hDist >= 0.55 && sx > 0.35) {
    return [245, 158, 11, 255];
  }

  // Saucer ellipse: sy between 0.45 and 0.65
  const saucerX = sx / 0.75;
  const saucerY = (sy - 0.52) / 0.1;
  if (saucerX * saucerX + saucerY * saucerY <= 1.0) {
    return [217, 119, 6, 255];
  }

  // Steam waves: sy between -0.65 and -0.2
  if (sy >= -0.65 && sy <= -0.2) {
    const steam1 = Math.abs(sx - (-0.2 + Math.sin((sy + 0.4) * 8) * 0.08));
    const steam2 = Math.abs(sx - (0.0 + Math.sin((sy + 0.5) * 8) * 0.08));
    const steam3 = Math.abs(sx - (0.2 + Math.sin((sy + 0.4) * 8) * 0.08));
    if (steam1 < 0.04 || steam2 < 0.045 || steam3 < 0.04) {
      return [252, 211, 77, 230];
    }
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPNG(192, 192, (x, y, w, h) => drawCafeIcon(x, y, w, h, false))
);
console.log('Created pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => drawCafeIcon(x, y, w, h, false))
);
console.log('Created pwa-512x512.png');

// 3. pwa-maskable-512x512.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => drawCafeIcon(x, y, w, h, true))
);
console.log('Created pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPNG(180, 180, (x, y, w, h) => drawCafeIcon(x, y, w, h, false))
);
console.log('Created apple-touch-icon.png');

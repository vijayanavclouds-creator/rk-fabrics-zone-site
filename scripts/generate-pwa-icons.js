const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public', 'logo.png');

async function generateIcons() {
  if (!fs.existsSync(inputPath)) {
    console.error('logo.png not found in public folder');
    return;
  }

  // Create 192x192
  await sharp(inputPath)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile(path.join(__dirname, '../public', 'icon-192x192.png'));
  
  console.log('Generated icon-192x192.png');

  // Create 512x512
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile(path.join(__dirname, '../public', 'icon-512x512.png'));
  
  console.log('Generated icon-512x512.png');
}

generateIcons().catch(console.error);

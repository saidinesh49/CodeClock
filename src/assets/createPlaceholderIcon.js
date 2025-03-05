const sharp = require('sharp');
const path = require('path');

// Create a simple placeholder icon
const size = 128;
const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <text x="50%" y="50%" font-family="Arial" font-size="80" fill="#ffa116" text-anchor="middle" dy=".3em">⏱</text>
</svg>
`;

sharp(Buffer.from(svg))
  .toFile(path.join(__dirname, 'logo.png'))
  .catch(console.error); 
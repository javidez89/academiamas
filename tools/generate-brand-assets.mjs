import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, 'assets', 'img', 'qavance-logo-source.png');
const source = await fs.readFile(sourcePath);
const sourceUrl = `data:image/png;base64,${source.toString('base64')}`;
const browser = await chromium.launch({ headless: true });

async function renderAsset({ file, width, height, type, quality = 0.9, draw }) {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    const dataUrl = await page.evaluate(async ({ sourceUrl: imageUrl, width: outputWidth, height: outputHeight, type: outputType, quality: outputQuality, draw }) => {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      const logoCrop = { x: 12, y: 18, width: 1721, height: 523 };
      const iconCrop = { x: 12, y: 18, width: 500, height: 500 };

      if (draw === 'logo') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
        context.drawImage(image, logoCrop.x, logoCrop.y, logoCrop.width, logoCrop.height, 0, 0, outputWidth, outputHeight);
      } else if (draw === 'icon') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
        context.drawImage(image, iconCrop.x, iconCrop.y, iconCrop.width, iconCrop.height, 2, 2, outputWidth - 4, outputHeight - 4);
      } else if (draw === 'maskable') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
        const inset = Math.round(outputWidth * 0.16);
        context.drawImage(image, iconCrop.x, iconCrop.y, iconCrop.width, iconCrop.height, inset, inset, outputWidth - (inset * 2), outputHeight - (inset * 2));
      } else {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
        context.fillStyle = '#07111f';
        context.fillRect(0, 0, outputWidth, 22);
        context.fillStyle = '#1d9bd7';
        context.fillRect(0, outputHeight - 22, outputWidth, 22);
        const logoWidth = 1080;
        const logoHeight = Math.round(logoWidth * logoCrop.height / logoCrop.width);
        context.drawImage(image, logoCrop.x, logoCrop.y, logoCrop.width, logoCrop.height, (outputWidth - logoWidth) / 2, 92, logoWidth, logoHeight);
        context.fillStyle = '#143d70';
        context.font = '700 31px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('Cursos gratis, syllabus, práctica y simulacros', outputWidth / 2, 485);
      }

      return canvas.toDataURL(outputType, outputQuality);
    }, { sourceUrl, width, height, type, quality, draw });

    const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1);
    await fs.writeFile(path.join(ROOT, file), Buffer.from(encoded, 'base64'));
  } finally {
    await page.close();
  }
}

try {
  await Promise.all([
    renderAsset({ file: 'assets/img/qavance-logo.png', width: 1320, height: 402, type: 'image/png', draw: 'logo' }),
    renderAsset({ file: 'assets/img/qavance-logo-660.webp', width: 660, height: 201, type: 'image/webp', quality: 0.9, draw: 'logo' }),
    renderAsset({ file: 'assets/img/qavance-social.jpg', width: 1200, height: 630, type: 'image/jpeg', quality: 0.9, draw: 'social' }),
    renderAsset({ file: 'assets/img/favicon-48.png', width: 48, height: 48, type: 'image/png', draw: 'icon' }),
    renderAsset({ file: 'assets/img/apple-touch-icon.png', width: 180, height: 180, type: 'image/png', draw: 'icon' }),
    renderAsset({ file: 'assets/img/pwa-icon-192.png', width: 192, height: 192, type: 'image/png', draw: 'icon' }),
    renderAsset({ file: 'assets/img/pwa-icon-512.png', width: 512, height: 512, type: 'image/png', draw: 'icon' }),
    renderAsset({ file: 'assets/img/pwa-maskable-512.png', width: 512, height: 512, type: 'image/png', draw: 'maskable' })
  ]);
} finally {
  await browser.close();
}

console.log('Activos de marca optimizados generados.');

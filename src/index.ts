import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateBadge } from './generator/badge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGOS_PATH = path.join(__dirname, '../assets/logos');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to find logo file
function findLogoPath(logoName: string, logoColor?: string): string | undefined {
  const logoDir = path.join(LOGOS_PATH, logoName);

  if (!fs.existsSync(logoDir)) {
    return undefined;
  }

  // Try to find logo with specific color first
  if (logoColor) {
    const coloredLogo = path.join(logoDir, `${logoName}-${logoColor}.png`);
    if (fs.existsSync(coloredLogo)) {
      return coloredLogo;
    }
  }

  // Fallback to default logo
  const defaultLogo = path.join(logoDir, `${logoName}.png`);
  if (fs.existsSync(defaultLogo)) {
    return defaultLogo;
  }

  // Try to find any png in the directory
  const files = fs.readdirSync(logoDir);
  const pngFile = files.find(f => f.endsWith('.png'));
  if (pngFile) {
    return path.join(logoDir, pngFile);
  }

  return undefined;
}

// Badge endpoint: /badge/:text/:color
// Example: /badge/TypeScript/3178C6
// Example with logo: /badge/Python/3776AB?logo=python
// Example with logo color: /badge/Tailwind/38bdf8?logo=tailwind&logoColor=black
// Example with scale: /badge/TypeScript/3178C6?scale=4
app.get('/badge/:text/:color', async (req, res) => {
  try {
    const { text, color } = req.params;
    const scale = parseInt(req.query.scale as string) || 4;
    const logoName = req.query.logo as string | undefined;
    const logoColor = req.query.logoColor as string | undefined;

    // Find logo path if specified
    let logoPath: string | undefined;
    if (logoName) {
      logoPath = findLogoPath(logoName, logoColor);
      if (!logoPath) {
        return res.status(404).json({
          error: `Logo '${logoName}' not found`,
          availableLogos: fs.readdirSync(LOGOS_PATH).filter(f =>
            fs.statSync(path.join(LOGOS_PATH, f)).isDirectory()
          )
        });
      }
    }

    const badge = await generateBadge({
      text,
      color: `#${color}`,
      scale: Math.min(Math.max(scale, 1), 8), // Clamp 1-8
      logo: logoPath,
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(badge);
  } catch (error) {
    console.error('Error generating badge:', error);
    res.status(500).json({ error: 'Failed to generate badge' });
  }
});

// List available logos
app.get('/logos', (req, res) => {
  const logos: Record<string, string[]> = {};

  const logoDirs = fs.readdirSync(LOGOS_PATH).filter(f =>
    fs.statSync(path.join(LOGOS_PATH, f)).isDirectory()
  );

  for (const dir of logoDirs) {
    const files = fs.readdirSync(path.join(LOGOS_PATH, dir))
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''));
    logos[dir] = files;
  }

  res.json({ logos });
});

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'BitBadges API',
    version: '1.0.0',
    endpoints: {
      badge: {
        url: '/badge/:text/:color',
        params: {
          text: 'The text to display',
          color: 'Hex color without # (e.g., 3178C6)',
        },
        query: {
          logo: 'Logo name (e.g., python, tailwind)',
          logoColor: 'Logo variant (e.g., white, black)',
          scale: 'Output scale 1-8 (default: 4)',
        },
      },
      logos: {
        url: '/logos',
        description: 'List all available logos',
      },
    },
    examples: [
      '/badge/TypeScript/3178C6',
      '/badge/Python/3776AB?logo=python',
      '/badge/Tailwind/38bdf8?logo=tailwind&logoColor=black',
      '/badge/React/61DAFB?scale=2',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🎮 BitBadges API running at http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/badge/Hello/3178C6`);
  console.log(`📋 Logos: http://localhost:${PORT}/logos`);
});

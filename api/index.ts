import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';
import { generateBadge } from '../src/generator/badge.js';

const LOGOS_PATH = path.join(process.cwd(), 'assets/logos');

function findLogoPath(logoName: string, logoColor?: string): string | undefined {
  const logoDir = path.join(LOGOS_PATH, logoName);

  if (!fs.existsSync(logoDir)) {
    return undefined;
  }

  if (logoColor) {
    const coloredLogo = path.join(logoDir, `${logoName}-${logoColor}.png`);
    if (fs.existsSync(coloredLogo)) {
      return coloredLogo;
    }
  }

  const defaultLogo = path.join(logoDir, `${logoName}.png`);
  if (fs.existsSync(defaultLogo)) {
    return defaultLogo;
  }

  const files = fs.readdirSync(logoDir);
  const pngFile = files.find(f => f.endsWith('.png'));
  if (pngFile) {
    return path.join(logoDir, pngFile);
  }

  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req;

  // Parse the URL path
  const urlPath = url?.split('?')[0] || '/';
  const query = req.query;

  // Home route
  if (urlPath === '/' || urlPath === '') {
    return res.json({
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
  }

  // Logos route
  if (urlPath === '/logos') {
    try {
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

      return res.json({ logos });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to list logos' });
    }
  }

  // Badge route: /badge/:text/:color
  const badgeMatch = urlPath.match(/^\/badge\/([^/]+)\/([^/]+)$/);
  if (badgeMatch) {
    try {
      const text = decodeURIComponent(badgeMatch[1]);
      const color = badgeMatch[2];
      // Scale: accepts number or preset (xs, sm, md, lg, xl, xxl)
      const scalePresets: Record<string, number> = {
        xs: 1,
        sm: 1.5,
        md: 2,
        lg: 2.5,
        xl: 3,
        xxl: 4,
      };
      const scaleParam = query.scale as string;
      const scale = scalePresets[scaleParam] ?? (parseFloat(scaleParam) || 2);
      const logoName = query.logo as string | undefined;
      const logoColor = query.logoColor as string | undefined;
      const textColorParam = query.textColor as string | undefined;

      // Validate textColor
      const textColor = textColorParam === 'white' || textColorParam === 'black'
        ? textColorParam
        : 'auto';

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
        scale: Math.min(Math.max(scale, 1), 8),
        logo: logoPath,
        textColor,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(badge);
    } catch (error) {
      console.error('Error generating badge:', error);
      return res.status(500).json({ error: 'Failed to generate badge' });
    }
  }

  // 404
  return res.status(404).json({ error: 'Not found' });
}

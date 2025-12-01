import express from 'express';
import { generateBadge } from './generator/badge.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Badge endpoint: /badge/:text/:color
// Example: /badge/TypeScript/3178C6
// Example with scale: /badge/TypeScript/3178C6?scale=4
app.get('/badge/:text/:color', async (req, res) => {
  try {
    const { text, color } = req.params;
    const scale = parseInt(req.query.scale as string) || 1;

    const badge = await generateBadge({
      text,
      color: `#${color}`,
      scale: Math.min(scale, 8), // Max 8x scale
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(badge);
  } catch (error) {
    console.error('Error generating badge:', error);
    res.status(500).json({ error: 'Failed to generate badge' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Pixel Badges API',
    usage: '/badge/:text/:color',
    example: '/badge/TypeScript/3178C6',
    params: {
      text: 'The text to display',
      color: 'Hex color without # (e.g., 3178C6)',
      scale: 'Query param for scaling (1-8)',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🎮 Pixel Badges API running at http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/badge/Hello/3178C6`);
});

/**
 * BitBadges Express server
 * Local development server
 */

import express from 'express';

import {
  handleBadgeRequest,
  handleLogosRequest,
  handleHomeRequest,
} from './handlers/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Badge endpoint
app.get('/badge/:text/:color', async (req, res) => {
  const result = await handleBadgeRequest({
    text: decodeURIComponent(req.params.text),
    color: req.params.color,
    scale: req.query.scale as string | undefined,
    logo: req.query.logo as string | undefined,
    logoColor: req.query.logoColor as string | undefined,
    textColor: req.query.textColor as string | undefined,
  });

  if (result.success === false) {
    return res.status(result.status).json({
      error: result.error,
      ...(result.availableLogos && { availableLogos: result.availableLogos }),
    });
  }

  res.set('Content-Type', result.contentType);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  return res.send(result.buffer);
});

// Logos endpoint
app.get('/logos', (_req, res) => {
  const result = handleLogosRequest();

  if (result.success === false) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json({ logos: result.logos });
});

// Home endpoint
app.get('/', (_req, res) => {
  res.json(handleHomeRequest());
});

app.listen(PORT, () => {
  console.log(`BitBadges API running at http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/badge/Hello/3178C6`);
  console.log(`Logos: http://localhost:${PORT}/logos`);
});

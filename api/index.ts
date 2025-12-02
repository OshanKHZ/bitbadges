/**
 * BitBadges Vercel serverless function
 * Production API handler
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import {
  handleBadgeRequest,
  handleLogosRequest,
  handleHomeRequest,
} from '../src/handlers/index.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const urlPath = req.url?.split('?')[0] || '/';
  const query = req.query;

  // Home route
  if (urlPath === '/' || urlPath === '') {
    return res.json(handleHomeRequest());
  }

  // Logos route
  if (urlPath === '/logos') {
    const result = handleLogosRequest();

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.json({ logos: result.logos });
  }

  // Badge route: /badge/:text/:color
  const badgeMatch = urlPath.match(/^\/badge\/([^/]+)\/([^/]+)$/);
  if (badgeMatch) {
    const result = await handleBadgeRequest({
      text: decodeURIComponent(badgeMatch[1]),
      color: badgeMatch[2],
      scale: query.scale as string | undefined,
      logo: query.logo as string | undefined,
      logoColor: query.logoColor as string | undefined,
      textColor: query.textColor as string | undefined,
    });

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
        ...(result.availableLogos && { availableLogos: result.availableLogos }),
      });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(result.buffer);
  }

  // 404
  return res.status(404).json({ error: 'Not found' });
}

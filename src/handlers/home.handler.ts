/**
 * Home/Info request handler
 * Shared between Express server and Vercel serverless function
 */

import type { APIInfo } from '../types/index.js';

const API_INFO: APIInfo = {
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
        scale: 'Output scale: xs(1), sm(2), md(3), lg(4), xl(5) or 1-8 (default: sm)',
        textColor: 'Text color: white, black, or auto (default: auto)',
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
    '/badge/React/61DAFB?scale=md',
    '/badge/Dark/1a1a1a?textColor=white',
  ],
};

/**
 * Returns API information
 */
export function handleHomeRequest(): APIInfo {
  return API_INFO;
}

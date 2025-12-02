/**
 * Logos listing request handler
 * Shared between Express server and Vercel serverless function
 */

import { listLogos } from '../utils/logo.js';
import type { LogosMap } from '../types/index.js';

export interface LogosResult {
  success: true;
  logos: LogosMap;
}

export interface LogosError {
  success: false;
  status: number;
  error: string;
}

export type LogosResponse = LogosResult | LogosError;

/**
 * Handles logos listing request
 */
export function handleLogosRequest(): LogosResponse {
  try {
    const logos = listLogos();
    return {
      success: true,
      logos,
    };
  } catch (error) {
    console.error('[Logos Listing Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      status: 500,
      error: 'Failed to list logos',
    };
  }
}

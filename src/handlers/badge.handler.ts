/**
 * Badge generation request handler
 * Shared between Express server and Vercel serverless function
 */

import { generateBadge } from '../generator/badge.js';
import { getContrastColorName } from '../utils/color.js';
import { findLogoPath, getAvailableLogoNames } from '../utils/logo.js';
import {
  isValidHexColor,
  isValidText,
  parseScale,
  parseTextColor,
} from '../utils/validation.js';

export interface BadgeRequest {
  text: string;
  color: string;
  scale?: string;
  logo?: string;
  logoColor?: string;
  textColor?: string;
}

export interface BadgeResult {
  success: true;
  buffer: Buffer;
  contentType: 'image/png';
}

export interface BadgeError {
  success: false;
  status: number;
  error: string;
  availableLogos?: string[];
}

export type BadgeResponse = BadgeResult | BadgeError;

/**
 * Handles badge generation request
 * Returns either the badge buffer or an error response
 */
export async function handleBadgeRequest(
  request: BadgeRequest
): Promise<BadgeResponse> {
  const { text, color, scale, logo, logoColor, textColor } = request;

  // Validate text
  if (!isValidText(text)) {
    return {
      success: false,
      status: 400,
      error: 'Invalid text. Must be 1-100 characters.',
    };
  }

  // Validate color
  if (!isValidHexColor(color)) {
    return {
      success: false,
      status: 400,
      error: 'Invalid color format. Expected 6 hex digits (e.g., 3178C6)',
    };
  }

  // Parse scale
  const parsedScale = parseScale(scale);

  // Parse text color
  const parsedTextColor = parseTextColor(textColor);

  // Find logo if specified
  let logoPath: string | undefined;
  if (logo) {
    // If logoColor not specified, default to same color as text (based on background luminance)
    const effectiveLogoColor =
      logoColor ?? getContrastColorName(`#${color}`, parsedTextColor);
    logoPath = findLogoPath(logo, effectiveLogoColor);
    if (!logoPath) {
      return {
        success: false,
        status: 404,
        error: `Logo '${logo}' not found`,
        availableLogos: getAvailableLogoNames(),
      };
    }
  }

  try {
    const badge = await generateBadge({
      text,
      color: `#${color}`,
      scale: parsedScale,
      logo: logoPath,
      textColor: parsedTextColor,
    });

    return {
      success: true,
      buffer: badge,
      contentType: 'image/png',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific error types
    if (message.includes('Invalid hex color')) {
      return {
        success: false,
        status: 400,
        error: 'Invalid color format',
      };
    }

    console.error('[Badge Generation Error]', {
      message,
      text,
      color,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      status: 500,
      error: 'Failed to generate badge',
    };
  }
}

/**
 * Input validation utilities
 */

import { BADGE_CONSTANTS, SCALE_PRESETS, type ScalePreset } from '../types/index.js';

/**
 * Validates a hex color string (6 characters, no #)
 */
export function isValidHexColor(color: string): boolean {
  return /^[a-f\d]{6}$/i.test(color);
}

/**
 * Validates badge text
 */
export function isValidText(text: string): boolean {
  return (
    typeof text === 'string' &&
    text.length > 0 &&
    text.length <= BADGE_CONSTANTS.TEXT_MAX_LENGTH
  );
}

/**
 * Validates a filename (alphanumeric, hyphen, underscore only)
 */
export function isValidFileName(filename: string): boolean {
  return /^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif)$/i.test(filename);
}

/**
 * Validates a logo/directory name
 */
export function isValidLogoName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Parses and validates scale parameter
 * Accepts preset names (xs, sm, md, lg, xl, xxl) or numeric values
 */
export function parseScale(scaleParam: unknown): number {
  if (typeof scaleParam !== 'string' || !scaleParam) {
    return BADGE_CONSTANTS.SCALE_DEFAULT;
  }

  // Check if it's a preset
  if (scaleParam in SCALE_PRESETS) {
    return SCALE_PRESETS[scaleParam as ScalePreset];
  }

  // Try to parse as number
  const parsed = parseFloat(scaleParam);
  if (!isNaN(parsed)) {
    return Math.min(
      Math.max(parsed, BADGE_CONSTANTS.SCALE_MIN),
      BADGE_CONSTANTS.SCALE_MAX
    );
  }

  return BADGE_CONSTANTS.SCALE_DEFAULT;
}

/**
 * Parses and validates textColor parameter
 */
export function parseTextColor(
  textColorParam: unknown
): 'white' | 'black' | 'auto' {
  if (textColorParam === 'white' || textColorParam === 'black') {
    return textColorParam;
  }
  return 'auto';
}

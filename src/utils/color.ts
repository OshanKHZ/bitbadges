/**
 * Color manipulation utilities
 */

import type { RGB, HSL } from '../types/index.js';

/**
 * Converts a hex color string to RGB
 * @throws Error if hex color is invalid
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Generates a shadow color (darker variant)
 */
export function getShadowColor(color: RGB): RGB {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 0.2));
}

/**
 * Generates a highlight color (lighter variant)
 */
export function getHighlightColor(color: RGB): RGB {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return hslToRgb(hsl.h, hsl.s, Math.min(1, hsl.l + 0.2));
}

/**
 * Calculates luminance for contrast detection (WCAG formula)
 */
export function getLuminance(color: RGB): number {
  return (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
}

/**
 * Determines optimal text color based on background luminance
 */
export function getContrastTextColor(
  backgroundColor: RGB,
  textColorOption: 'white' | 'black' | 'auto' = 'auto'
): RGB {
  if (textColorOption === 'white') {
    return { r: 255, g: 255, b: 255 };
  }
  if (textColorOption === 'black') {
    return { r: 30, g: 30, b: 30 };
  }

  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5
    ? { r: 30, g: 30, b: 30 } // dark text for light backgrounds
    : { r: 255, g: 255, b: 255 }; // white text for dark backgrounds
}

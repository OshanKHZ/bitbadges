/**
 * Badge image generator
 * Creates pixel-art style badges using 3-slice technique
 */

import path from 'path';

import sharp from 'sharp';

import type { RGB, BadgeOptions, BadgePart } from '../types/index.js';
import { BADGE_CONSTANTS, COLOR_THRESHOLDS } from '../types/index.js';
import {
  hexToRgb,
  getShadowColor,
  getHighlightColor,
  getContrastTextColor,
} from '../utils/color.js';
import { loadBMFont, renderText, getTextWidth } from './bmfont.js';

const ASSETS_PATH = path.join(process.cwd(), 'assets/badge-parts');

/**
 * Recolors a grayscale image to match the target color
 * Maps gray values to shadow/base/highlight variants
 */
async function recolorImage(
  imagePath: string,
  targetColor: RGB
): Promise<Buffer> {
  const image = sharp(imagePath);
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const shadowColor = getShadowColor(targetColor);
  const highlightColor = getHighlightColor(targetColor);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a === 0) continue;

    // Check if pixel is grayish (or pure black/white)
    const isGray =
      Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;

    if (isGray) {
      const gray = r;

      if (gray <= COLOR_THRESHOLDS.SHADOW_MAX) {
        // Shadow: black or dark gray
        pixels[i] = shadowColor.r;
        pixels[i + 1] = shadowColor.g;
        pixels[i + 2] = shadowColor.b;
      } else if (gray <= COLOR_THRESHOLDS.BASE_MAX) {
        // Base: middle gray
        pixels[i] = targetColor.r;
        pixels[i + 1] = targetColor.g;
        pixels[i + 2] = targetColor.b;
      } else {
        // Highlight: white or light gray
        pixels[i] = highlightColor.r;
        pixels[i + 1] = highlightColor.g;
        pixels[i + 2] = highlightColor.b;
      }
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/**
 * Loads and recolors a badge part (left, middle, or right)
 */
async function loadPart(
  partName: 'left' | 'middle' | 'right',
  color: RGB
): Promise<BadgePart> {
  const partPath = path.join(ASSETS_PATH, partName);

  const [base, border, shadows, highlights] = await Promise.all([
    recolorImage(path.join(partPath, 'base.png'), color),
    sharp(path.join(partPath, 'border.png')).png().toBuffer(),
    recolorImage(path.join(partPath, 'shadows.png'), color),
    recolorImage(path.join(partPath, 'highlights.png'), color),
  ]);

  const metadata = await sharp(base).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Invalid metadata for ${partName} part`);
  }

  return {
    base,
    border,
    shadows,
    highlights,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Loads logo and extracts dimensions
 */
async function loadLogo(
  logoPath: string
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const logoSharp = sharp(logoPath);
  const metadata = await logoSharp.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid logo: missing dimensions');
  }

  const buffer = await logoSharp.png().toBuffer();

  return {
    buffer,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Builds composite operations for badge parts
 */
function buildPartComposites(
  part: BadgePart,
  x: number
): sharp.OverlayOptions[] {
  return [
    { input: part.base, left: x, top: 0 },
    { input: part.border, left: x, top: 0 },
    { input: part.shadows, left: x, top: 0 },
    { input: part.highlights, left: x, top: 0 },
  ];
}

/**
 * Generates a pixel-art badge
 */
export async function generateBadge(options: BadgeOptions): Promise<Buffer> {
  const {
    text,
    color,
    scale = 1,
    logo,
    textColor: textColorOption = 'auto',
  } = options;

  const targetColor = hexToRgb(color);
  const textColor = getContrastTextColor(targetColor, textColorOption);

  // Load resources in parallel
  const [font, leftPart, middlePart, rightPart] = await Promise.all([
    loadBMFont(),
    loadPart('left', targetColor),
    loadPart('middle', targetColor),
    loadPart('right', targetColor),
  ]);

  // Load logo if provided
  let logoBuffer: Buffer | null = null;
  let logoWidth = 0;
  let logoHeight = 0;

  if (logo) {
    const logoData = await loadLogo(logo);
    logoBuffer = logoData.buffer;
    logoWidth = logoData.width;
    logoHeight = logoData.height;
  }

  const height = leftPart.height;
  const textWidth = getTextWidth(font, text);

  // Calculate dimensions
  const { PADDING, LOGO_TEXT_GAP } = BADGE_CONSTANTS;
  const logoSection = logoBuffer ? logoWidth + LOGO_TEXT_GAP : 0;
  const middleSectionWidth = PADDING + logoSection + textWidth + 2;
  const totalWidth = leftPart.width + middleSectionWidth + rightPart.width;
  const middleTileCount = Math.ceil(middleSectionWidth / middlePart.width);

  // Build composite operations
  const compositeOps: sharp.OverlayOptions[] = [];

  // Left part
  compositeOps.push(...buildPartComposites(leftPart, 0));

  // Middle tiles
  for (let i = 0; i < middleTileCount; i++) {
    const x = leftPart.width + i * middlePart.width;
    compositeOps.push(...buildPartComposites(middlePart, x));
  }

  // Right part
  const rightX = leftPart.width + middleSectionWidth;
  compositeOps.push(...buildPartComposites(rightPart, rightX));

  // Content positions
  const contentStartX = leftPart.width + PADDING;
  const logoX = contentStartX;
  const textX = contentStartX + logoSection;

  // Add logo
  if (logoBuffer) {
    const logoY = Math.floor((height - logoHeight) / 2);
    compositeOps.push({
      input: logoBuffer,
      left: logoX,
      top: logoY,
    });
  }

  // Render and add text
  const { buffer: textBuffer, width: textBufferWidth } = await renderText(
    font,
    text,
    textColor,
    height
  );

  const textPng = await sharp(textBuffer, {
    raw: { width: textBufferWidth, height, channels: 4 },
  })
    .png()
    .toBuffer();

  compositeOps.push({
    input: textPng,
    left: textX,
    top: 0,
  });

  // Create badge
  let badge = await sharp({
    create: {
      width: totalWidth,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(compositeOps)
    .png()
    .toBuffer();

  // Scale using nearest neighbor for pixel art
  if (scale > 1) {
    const scaledWidth = Math.round(totalWidth * scale);
    const scaledHeight = Math.round(height * scale);
    badge = await sharp(badge)
      .resize(scaledWidth, scaledHeight, { kernel: 'nearest' })
      .png()
      .toBuffer();
  }

  return badge;
}

import sharp from 'sharp';
import path from 'path';
import { loadBMFont, renderText, getTextWidth } from './bmfont.js';

const ASSETS_PATH = path.join(process.cwd(), 'assets/badge-parts');

interface BadgeOptions {
  text: string;
  color: string; // hex color like "#3178C6"
  scale?: number; // output scale (1 = original, 2 = 2x, etc)
  logo?: string; // path to logo image (optional)
  textColor?: 'white' | 'black' | 'auto'; // text color (default: auto)
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface BadgePart {
  base: Buffer;
  border: Buffer;
  shadows: Buffer;
  highlights: Buffer;
  width: number;
  height: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h, s, l };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Generate shadow color (darker)
function getShadowColor(color: RGB): RGB {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 0.2));
}

// Generate highlight color (lighter)
function getHighlightColor(color: RGB): RGB {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return hslToRgb(hsl.h, hsl.s, Math.min(1, hsl.l + 0.2));
}

async function recolorImage(imagePath: string, targetColor: RGB): Promise<Buffer> {
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
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30) {
      const gray = r;

      // Shadow: black or dark gray (0-80)
      if (gray <= 80) {
        pixels[i] = shadowColor.r;
        pixels[i + 1] = shadowColor.g;
        pixels[i + 2] = shadowColor.b;
      }
      // Base: middle gray (81-200)
      else if (gray >= 81 && gray <= 200) {
        pixels[i] = targetColor.r;
        pixels[i + 1] = targetColor.g;
        pixels[i + 2] = targetColor.b;
      }
      // Highlight: white or light gray (201-255)
      else if (gray >= 201) {
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

async function loadPart(partName: 'left' | 'middle' | 'right', color: RGB): Promise<BadgePart> {
  const partPath = path.join(ASSETS_PATH, partName);

  // Recolor all layers (base, shadows, highlights have gray tones)
  const [base, border, shadows, highlights] = await Promise.all([
    recolorImage(path.join(partPath, 'base.png'), color),
    sharp(path.join(partPath, 'border.png')).png().toBuffer(), // border stays fixed
    recolorImage(path.join(partPath, 'shadows.png'), color),
    recolorImage(path.join(partPath, 'highlights.png'), color),
  ]);

  const metadata = await sharp(base).metadata();

  return {
    base,
    border,
    shadows,
    highlights,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

export async function generateBadge(options: BadgeOptions): Promise<Buffer> {
  const { text, color, scale = 1, logo, textColor: textColorOption = 'auto' } = options;
  const targetColor = hexToRgb(color);

  // Determine text color
  const getTextColor = (): RGB => {
    if (textColorOption === 'white') {
      return { r: 255, g: 255, b: 255 };
    }
    if (textColorOption === 'black') {
      return { r: 30, g: 30, b: 30 };
    }
    // Auto: Calculate based on background luminance
    const luminance = (0.299 * targetColor.r + 0.587 * targetColor.g + 0.114 * targetColor.b) / 255;
    return luminance > 0.5
      ? { r: 30, g: 30, b: 30 }   // dark text for light backgrounds
      : { r: 255, g: 255, b: 255 }; // white text for dark backgrounds
  };
  const textColor = getTextColor();

  // Load font
  const font = await loadBMFont();

  // Load logo if provided
  let logoBuffer: Buffer | null = null;
  let logoWidth = 0;
  let logoHeight = 0;
  if (logo) {
    logoBuffer = await sharp(logo).png().toBuffer();
    const logoMeta = await sharp(logoBuffer).metadata();
    logoWidth = logoMeta.width || 0;
    logoHeight = logoMeta.height || 0;
  }

  // Load all parts
  const [leftPart, middlePart, rightPart] = await Promise.all([
    loadPart('left', targetColor),
    loadPart('middle', targetColor),
    loadPart('right', targetColor),
  ]);

  const height = leftPart.height;

  // Calculate text width using BMFont
  const textWidth = getTextWidth(font, text);

  // Padding constants
  const PADDING = 2;

  // Middle section = padding + logo + gap + text + padding
  const LOGO_TEXT_GAP = 3;
  const logoSection = logoBuffer ? logoWidth + LOGO_TEXT_GAP : 0;
  const middleSectionWidth = PADDING + logoSection + textWidth + 2;

  // Total width
  const totalWidth = leftPart.width + middleSectionWidth + rightPart.width;

  // How many middle tiles we need
  const middleTileCount = Math.ceil(middleSectionWidth / middlePart.width);

  // Build composite operations
  const compositeOps: sharp.OverlayOptions[] = [];

  // Add left part layers
  compositeOps.push(
    { input: leftPart.base, left: 0, top: 0 },
    { input: leftPart.border, left: 0, top: 0 },
    { input: leftPart.shadows, left: 0, top: 0 },
    { input: leftPart.highlights, left: 0, top: 0 }
  );

  // Add middle tiles (to fill the middle section)
  for (let i = 0; i < middleTileCount; i++) {
    const x = leftPart.width + i * middlePart.width;
    compositeOps.push(
      { input: middlePart.base, left: x, top: 0 },
      { input: middlePart.border, left: x, top: 0 },
      { input: middlePart.shadows, left: x, top: 0 },
      { input: middlePart.highlights, left: x, top: 0 }
    );
  }

  // Add right part layers
  const rightX = leftPart.width + middleSectionWidth;
  compositeOps.push(
    { input: rightPart.base, left: rightX, top: 0 },
    { input: rightPart.border, left: rightX, top: 0 },
    { input: rightPart.shadows, left: rightX, top: 0 },
    { input: rightPart.highlights, left: rightX, top: 0 }
  );

  // Calculate positions
  const contentStartX = leftPart.width + PADDING;
  const logoX = contentStartX;
  const textX = contentStartX + logoSection;

  // Add logo if provided
  if (logoBuffer) {
    const logoY = Math.floor((height - logoHeight) / 2);
    compositeOps.push({
      input: logoBuffer,
      left: logoX,
      top: logoY,
    });
  }

  // Render text with BMFont
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

  // Add text
  compositeOps.push({
    input: textPng,
    left: textX,
    top: 0,
  });

  // Create the badge
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

  // Scale if needed (using nearest neighbor for pixel art)
  if (scale > 1) {
    const scaledWidth = totalWidth * scale;
    const scaledHeight = height * scale;
    badge = await sharp(badge)
      .resize(scaledWidth, scaledHeight, { kernel: 'nearest' })
      .png()
      .toBuffer();
  }

  return badge;
}

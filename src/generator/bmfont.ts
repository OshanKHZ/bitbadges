import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BMFontChar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
}

interface BMFont {
  chars: Map<number, BMFontChar>;
  lineHeight: number;
  base: number;
  scaleW: number;
  scaleH: number;
  texturePath: string;
  textureBuffer: Buffer | null;
}

// Cache disabled during development - re-enable for production
let cachedFont: BMFont | null = null;

function parseCharAttributes(charStr: string): BMFontChar {
  const attrs: Record<string, number> = {};
  const regex = /(\w+)="(-?\d+)"/g;
  let match;
  while ((match = regex.exec(charStr)) !== null) {
    attrs[match[1]] = parseInt(match[2], 10);
  }
  return {
    id: attrs.id,
    x: attrs.x,
    y: attrs.y,
    width: attrs.width,
    height: attrs.height,
    xoffset: attrs.xoffset,
    yoffset: attrs.yoffset,
    xadvance: attrs.xadvance,
  };
}

function parseCommonAttributes(commonStr: string): { lineHeight: number; base: number; scaleW: number; scaleH: number } {
  const attrs: Record<string, number> = {};
  const regex = /(\w+)="(-?\d+)"/g;
  let match;
  while ((match = regex.exec(commonStr)) !== null) {
    attrs[match[1]] = parseInt(match[2], 10);
  }
  return {
    lineHeight: attrs.lineHeight,
    base: attrs.base,
    scaleW: attrs.scaleW,
    scaleH: attrs.scaleH,
  };
}

export async function loadBMFont(xmlPath?: string): Promise<BMFont> {
  if (cachedFont) return cachedFont;

  const fontPath = xmlPath || path.join(__dirname, '../../assets/fonts/gameboy.xml');
  const fontDir = path.dirname(fontPath);

  const xmlContent = await fs.readFile(fontPath, 'utf-8');

  // Parse common attributes
  const commonMatch = xmlContent.match(/<common[^>]+>/);
  if (!commonMatch) throw new Error('Invalid BMFont: missing <common>');
  const common = parseCommonAttributes(commonMatch[0]);

  // Parse page (texture file)
  const pageMatch = xmlContent.match(/<page[^>]+file="([^"]+)"/);
  if (!pageMatch) throw new Error('Invalid BMFont: missing <page>');
  const texturePath = path.join(fontDir, pageMatch[1]);

  // Parse all chars
  const chars = new Map<number, BMFontChar>();
  const charRegex = /<char[^>]+>/g;
  let charMatch;
  while ((charMatch = charRegex.exec(xmlContent)) !== null) {
    const char = parseCharAttributes(charMatch[0]);
    chars.set(char.id, char);
  }

  // Load texture
  const textureBuffer = await fs.readFile(texturePath);

  cachedFont = {
    chars,
    lineHeight: common.lineHeight,
    base: common.base,
    scaleW: common.scaleW,
    scaleH: common.scaleH,
    texturePath,
    textureBuffer,
  };

  return cachedFont;
}

export function getTextWidth(font: BMFont, text: string): number {
  let width = 0;
  for (const char of text) {
    const charCode = char.charCodeAt(0);
    const charData = font.chars.get(charCode);
    if (charData) {
      width += charData.xadvance;
    }
  }
  return width;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

export async function renderText(
  font: BMFont,
  text: string,
  color: RGB,
  height: number
): Promise<{ buffer: Buffer; width: number }> {
  if (!font.textureBuffer) {
    throw new Error('Font texture not loaded');
  }

  const textWidth = getTextWidth(font, text);
  if (textWidth === 0) {
    // Empty text
    const emptyBuffer = Buffer.alloc(1 * height * 4, 0);
    return { buffer: emptyBuffer, width: 1 };
  }

  // Load the font texture
  const texture = sharp(font.textureBuffer);
  const { data: textureData, info: textureInfo } = await texture
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Create output buffer
  const outputBuffer = Buffer.alloc(textWidth * height * 4, 0);

  // Calculate vertical offset to center text
  // Find min yoffset and max total height (yoffset + height)
  let minYOffset = Infinity;
  let maxBottomY = 0;
  for (const char of text) {
    const charCode = char.charCodeAt(0);
    const charData = font.chars.get(charCode);
    if (charData) {
      if (charData.yoffset < minYOffset) minYOffset = charData.yoffset;
      const bottomY = charData.yoffset + charData.height;
      if (bottomY > maxBottomY) maxBottomY = bottomY;
    }
  }
  const textTotalHeight = maxBottomY - minYOffset;
  const baseOffsetY = Math.floor((height - textTotalHeight) / 2) - minYOffset;

  let cursorX = 0;

  for (const char of text) {
    const charCode = char.charCodeAt(0);
    const charData = font.chars.get(charCode);

    if (!charData) {
      // Skip unknown characters
      continue;
    }

    // Copy pixels from texture to output
    for (let row = 0; row < charData.height; row++) {
      for (let col = 0; col < charData.width; col++) {
        // Source position in texture
        const srcX = charData.x + col;
        const srcY = charData.y + row;
        const srcIdx = (srcY * textureInfo.width + srcX) * 4;

        // Destination position in output (use yoffset from BMFont for proper alignment)
        const dstX = cursorX + charData.xoffset + col;
        const dstY = baseOffsetY + charData.yoffset + row;

        // Bounds check
        if (dstX < 0 || dstX >= textWidth || dstY < 0 || dstY >= height) {
          continue;
        }

        const dstIdx = (dstY * textWidth + dstX) * 4;

        // Get alpha from texture (black text on white/transparent bg)
        const srcAlpha = textureData[srcIdx + 3];
        const srcR = textureData[srcIdx];
        const srcG = textureData[srcIdx + 1];
        const srcB = textureData[srcIdx + 2];

        // Check if pixel is dark (text) - black or near-black
        const isDark = srcR < 128 && srcG < 128 && srcB < 128;

        if (srcAlpha > 0 && isDark) {
          // Apply color
          outputBuffer[dstIdx] = color.r;
          outputBuffer[dstIdx + 1] = color.g;
          outputBuffer[dstIdx + 2] = color.b;
          outputBuffer[dstIdx + 3] = 255;
        }
      }
    }

    cursorX += charData.xadvance;
  }

  return { buffer: outputBuffer, width: textWidth };
}

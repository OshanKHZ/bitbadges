/**
 * Logo file utilities with path traversal protection
 */

import fs from 'fs';
import path from 'path';

import type { LogosMap } from '../types/index.js';
import { isValidLogoName, isValidFileName } from './validation.js';

const LOGOS_PATH = path.join(process.cwd(), 'assets/logos');

/**
 * Resolves the absolute logos directory path
 */
export function getLogosPath(): string {
  return LOGOS_PATH;
}

/**
 * Safely resolves a path and ensures it's within the logos directory
 * Prevents path traversal attacks
 */
function safePath(basePath: string, ...segments: string[]): string | null {
  const resolvedBase = path.resolve(basePath);
  const resolvedPath = path.resolve(basePath, ...segments);

  // Ensure the resolved path starts with the base path
  if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
    return null;
  }

  return resolvedPath;
}

/**
 * Finds the logo file path with security validation
 * Returns undefined if logo not found or path is invalid
 */
export function findLogoPath(
  logoName: string,
  logoColor?: string
): string | undefined {
  // Validate logo name to prevent path traversal
  if (!isValidLogoName(logoName)) {
    return undefined;
  }

  const logoDir = safePath(LOGOS_PATH, logoName);
  if (!logoDir || !fs.existsSync(logoDir)) {
    return undefined;
  }

  // Validate logoColor if provided
  if (logoColor && !isValidLogoName(logoColor)) {
    return undefined;
  }

  // Try to find logo with specific color first
  if (logoColor) {
    const coloredLogoPath = safePath(logoDir, `${logoName}-${logoColor}.png`);
    if (coloredLogoPath && fs.existsSync(coloredLogoPath)) {
      return coloredLogoPath;
    }
  }

  // Fallback to default logo
  const defaultLogoPath = safePath(logoDir, `${logoName}.png`);
  if (defaultLogoPath && fs.existsSync(defaultLogoPath)) {
    return defaultLogoPath;
  }

  // Try to find any valid png in the directory
  try {
    const files = fs.readdirSync(logoDir);
    const pngFile = files.find(
      (f) => f.endsWith('.png') && isValidFileName(f)
    );
    if (pngFile) {
      const pngPath = safePath(logoDir, pngFile);
      if (pngPath) {
        return pngPath;
      }
    }
  } catch {
    // Directory read failed
  }

  return undefined;
}

/**
 * Lists all available logos and their variants
 */
export function listLogos(): LogosMap {
  const logos: LogosMap = {};

  try {
    const entries = fs.readdirSync(LOGOS_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || !isValidLogoName(entry.name)) {
        continue;
      }

      const dirPath = safePath(LOGOS_PATH, entry.name);
      if (!dirPath) continue;

      try {
        const files = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('.png') && isValidFileName(f))
          .map((f) => f.replace('.png', ''));

        logos[entry.name] = files;
      } catch {
        // Skip directories that can't be read
      }
    }
  } catch {
    // Return empty if logos directory doesn't exist
  }

  return logos;
}

/**
 * Gets list of available logo names
 */
export function getAvailableLogoNames(): string[] {
  try {
    return fs
      .readdirSync(LOGOS_PATH, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && isValidLogoName(entry.name))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

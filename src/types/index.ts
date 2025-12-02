/**
 * Shared type definitions for BitBadges
 */

// ============================================================================
// Color Types
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// ============================================================================
// Badge Types
// ============================================================================

export type TextColorOption = 'white' | 'black' | 'auto';

export interface BadgeOptions {
  text: string;
  color: string;
  scale?: number;
  logo?: string;
  textColor?: TextColorOption;
}

export interface BadgePart {
  base: Buffer;
  border: Buffer;
  shadows: Buffer;
  highlights: Buffer;
  width: number;
  height: number;
}

// ============================================================================
// BMFont Types
// ============================================================================

export interface BMFontChar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
}

export interface BMFont {
  chars: Map<number, BMFontChar>;
  lineHeight: number;
  base: number;
  scaleW: number;
  scaleH: number;
  texturePath: string;
  textureBuffer: Buffer | null;
}

// ============================================================================
// API Types
// ============================================================================

export interface LogosMap {
  [key: string]: string[];
}

export interface APIInfo {
  name: string;
  version: string;
  endpoints: {
    badge: {
      url: string;
      params: Record<string, string>;
      query: Record<string, string>;
    };
    logos: {
      url: string;
      description: string;
    };
  };
  examples: string[];
}

// ============================================================================
// Constants
// ============================================================================

export type ScalePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const SCALE_PRESETS: Record<ScalePreset, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
} as const;

export const BADGE_CONSTANTS = {
  PADDING: 2,
  LOGO_TEXT_GAP: 3,
  SCALE_MIN: 1,
  SCALE_MAX: 8,
  SCALE_DEFAULT: 2,
  TEXT_MAX_LENGTH: 100,
} as const;

export const COLOR_THRESHOLDS = {
  SHADOW_MAX: 80,
  BASE_MIN: 81,
  BASE_MAX: 200,
  HIGHLIGHT_MIN: 201,
} as const;

/**
 * Color Utility Functions
 *
 * This module provides comprehensive color conversion and manipulation utilities
 * for working with RGBA and HSLA color formats. It handles parsing, conversion,
 * and formatting of colors in various formats used throughout the application.
 */

/**
 * Converts HSLA (Hue, Saturation, Lightness, Alpha) to RGBA (Red, Green, Blue, Alpha)
 *
 * @param h - Hue value (0-360 degrees)
 * @param s - Saturation percentage (0-100)
 * @param l - Lightness percentage (0-100)
 * @param _a - Alpha value (0-1) - parameter exists for signature but not used in conversion
 * @returns Object containing r, g, b values (0-255)
 */
export function hslaToRgba(
  h: number,
  s: number,
  l: number,
  _a: number
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Converts RGBA (Red, Green, Blue, Alpha) to HSLA (Hue, Saturation, Lightness, Alpha)
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Object containing h (0-360), s (0-100), l (0-100)
 */
export function rgbaToHsla(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts a color string in "R, G, B, A" format to CSS rgba() format
 * Also handles already-formatted rgba() strings
 *
 * @param color - Color string in "R, G, B, A" or "R, G, B" format
 * @returns CSS rgba() formatted string
 *
 * @example
 * rgbaString("255, 128, 0, 0.5") // returns "rgba(255, 128, 0, 0.5)"
 * rgbaString("255, 128, 0") // returns "rgba(255, 128, 0, 1)"
 */
export function rgbaString(color: string): string {
  const match = color.match(/^(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$/);
  if (match) {
    const [r, g, b, a] = [match[1], match[2], match[3], match[4] ?? "1"];
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
}

/**
 * Parses an RGBA color string and returns individual color components
 * Supports both "R, G, B, A" format and rgba() CSS format
 *
 * @param color - Color string to parse
 * @returns Object with r, g, b (0-255), and a (0-1) values
 */
export function parseRgba(color: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  // Try parsing "R, G, B, A" format
  const commaMatch = color.match(/^(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$/);
  if (commaMatch) {
    return {
      r: parseInt(commaMatch[1]),
      g: parseInt(commaMatch[2]),
      b: parseInt(commaMatch[3]),
      a: commaMatch[4] ? parseFloat(commaMatch[4]) : 1,
    };
  }

  // Try parsing rgba() format
  const rgbaMatch = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Default fallback
  return { r: 255, g: 255, b: 255, a: 1 };
}

/**
 * Normalizes a color value to valid CSS format
 * Detects various color formats and converts comma-separated RGB values to rgba()
 *
 * @param val - Color string in various formats
 * @returns CSS-compatible color string
 *
 * @example
 * toCssColor("255, 128, 0") // returns "rgba(255, 128, 0, 1)"
 * toCssColor("#FF8000") // returns "#FF8000"
 * toCssColor("hsl(30, 100%, 50%)") // returns "hsl(30, 100%, 50%)"
 */
export function toCssColor(val: string): string {
  const trimmed = (val || "").trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  const looksLikeCss =
    lower.startsWith("#") ||
    lower.startsWith("rgb") ||
    lower.startsWith("hsl") ||
    lower.startsWith("var(") ||
    lower.includes("gradient");

  if (looksLikeCss) return trimmed;

  // Matches "R, G, B" or "R, G, B, A"
  const rgbaList = /^\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?$/;
  if (rgbaList.test(trimmed)) return `rgba(${trimmed})`;

  return trimmed; // Fallback: leave as-is
}

/**
 * Formats RGBA values into the "R, G, B, A" string format
 * Used for storing color values in the application state
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @param a - Alpha value (0-1)
 * @returns Formatted color string "R, G, B, A"
 */
export function formatRgbaString(
  r: number,
  g: number,
  b: number,
  a: number
): string {
  return `${r}, ${g}, ${b}, ${a}`;
}

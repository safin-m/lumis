/**
 * Constants for glass effect library
 * Defines selectors, color matrices, and configuration type definitions
 */

/**
 * DOM Selectors for elements and SVG filter primitives
 * Used for querying DOM and caching filter element references
 */
export const SELECTORS = {
  /** Auto-initialization selector for HTML elements with data-glass-effect attribute */
  GLASS_EFFECT: "[data-glass-effect]",

  /** SVG feImage element - loads the displacement map */
  FE_IMAGE: ".fe-image",

  /** Red channel displacement map - controls horizontal distortion */
  RED_CHANNEL: ".red-channel",

  /** Green channel displacement map - center channel for chromatic aberration */
  GREEN_CHANNEL: ".green-channel",

  /** Blue channel displacement map - controls vertical distortion */
  BLUE_CHANNEL: ".blue-channel",

  /** Output blur filter - smooths final aberrated result */
  OUTPUT_BLUR: ".output-blur",

  /** Edge intensity calculation - used for edge mask generation */
  EDGE_INTENSITY: ".edge-intensity",

  /** Edge mask - isolates edges for selective aberration */
  EDGE_MASK: ".edge-mask",

  /** Inverted edge mask - keeps center clean and sharp */
  INVERTED_MASK: ".inverted-mask",
};

/**
 * Color transformation matrices for chromatic aberration
 * Each matrix extracts a single RGB channel while preserving alpha
 *
 * Matrix format (5x4 row-major):
 * R' = R*m00 + G*m01 + B*m02 + A*m03 + m04
 * G' = R*m10 + G*m11 + B*m12 + A*m13 + m14
 * B' = R*m20 + G*m21 + B*m22 + A*m23 + m24
 * A' = R*m30 + G*m31 + B*m32 + A*m33 + m34
 */
export const COLOR_MATRICES = {
  /** Extract red channel only (R=1, G=0, B=0, preserve alpha) */
  RED: "1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0",

  /** Extract green channel only (R=0, G=1, B=0, preserve alpha) */
  GREEN: "0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 0 0 1 0",

  /** Extract blue channel only (R=0, G=0, B=1, preserve alpha) */
  BLUE: "0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 0 1 0",
};

/**
 * Configuration type definitions for data attribute parsing
 * Groups config properties by data type for proper conversion from HTML strings
 */
export const CONFIG_TYPES = {
  /** Integer configuration properties */
  INT: ["scale", "radius", "blur", "lightness", "r", "g", "b"],

  /** Float/decimal configuration properties */
  FLOAT: ["frost", "saturation", "displace", "border", "alpha"],

  /** String configuration properties */
  STRING: ["blend", "x", "y"],

  /** Warp effect integer properties */
  WARP_INT: ["angle"],

  /** Warp effect float properties */
  WARP_FLOAT: ["intensity"],

  /** Warp effect string properties */
  WARP_STRING: ["color"],

  /** Shine effect integer properties */
  SHINE_INT: ["angle", "spread"],

  /** Shine effect float properties */
  SHINE_FLOAT: ["intensity"],

  /** Shine effect string properties */
  SHINE_STRING: ["type", "color"],

  /** Hover effect float properties */
  HOVER_FLOAT: ["borderWidth", "scale", "duration"],

  /** Hover effect string properties */
  HOVER_STRING: ["borderColor", "easing"],
};

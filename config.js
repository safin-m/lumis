import { CONFIG_TYPES } from "./constants.js";

/**
 * Base configuration for glass effect
 * All parameters can be overridden when creating a new GlassEffect instance
 */
export const baseConfig = {
  // ===== Core Glass Effect =====

  /** Displacement scale - negative for standard mode, positive for shader mode
   * Range: -200 to 200
   * Default: -180 (strong inward distortion) */
  scale: -180,

  /** Border radius in pixels - rounds corners of glass effect
   * Range: 0-100
   * Default: 16 */
  radius: 16,

  /** Frosted glass opacity - adds white semi-transparent background
   * Range: 0-1 (0=clear, 1=fully frosted)
   * Default: 0 (no frost) */
  frost: 0,

  /** Backdrop saturation multiplier - adjusts color vibrancy
   * Range: 0-200 (0=grayscale, 1=normal, 2=super saturated)
   * Default: 1 (normal colors) */
  saturation: 1,

  /** Backdrop blur amount - creates frosted glass effect
   * Formula: backdropBlur * 32 pixels (or backdropBlur * 32 + 12 with overLight)
   * Range: 0-1 (0=no blur, 0.002=very slight, 0.5=strong blur)
   * Default: 0 (no blur) */
  backdropBlur: 1,

  /** Over-light mode - enhances blur (+12px) and adds extra light overlays
   * Default: false */
  overLight: false,

  // ===== Advanced Display Modes =====

  /** Display mode - changes displacement map generation method
   * "standard" = SVG gradients with blend modes
   * "shader" = CPU-generated liquid glass effect
   * Default: "standard" */
  mode: "standard",

  /** Edge mask - applies chromatic aberration only at edges
   * Keeps center clean and sharp, useful for readable content
   * Default: false */
  edgeMask: true,

  /** Preserve center distortion when using edge mask
   * When true, the center retains the displacement effect
   * When false, only edges have aberration and center stays undistorted
   * Default: false */
  edgeMaskPreserveDistortion: true,
  /** Use arithmetic blending for edge mask compositing
   * Creates a unique additive effect, experimental
   * Default: false */
  edgeMaskArithmeticBlend: false,
  /** Edge mask strength - controls how much aberration at edges
   * Range: 2-10 (higher = stronger edge effect)
   * Default: 2 */
  aberrationIntensity: 2,

  // ===== Mouse Interactions =====

  interactions: {
    /** Enable elastic mouse interactions with physics-based transformations
     * Default: true */
    enabled: true,

    /** Movement responsiveness - how quickly element follows mouse
     * Range: 0-1 (lower = smoother/slower)
     * Default: 0.15 */
    elasticity: 0.15,

    /** Activation zone distance in pixels from element edge
     * Mouse must be within this distance to activate interactions
     * Default: 200 */
    activationZone: 200,
  },

  // ===== Overlay System =====

  overlays: {
    /** Enable all overlay layers (borders, hover effects, extra overlay)
     * Default: true */
    enabled: true,

    /** Advanced multi-layer borders with blend modes
     * Default: true */
    advancedBorder: true,

    /** Border color in RGBA format: "R, G, B, A"
     * Example: "255, 255, 255, 1" = opaque white
     * Example: "100, 200, 255, 0.8" = semi-transparent blue
     * Default: "255, 255, 255, 1" */
    borderColor: "255, 255, 255, 1",

    /** Border thickness in pixels
     * Range: 0.5-5
     * Default: 1.5 */
    borderThickness: 1.5,

    /** Hover light color in RGBA format: "R, G, B, A"
     * If not set, defaults to borderColor
     * Default: "255, 255, 255, 1" */
    hoverLightColor: "255, 255, 255, 1",

    /** Hover light angle in degrees
     * 0° = top, 90° = right, 180° = bottom, 270° = left
     * Range: 0-360
     * Default: 0 */
    hoverLightAngle: 0,

    /** Hover light intensity - multiplies the alpha channel
     * Range: 0-1 (0=invisible, 1=full intensity)
     * Default: 1 */
    hoverLightIntensity: 1,

    /** First hover overlay opacity (tighter gradient)
     * Range: 0-1 (0=invisible, 1=fully opaque)
     * Default: 0.5 */
    hoverOverlay1Opacity: 0.5,

    /** Second hover overlay opacity (wider gradient)
     * Range: 0-1 (0=invisible, 1=fully opaque)
     * Default: 0 */
    hoverOverlay2Opacity: 0,

    /** Extra overlay layer - custom gradient or color on top of everything */
    extraOverlay: {
      /** Enable extra overlay
       * Default: true */
      enabled: false,

      /** CSS background value - can be gradient, solid color, or image
       * Example: "radial-gradient(circle, rgba(255,0,255,0.4), transparent)"
       * Example: "linear-gradient(135deg, red, blue)"
       * Example: "rgba(255, 100, 50, 0.3)"
       * Default: purple-magenta radial gradient */
      background:
        "radial-gradient(circle at center, rgba(186, 85, 211, 0.4) 0%, rgba(255, 0, 255, 0.3) 100%)",

      /** Overlay opacity
       * Range: 0-1
       * Default: 1 */
      opacity: 1,

      /** CSS mix-blend-mode for blending with borders
       * "color" = tints borders while preserving luminance (recommended)
       * "hue" = changes border hue
       * "overlay" = combines multiply and screen
       * "screen" = lightens
       * Default: "color" */
      blendMode: "color",
    },
  },

  // ===== Displacement Map =====

  /** Border fade amount - controls edge softness
   * Range: 0-1 (0=no fade, 1=maximum fade)
   * Default: 0.07 */
  border: 0.07,

  /** Center area lightness - HSL lightness value
   * Range: 0-100 (0=black, 50=gray, 100=white)
   * Default: 50 */
  lightness: 50,

  /** Center area opacity
   * Range: 0-1
   * Default: 0.93 */
  alpha: 0.93,

  /** Center blur amount - softens distortion edges
   * Range: 0-50 pixels
   * Default: 11 */
  blur: 11,

  /** Output blur after displacement - smooths final result
   * Range: 0-10 pixels
   * Default: 0 (no smoothing) */
  displace: 0,

  /** Blend mode for displacement gradients
   * Default: "difference" */
  blend: "difference",

  // ===== Chromatic Aberration =====

  /** X-axis channel selector - which color channel controls horizontal displacement
   * Options: "R", "G", "B"
   * Default: "R" */
  x: "R",

  /** Y-axis channel selector - which color channel controls vertical displacement
   * Options: "R", "G", "B"
   * Default: "B" */
  y: "B",

  /** Red channel offset - added to base scale
   * Default: 0 */
  r: 0,

  /** Green channel offset - added to base scale
   * Default: 10 */
  g: 10,

  /** Blue channel offset - added to base scale
   * Default: 20 */
  b: 20,

  // ===== Warp Effect =====

  warp: {
    /** Gradient angle in degrees
     * Range: 0-360
     * Default: 195 */
    angle: 195,

    /** Warp visibility/intensity
     * Range: 0-1 (0=disabled, 1=full intensity)
     * Default: 0 (disabled) */
    intensity: 0,

    /** CSS color value
     * Default: transparent orange */
    color: "rgba(255, 221, 153, 1)",
  },

  // ===== Shine Effect =====

  shine: {
    /** Light direction in degrees
     * Range: 0-360
     * Default: 135 */
    angle: 135,

    /** Effect strength
     * Range: 0-1 (0=disabled, 1=full intensity)
     * Default: 0.4 */
    intensity: 0.4,

    /** CSS color value
     * Default: semi-transparent yellow */
    color: "hsla(0, 100%, 74%, 0.29)",

    /** Light spread/falloff in pixels
     * Range: 0-100
     * Default: 40 */
    spread: 40,

    /** Rendering type
     * "shadow" = inset box-shadow
     * "gradient" = linear gradient background
     * Default: "shadow" */
    type: "shadow",
  },

  // ===== Hover Effects =====

  hover: {
    /** Hover border thickness in pixels
     * Range: 0-10
     * Default: 1 */
    borderWidth: 1,

    /** CSS border color
     * Default: white */
    borderColor: "hsl(0, 0%, 100%)",

    /** Scale multiplier on hover
     * Range: 0.5-2 (1=no change, >1=grow, <1=shrink)
     * Default: 1. */
    scale: 1,

    /** Transition duration in seconds
     * Default: 0.3 */
    duration: 0.3,

    /** CSS easing function
     * Default: "ease-in-out" */
    easing: "ease-in-out",
  },
};

/**
 * Generates a unique ID for SVG filter elements
 * Uses random string to prevent conflicts when multiple instances exist
 *
 * @returns {string} Unique filter ID (e.g., "glass-filter-a3k2m9x4l")
 */
export const generateUniqueId = () =>
  `glass-filter-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Capitalizes the first letter of a string
 * Used for converting config keys to data attribute format
 *
 * @param {string} str - Input string
 * @returns {string} String with first letter capitalized
 * @example capitalizeFirstLetter("borderColor") => "BorderColor"
 */
export const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Parses configuration from HTML data attributes
 * Converts data-glass-* attributes to config object with proper type conversion
 *
 * Supported data attribute format:
 * - data-glass-backdrop-blur="0.15" → backdropBlur: 0.15
 * - data-glass-warp-angle="180" → warp: { angle: 180 }
 * - data-glass-shine-intensity="0.5" → shine: { intensity: 0.5 }
 *
 * @param {HTMLElement} element - DOM element with data-glass-* attributes
 * @returns {Object} Parsed configuration object
 * @example
 * <div data-glass-backdrop-blur="0.15" data-glass-warp-angle="180"></div>
 * parseDatasetConfig(element) => { backdropBlur: 0.15, warp: { angle: 180 } }
 */
export const parseDatasetConfig = (element) => {
  const config = {};
  const { dataset } = element;

  // Parse integer values (scale, radius, blur, etc.)
  CONFIG_TYPES.INT.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = parseInt(dataset[dataKey], 10);
    }
  });

  // Parse float values (frost, saturation, border, etc.)
  CONFIG_TYPES.FLOAT.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = parseFloat(dataset[dataKey]);
    }
  });

  // Parse string values (blend, x, y channel selectors, etc.)
  CONFIG_TYPES.STRING.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = dataset[dataKey];
    }
  });

  // Parse warp settings (nested object)
  const warp = {};
  CONFIG_TYPES.WARP_INT.forEach((key) => {
    const dataKey = `glassWarp${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      warp[key] = parseInt(dataset[dataKey], 10);
    }
  });
  CONFIG_TYPES.WARP_FLOAT.forEach((key) => {
    const dataKey = `glassWarp${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      warp[key] = parseFloat(dataset[dataKey]);
    }
  });
  CONFIG_TYPES.WARP_STRING.forEach((key) => {
    const dataKey = `glassWarp${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      warp[key] = dataset[dataKey];
    }
  });
  if (Object.keys(warp).length > 0) {
    config.warp = warp;
  }

  // Parse shine settings (nested object)
  const shine = {};
  CONFIG_TYPES.SHINE_INT.forEach((key) => {
    const dataKey = `glassShine${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      shine[key] = parseInt(dataset[dataKey], 10);
    }
  });
  CONFIG_TYPES.SHINE_FLOAT.forEach((key) => {
    const dataKey = `glassShine${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      shine[key] = parseFloat(dataset[dataKey]);
    }
  });
  CONFIG_TYPES.SHINE_STRING.forEach((key) => {
    const dataKey = `glassShine${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      shine[key] = dataset[dataKey];
    }
  });
  if (Object.keys(shine).length > 0) {
    config.shine = shine;
  }

  // Parse hover settings (nested object)
  const hover = {};
  CONFIG_TYPES.HOVER_FLOAT.forEach((key) => {
    const dataKey = `glassHover${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      hover[key] = parseFloat(dataset[dataKey]);
    }
  });
  CONFIG_TYPES.HOVER_STRING.forEach((key) => {
    const dataKey = `glassHover${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      hover[key] = dataset[dataKey];
    }
  });
  if (Object.keys(hover).length > 0) {
    config.hover = hover;
  }

  return config;
};

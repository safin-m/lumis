/**
 * Application Constants
 *
 * This module contains all constant values used throughout the application,
 * including lorem ipsum text, default configuration values, and other static data.
 */

import type { DemoConfig } from "@/types/glass-config";

/**
 * Collection of Lorem Ipsum paragraphs for demo content
 * Used to populate the background text when showLoremIpsum is enabled
 */
export const LOREM_IPSUM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.",
];

/**
 * Default initial configuration for the glass effect demo
 * Contains all parameters for the glass effect including visual properties,
 * interactions, overlays, and hover effects
 */
export const INITIAL_CONFIG: DemoConfig = {
  // Basic glass effect parameters
  scale: -180,
  radius: 16,
  frost: 0,
  saturation: 1,
  backdropBlur: 1,
  overLight: false,
  mode: "standard",

  // Shader mode parameters
  shaderEdgeFadeStart: 0.8,
  shaderEdgeFadeOffset: 0.15,
  shaderCornerRadius: 0.3,
  shaderWidthFactor: 0.2,
  shaderHeightFactor: 0.6,
  shaderEdgeDistanceDivisor: 2,

  // Edge mask settings
  edgeMask: true,
  edgeMaskPreserveDistortion: true,
  edgeMaskArithmeticBlend: false,

  // Interaction settings
  interactions: {
    enabled: true,
    elasticity: 0.15,
    activationZone: 200,
  },

  // Overlay configurations
  overlays: {
    enabled: true,
    advancedBorder: true,
    borderColor: "255, 255, 255, 1",
    borderThickness: 1.5,
    hoverLightColor: "255, 255, 255, 1",
    hoverLightAngle: 0,
    hoverLightIntensity: 1,
    hoverOverlay1Opacity: 0.5,
    hoverOverlay2Opacity: 0,
    hoverOverlay1LightColor: "255, 255, 255, 1",
    hoverOverlay2LightColor: "255, 255, 255, 1",
    hoverOverlay1Angle: 0,
    hoverOverlay2Angle: 0,
    hoverOverlayBlendMode: "overlay",
    extraOverlay: {
      enabled: false,
      background:
        "radial-gradient(circle at center, rgba(186, 85, 211, 0.4) 0%, rgba(255, 0, 255, 0.3) 100%)",
      opacity: 1,
      blendMode: "color",
    },
  },

  // Visual effect parameters
  border: 0.07,
  lightness: 50,
  alpha: 0.93,
  blur: 11,
  displace: 0,
  blend: "difference",

  // Color displacement channels
  x: "R",
  y: "B",
  r: 0,
  g: 10,
  b: 20,

  // Warp effect settings
  warp: {
    angle: 195,
    intensity: 0,
    color: "255, 221, 153, 1",
  },

  // Shine/shadow effect settings
  shine: {
    angle: 135,
    intensity: 0.4,
    color: "189, 112, 112, 0.29",
    spread: 40,
    type: "shadow",
  },

  // Hover state configuration
  hover: {
    borderWidth: 1,
    borderColor: "hsl(0, 0%, 100%)",
    scale: 1,
    duration: 0.3,
    easing: "ease-in-out",
    borderGradient: {
      startBase: 33,
      startOffsetMultiplier: 0.3,
      endBase: 66,
      endOffsetMultiplier: 0.4,
      opacityBase: 0.12,
      opacityMultiplier: 0.008,
      peakOpacityBase: 0.4,
      peakOpacityMultiplier: 0.012,
      secondaryBoost: 0.2,
      angleBase: 135,
      angleMultiplier: 1.2,
    },
  },

  // Glass object dimensions
  width: 400,
  height: 300,
  text: "",

  // Demo-specific settings
  backgroundImage: "https://picsum.photos/1920/1080?random=1",
  showLoremIpsum: false,
  loremIpsumColor: "255, 255, 255, 0.8",
  loremIpsumFontSize: 18,
  loremIpsumParagraphs: 3,
};

/**
 * Default position for the glass object
 */
export const DEFAULT_POSITION = { x: 200, y: 200 };

/**
 * Glass Effect Configuration Types
 *
 * This module defines the TypeScript interfaces for configuring
 * the glass effect library. These types provide comprehensive
 * control over all visual and behavioral aspects of the effect.
 */

/**
 * GlassConfig defines the core configuration for the glass effect
 * This interface contains all the parameters needed to create
 * and customize a glass effect on a DOM element
 */
export interface GlassConfig {
  /** Scale of the glass effect (-360 to 360) */
  scale: number;

  /** Border radius in pixels */
  radius: number;

  /** Frost intensity (0-1) */
  frost: number;

  /** Color saturation multiplier (0-2) */
  saturation: number;

  /** Backdrop blur amount (0-1) */
  backdropBlur: number;

  /** Whether to use over-light mode for bright backgrounds */
  overLight: boolean;

  /** Rendering mode: 'standard' or 'shader' */
  mode: "standard" | "shader";

  // Shader mode parameters
  /** Edge fade start position in shader mode (0-1) */
  shaderEdgeFadeStart: number;

  /** Edge fade offset in shader mode (0-1) */
  shaderEdgeFadeOffset: number;

  /** Corner radius in shader mode (0-1) */
  shaderCornerRadius: number;

  /** Width scaling factor for shader (0-1) */
  shaderWidthFactor: number;

  /** Height scaling factor for shader (0-1) */
  shaderHeightFactor: number;

  /** Edge distance divisor for shader calculations */
  shaderEdgeDistanceDivisor: number;

  /** Whether to apply edge masking */
  edgeMask: boolean;

  /** Preserve distortion when edge masking */
  edgeMaskPreserveDistortion: boolean;

  /** Use arithmetic blending for edge mask */
  edgeMaskArithmeticBlend: boolean;

  /** Interaction configuration */
  interactions: {
    /** Enable/disable interactive mouse effects */
    enabled: boolean;

    /** Elasticity of the interactive response (0-1) */
    elasticity: number;

    /** Distance in pixels for activation zone */
    activationZone: number;
  };

  /** Overlay and border configuration */
  overlays: {
    /** Enable/disable overlay effects */
    enabled: boolean;

    /** Use advanced border rendering */
    advancedBorder: boolean;

    /** Border color in "R, G, B, A" format */
    borderColor: string;

    /** Border thickness in pixels */
    borderThickness: number;

    /** Hover light color in "R, G, B, A" format */
    hoverLightColor: string;

    /** Hover light angle in degrees */
    hoverLightAngle: number;

    /** Hover light intensity (0-1) */
    hoverLightIntensity: number;

    /** First hover overlay opacity (0-1) */
    hoverOverlay1Opacity: number;

    /** Second hover overlay opacity (0-1) */
    hoverOverlay2Opacity: number;

    /** First hover overlay light color */
    hoverOverlay1LightColor: string;

    /** Second hover overlay light color */
    hoverOverlay2LightColor: string;

    /** First overlay angle */
    hoverOverlay1Angle: number;

    /** Second overlay angle */
    hoverOverlay2Angle: number;

    /** Blend mode for hover overlays */
    hoverOverlayBlendMode: string;

    /** Additional overlay configuration */
    extraOverlay: {
      /** Enable extra overlay */
      enabled: boolean;

      /** Background CSS value (color or gradient) */
      background: string;

      /** Overlay opacity (0-1) */
      opacity: number;

      /** CSS blend mode */
      blendMode: string;

      /** Optional gradient configuration */
      gradient?: {
        color1: string;
        color2: string;
        angle: number;
        type: "radial" | "linear";
      };
    };
  };

  /** Border effect intensity */
  border: number;

  /** Overall lightness adjustment */
  lightness: number;

  /** Alpha transparency (0-1) */
  alpha: number;

  /** Blur amount */
  blur: number;

  /** Displacement amount */
  displace: number;

  /** CSS blend mode */
  blend: string;

  /** X-axis displacement channel mapping */
  x: "R" | "G" | "B";

  /** Y-axis displacement channel mapping */
  y: "R" | "G" | "B";

  /** Red channel offset */
  r: number;

  /** Green channel offset */
  g: number;

  /** Blue channel offset */
  b: number;

  /** Warp effect configuration */
  warp: {
    /** Warp angle in degrees */
    angle: number;

    /** Warp intensity */
    intensity: number;

    /** Warp color in "R, G, B, A" format */
    color: string;
  };

  /** Shine/shadow effect configuration */
  shine: {
    /** Light angle in degrees */
    angle: number;

    /** Effect intensity (0-1) */
    intensity: number;

    /** Effect color in "R, G, B, A" format */
    color: string;

    /** Spread distance in pixels */
    spread: number;

    /** Effect type */
    type: "shadow" | "gradient";
  };

  /** Hover state configuration */
  hover: {
    /** Border width on hover */
    borderWidth: number;

    /** Border color on hover (CSS format) */
    borderColor: string;

    /** Scale multiplier on hover */
    scale: number;

    /** Transition duration in seconds */
    duration: number;

    /** CSS easing function */
    easing: string;

    /** Border gradient animation parameters */
    borderGradient: {
      startBase: number;
      startOffsetMultiplier: number;
      endBase: number;
      endOffsetMultiplier: number;
      opacityBase: number;
      opacityMultiplier: number;
      peakOpacityBase: number;
      peakOpacityMultiplier: number;
      secondaryBoost: number;
      angleBase: number;
      angleMultiplier: number;
    };
  };

  /** Glass object width in pixels */
  width: number;

  /** Glass object height in pixels */
  height: number;
}

/**
 * DemoConfig extends GlassConfig with demo-specific properties
 * These additional properties are used only in the interactive demo
 * and are not part of the core glass effect configuration
 */
export interface DemoConfig extends GlassConfig {
  /** Optional text to display inside the glass object */
  text: string;

  /** Background image URL for the demo */
  backgroundImage: string;

  /** Whether to show lorem ipsum text content */
  showLoremIpsum: boolean;

  /** Color for lorem ipsum text in "R, G, B, A" format */
  loremIpsumColor: string;

  /** Font size for lorem ipsum text */
  loremIpsumFontSize: number;

  /** Number of lorem ipsum paragraphs to display */
  loremIpsumParagraphs: number;
}

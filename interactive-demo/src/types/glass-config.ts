export interface GlassConfig {
  scale: number;
  radius: number;
  frost: number;
  saturation: number;
  backdropBlur: number;
  overLight: boolean;
  mode: "standard" | "shader";

  // Shader mode parameters
  shaderEdgeFadeStart: number;
  shaderEdgeFadeOffset: number;
  shaderCornerRadius: number;
  shaderWidthFactor: number;
  shaderHeightFactor: number;
  shaderEdgeDistanceDivisor: number;

  edgeMask: boolean;
  edgeMaskPreserveDistortion: boolean;
  edgeMaskArithmeticBlend: boolean;

  interactions: {
    enabled: boolean;
    elasticity: number;
    activationZone: number;
  };

  overlays: {
    enabled: boolean;
    advancedBorder: boolean;
    borderColor: string;
    borderThickness: number;
    hoverLightColor: string;
    hoverLightAngle: number;
    hoverLightIntensity: number;
    hoverOverlay1Opacity: number;
    hoverOverlay2Opacity: number;
    hoverOverlay1LightColor: string;
    hoverOverlay2LightColor: string;
    hoverOverlay1Angle: number;
    hoverOverlay2Angle: number;
    hoverOverlayBlendMode: string;
    extraOverlay: {
      enabled: boolean;
      background: string;
      opacity: number;
      blendMode: string;
      gradient?: {
        color1: string;
        color2: string;
        angle: number;
        type: "radial" | "linear";
      };
    };
  };

  border: number;
  lightness: number;
  alpha: number;
  blur: number;
  displace: number;
  blend: string;

  x: "R" | "G" | "B";
  y: "R" | "G" | "B";
  r: number;
  g: number;
  b: number;

  warp: {
    angle: number;
    intensity: number;
    color: string;
  };

  shine: {
    angle: number;
    intensity: number;
    color: string;
    spread: number;
    type: "shadow" | "gradient";
  };

  hover: {
    borderWidth: number;
    borderColor: string;
    scale: number;
    duration: number;
    easing: string;
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

  width: number;
  height: number;
}

export interface DemoConfig extends GlassConfig {
  text: string;
  backgroundImage: string;
  showLoremIpsum: boolean;
  loremIpsumColor: string;
  loremIpsumFontSize: number;
  loremIpsumParagraphs: number;
}

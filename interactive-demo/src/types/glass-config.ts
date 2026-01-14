export interface GlassConfig {
  scale: number;
  radius: number;
  frost: number;
  saturation: number;
  backdropBlur: number;
  overLight: boolean;
  mode: "standard" | "shader";
  edgeMask: boolean;
  edgeMaskPreserveDistortion: boolean;
  edgeMaskArithmeticBlend: boolean;
  aberrationIntensity: number;

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
    extraOverlay: {
      enabled: boolean;
      background: string;
      opacity: number;
      blendMode: string;
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

// DOM Selectors
export const SELECTORS = {
  GLASS_EFFECT: "[data-glass-effect]",
  FE_IMAGE: ".fe-image",
  RED_CHANNEL: ".red-channel",
  GREEN_CHANNEL: ".green-channel",
  BLUE_CHANNEL: ".blue-channel",
  OUTPUT_BLUR: ".output-blur",
};

// Color transformation matrices for chromatic aberration
export const COLOR_MATRICES = {
  RED: "1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0",
  GREEN: "0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 0 0 1 0",
  BLUE: "0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 0 1 0",
};

// Configuration type definitions for parsing
export const CONFIG_TYPES = {
  INT: ["scale", "radius", "blur", "lightness", "r", "g", "b"],
  FLOAT: ["frost", "saturation", "displace", "border", "alpha"],
  STRING: ["blend", "x", "y"],
  WARP_INT: ["angle"],
  WARP_FLOAT: ["intensity"],
  WARP_STRING: ["color"],
  SHINE_INT: ["angle", "spread"],
  SHINE_FLOAT: ["intensity"],
  SHINE_STRING: ["type", "color"],
  HOVER_FLOAT: ["borderWidth", "scale", "duration"],
  HOVER_STRING: ["borderColor", "easing"],
};

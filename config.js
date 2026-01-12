import { CONFIG_TYPES } from "./constants.js";

// Base configuration for glass effect
export const baseConfig = {
  // Core glass effect
  scale: -180,
  radius: 16,
  frost: 0,
  saturation: 1,

  // Displacement map
  border: 0.07,
  lightness: 50,
  alpha: 0.93,
  blur: 11,
  displace: 0,
  blend: "difference",

  // Chromatic aberration
  x: "R",
  y: "B",
  r: 0,
  g: 10,
  b: 20,

  // Warp effect
  warp: {
    angle: 195,
    intensity: 0,
    color: "rgba(255, 221, 153, 0)",
  },

  // Shine effect
  shine: {
    angle: 135,
    intensity: 0.4,
    color: "hsla(59, 100%, 75%, 0.29)",
    spread: 40,
    type: "shadow",
  },

  // Hover effects
  hover: {
    borderWidth: 1,
    borderColor: "hsl(0, 0%, 100%)",
    scale: 1.05,
    duration: 0.3,
    easing: "ease-in-out",
  },
};

// Helper Functions
export const generateUniqueId = () =>
  `glass-filter-${Math.random().toString(36).substr(2, 9)}`;

export const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const parseDatasetConfig = (element) => {
  const config = {};
  const { dataset } = element;

  // Parse integer values
  CONFIG_TYPES.INT.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = parseInt(dataset[dataKey], 10);
    }
  });

  // Parse float values
  CONFIG_TYPES.FLOAT.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = parseFloat(dataset[dataKey]);
    }
  });

  // Parse string values
  CONFIG_TYPES.STRING.forEach((key) => {
    const dataKey = `glass${capitalizeFirstLetter(key)}`;
    if (dataset[dataKey] !== undefined) {
      config[key] = dataset[dataKey];
    }
  });

  // Parse warp settings
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

  // Parse shine settings
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

  // Parse hover settings
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

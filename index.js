import { baseConfig, parseDatasetConfig } from "./config.js";
import { SELECTORS } from "./constants.js";
import { GlassEffect } from "./glass-effect.js";

/**
 * Auto-initializes glass effects on elements with data-glass-effect attribute
 */
const initGlassEffects = () => {
  const elements = document.querySelectorAll(SELECTORS.GLASS_EFFECT);

  elements.forEach((element) => {
    const config = parseDatasetConfig(element);
    new GlassEffect(element, config);
  });
};

document.addEventListener("DOMContentLoaded", initGlassEffects);

export { baseConfig, GlassEffect };

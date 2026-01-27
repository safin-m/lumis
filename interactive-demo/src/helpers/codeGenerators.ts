/**
 * Code Generation Helpers
 *
 * This module provides utility functions for generating code snippets
 * that can be copied and used by developers implementing the glass effect.
 */

import type { DemoConfig } from "@/types/glass-config";

/**
 * Generates a JavaScript configuration object code snippet
 * Creates a formatted JS object that can be used to initialize the glass effect
 *
 * @param config - The demo configuration to convert to code
 * @returns Formatted JavaScript code string with config and usage example
 */
export function generateConfigCode(config: DemoConfig): string {
  // Create a clean config object without demo-specific properties
  const cleanConfig = {
    scale: config.scale,
    radius: config.radius,
    frost: config.frost,
    saturation: config.saturation,
    backdropBlur: config.backdropBlur,
    overLight: config.overLight,
    mode: config.mode,
    // Only include shader parameters if in shader mode
    ...(config.mode === "shader" && {
      shaderEdgeFadeStart: config.shaderEdgeFadeStart,
      shaderEdgeFadeOffset: config.shaderEdgeFadeOffset,
      shaderCornerRadius: config.shaderCornerRadius,
      shaderWidthFactor: config.shaderWidthFactor,
      shaderHeightFactor: config.shaderHeightFactor,
      shaderEdgeDistanceDivisor: config.shaderEdgeDistanceDivisor,
    }),
    edgeMask: config.edgeMask,
    edgeMaskPreserveDistortion: config.edgeMaskPreserveDistortion,
    edgeMaskArithmeticBlend: config.edgeMaskArithmeticBlend,
    border: config.border,
    lightness: config.lightness,
    alpha: config.alpha,
    blur: config.blur,
    displace: config.displace,
    blend: config.blend,
    x: config.x,
    y: config.y,
    r: config.r,
    g: config.g,
    b: config.b,
    warp: config.warp,
    shine: config.shine,
    hover: config.hover,
    interactions: config.interactions,
    overlays: config.overlays,
  };

  return `const glassConfig = ${JSON.stringify(cleanConfig, null, 2)};

// Usage:
// new GlassEffect(element, glassConfig);`;
}

/**
 * Generates HTML data attributes for declarative glass effect initialization
 * Converts the configuration to data attributes that can be used in HTML
 *
 * @param config - The demo configuration to convert to data attributes
 * @returns HTML markup string with data attributes
 */
export function generateDataAttributes(config: DemoConfig): string {
  const attrs: string[] = [];

  // Basic glass effect parameters
  attrs.push(`data-glass-scale="${config.scale}"`);
  attrs.push(`data-glass-radius="${config.radius}"`);
  attrs.push(`data-glass-frost="${config.frost}"`);
  attrs.push(`data-glass-saturation="${config.saturation}"`);
  attrs.push(`data-glass-backdrop-blur="${config.backdropBlur}"`);
  attrs.push(`data-glass-over-light="${config.overLight}"`);
  attrs.push(`data-glass-mode="${config.mode}"`);

  // Shader mode specific parameters
  if (config.mode === "shader") {
    attrs.push(
      `data-glass-shader-edge-fade-start="${config.shaderEdgeFadeStart}"`
    );
    attrs.push(
      `data-glass-shader-edge-fade-offset="${config.shaderEdgeFadeOffset}"`
    );
    attrs.push(
      `data-glass-shader-corner-radius="${config.shaderCornerRadius}"`
    );
    attrs.push(`data-glass-shader-width-factor="${config.shaderWidthFactor}"`);
    attrs.push(
      `data-glass-shader-height-factor="${config.shaderHeightFactor}"`
    );
    attrs.push(
      `data-glass-shader-edge-distance-divisor="${config.shaderEdgeDistanceDivisor}"`
    );
  }

  // Edge mask parameters
  attrs.push(`data-glass-edge-mask="${config.edgeMask}"`);
  attrs.push(
    `data-glass-edge-mask-preserve-distortion="${config.edgeMaskPreserveDistortion}"`
  );
  attrs.push(
    `data-glass-edge-mask-arithmetic-blend="${config.edgeMaskArithmeticBlend}"`
  );

  // Visual effect parameters
  attrs.push(`data-glass-border="${config.border}"`);
  attrs.push(`data-glass-lightness="${config.lightness}"`);
  attrs.push(`data-glass-alpha="${config.alpha}"`);
  attrs.push(`data-glass-blur="${config.blur}"`);
  attrs.push(`data-glass-displace="${config.displace}"`);
  attrs.push(`data-glass-blend="${config.blend}"`);

  // Color channel parameters
  attrs.push(`data-glass-x="${config.x}"`);
  attrs.push(`data-glass-y="${config.y}"`);
  attrs.push(`data-glass-r="${config.r}"`);
  attrs.push(`data-glass-g="${config.g}"`);
  attrs.push(`data-glass-b="${config.b}"`);

  return `<div data-glass-effect\n  ${attrs.join(
    "\n  "
  )}>\n  <!-- Your content here -->\n</div>`;
}

/**
 * Generates SVG filter markup from the glass effect instance
 * Extracts the SVG displacement map from the initialized glass effect
 *
 * @param glassEffectRef - Reference to the glass effect instance
 * @returns SVG markup string or appropriate message if unavailable
 */
export function generateSVGCode(
  glassEffectRef: React.MutableRefObject<any>
): string {
  try {
    if (!glassEffectRef.current) {
      return "<!-- Glass effect not initialized yet -->";
    }

    // Get the displacement map data URL from the glass effect
    const dataUrl = glassEffectRef.current.cachedDisplacementMap;
    if (!dataUrl) {
      return "<!-- Displacement map not generated yet -->";
    }

    // If it's a data URL with SVG, decode it
    if (dataUrl.startsWith("data:image/svg+xml,")) {
      const svgContent = decodeURIComponent(
        dataUrl.replace("data:image/svg+xml,", "")
      );
      return svgContent;
    }

    // If it's a shader mode (canvas data URL), return info
    if (dataUrl.startsWith("data:image/png")) {
      return `<!-- Shader mode uses a canvas-generated PNG data URL.
   This cannot be exported as static SVG.
   Data URL: ${dataUrl.substring(0, 100)}... -->`;
    }

    return dataUrl;
  } catch (e) {
    return `<!-- SVG generation error: ${e} -->`;
  }
}

/**
 * DisplacementMapBuilder - Generates SVG displacement maps for glass distortion effects
 *
 * The displacement map controls how the backdrop content is warped:
 * - Red channel = horizontal displacement
 * - Blue channel = vertical displacement
 * - Gradients create directional distortion from edges to center
 *
 * Two modes available:
 * 1. Standard mode: SVG gradients with blend modes
 * 2. Shader mode: CPU-generated liquid glass effect using signed distance fields
 *
 * @class DisplacementMapBuilder
 */
export class DisplacementMapBuilder {
  /**
   * Creates a displacement map builder
   *
   * @param {string} filterId - Unique ID for gradient references
   * @param {Object} config - Configuration object containing dimensions and effect parameters
   * @param {number} config.width - Map width in pixels
   * @param {number} config.height - Map height in pixels
   * @param {number} config.border - Border fade amount (0-1)
   * @param {number} config.lightness - Center area lightness (0-100)
   * @param {number} config.alpha - Center area opacity (0-1)
   * @param {number} config.blur - Center blur amount in pixels
   * @param {string} config.blend - Blend mode for gradients
   * @param {string} config.mode - "standard" or "shader"
   * @param {Object} config.warp - Warp effect configuration
   */
  constructor(filterId, config) {
    this.filterId = filterId;
    this.config = config;
  }

  /**
   * Creates a linear gradient for displacement mapping
   * Red gradient = horizontal distortion, Blue gradient = vertical distortion
   *
   * @private
   * @param {string} id - Unique gradient ID
   * @param {string} direction - "horizontal" or "vertical"
   * @returns {string} SVG linearGradient element
   */
  createGradient(id, direction) {
    const isHorizontal = direction === "horizontal";
    const color = isHorizontal ? "red" : "blue";

    return `
      <linearGradient 
        id="${id}" 
        x1="${isHorizontal ? "100%" : "0%"}" 
        y1="0%" 
        x2="${isHorizontal ? "0%" : "0%"}" 
        y2="${isHorizontal ? "0%" : "100%"}">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="${color}"/>
      </linearGradient>
    `;
  }

  /**
   * Creates an SVG rect element with rounded corners
   *
   * @private
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   * @param {string} fill - Fill color or gradient URL
   * @param {string} [extraAttrs=""] - Additional SVG attributes (style, etc.)
   * @returns {string} SVG rect element
   */
  createRect(x, y, width, height, fill, extraAttrs = "") {
    const { radius } = this.config;

    return `<rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      rx="${radius}" 
      fill="${fill}" 
      ${extraAttrs}/>`;
  }

  /**
   * Creates a directional warp gradient overlay based on angle
   * Adds a color gradient that can be used for artistic effects
   *
   * @private
   * @returns {string} SVG linearGradient element or empty string if disabled
   */
  createWarpGradient() {
    const { angle, intensity, color } = this.config.warp;

    if (intensity === 0) return "";

    // Convert angle to gradient coordinates (0° = right, 90° = down)
    const angleRad = (angle * Math.PI) / 180;
    // Start point (opposite direction)
    const x1 = 50 + 50 * Math.cos(angleRad + Math.PI);
    const y1 = 50 + 50 * Math.sin(angleRad + Math.PI);
    // End point (gradient direction)
    const x2 = 50 + 50 * Math.cos(angleRad);
    const y2 = 50 + 50 * Math.sin(angleRad);

    return `
      <linearGradient id="warp-${this.filterId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${color}" stop-opacity="${intensity}"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </linearGradient>
    `;
  }

  /**
   * Builds a shader-generated displacement map using liquid glass algorithm
   *
   * Uses CPU rendering to create organic, liquid-like distortion:
   * 1. Signed Distance Field (SDF) generates smooth rounded rect shape
   * 2. Smooth step function creates gradual displacement from edges
   * 3. UV coordinates are displaced toward center based on distance
   * 4. Edge fade prevents harsh distortion at boundaries
   *
   * Red channel = horizontal displacement, Green/Blue = vertical displacement
   *
   * @private
   * @param {number} width - Output width in pixels
   * @param {number} height - Output height in pixels
   * @returns {string} Data URL of the generated canvas image
   */
  buildShaderMap(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Smooth step interpolation: creates S-curve for gradual transitions
    const smoothStep = (a, b, t) => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    // 2D distance calculation
    const length2 = (x, y) => Math.hypot(x, y);

    // Signed Distance Field for rounded rectangle
    // Returns negative inside shape, positive outside
    const roundedRectSDF = (x, y, w, h, r) => {
      const qx = Math.abs(x) - w + r;
      const qy = Math.abs(y) - h + r;
      return (
        Math.min(Math.max(qx, qy), 0) +
        length2(Math.max(qx, 0), Math.max(qy, 0)) -
        r
      );
    };

    // First pass: calculate displacement vectors
    let maxScale = 1;
    const raw = new Float32Array(width * height * 2);
    let ri = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Normalize to UV coordinates (0-1 range, centered at 0.5)
        const uvx = x / width;
        const uvy = y / height;
        const ix = uvx - 0.5; // Centered x (-0.5 to 0.5)
        const iy = uvy - 0.5; // Centered y (-0.5 to 0.5)

        // Calculate distance to rounded rect edge using SDF
        const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);

        // Create displacement gradient: strong at edges, weak at center
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
        const scaled = smoothStep(0, 1, displacement);

        // Calculate displaced position (pulls toward center)
        const px = ix * scaled + 0.5;
        const py = iy * scaled + 0.5;

        // Displacement delta (how much to shift this pixel)
        const dx = px * width - x;
        const dy = py * height - y;

        // Track maximum displacement for normalization
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
        raw[ri++] = dx;
        raw[ri++] = dy;
      }
    }

    // Ensure minimum scale for normalization
    maxScale = Math.max(1, maxScale);

    // Second pass: normalize and apply edge fade
    ri = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = raw[ri++];
        const dy = raw[ri++];

        // Calculate distance to nearest edge
        const edgeDistance = Math.min(x, y, width - x - 1, height - y - 1);
        // Fade displacement near edges to prevent harsh boundaries
        const edgeFactor = Math.min(1, edgeDistance / 2);

        // Normalize to 0-1 range (0.5 = no displacement)
        const r = (dx * edgeFactor) / maxScale + 0.5;
        const g = (dy * edgeFactor) / maxScale + 0.5;

        // Write to image data (R = horizontal, G/B = vertical)
        const off = (y * width + x) * 4;
        data[off] = Math.max(0, Math.min(255, r * 255)); // Red channel (x displacement)
        data[off + 1] = Math.max(0, Math.min(255, g * 255)); // Green channel (y displacement)
        data[off + 2] = Math.max(0, Math.min(255, g * 255)); // Blue channel (y displacement)
        data[off + 3] = 255; // Full opacity
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  /**
   * Builds the complete displacement map SVG
   *
   * Layer structure (bottom to top):
   * 1. Black background (base distortion)
   * 2. Red gradient (horizontal displacement channel)
   * 3. Blue gradient (vertical displacement channel, blended)
   * 4. Center blur (reduces distortion in middle, creates edge-focused effect)
   * 5. Warp gradient (optional color overlay)
   *
   * @public
   * @returns {string} Complete SVG string or data URL (for shader mode)
   */
  build() {
    const { width, height, border, lightness, alpha, blur, blend, mode } =
      this.config;
    const { intensity: warpIntensity } = this.config.warp;

    // Calculate border fade dimensions
    // border = 0.07 means 7% of shortest dimension fades from edge
    const borderSize = Math.min(width, height) * (border * 0.5);
    const innerWidth = width - borderSize * 2;
    const innerHeight = height - borderSize * 2;

    // Shader mode: combine CPU-generated liquid glass with gradient overlays
    if (mode === "shader") {
      const shaderMap = this.buildShaderMap(width, height);
      return `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.createGradient(`red-${this.filterId}`, "horizontal")}
    ${this.createGradient(`blue-${this.filterId}`, "vertical")}
    ${this.createWarpGradient()}
  </defs>
  <!-- Base shader displacement -->
  <image href="${shaderMap}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>
  <!-- Additional gradient overlays for enhanced effect -->
  ${this.createRect(
    0,
    0,
    width,
    height,
    `url(#red-${this.filterId})`,
    `style="mix-blend-mode: screen"`
  )}
  ${this.createRect(
    0,
    0,
    width,
    height,
    `url(#blue-${this.filterId})`,
    `style="mix-blend-mode: ${blend}"`
  )}
  <!-- Center blur reduces distortion in middle -->
  ${this.createRect(
    borderSize,
    borderSize,
    innerWidth,
    innerHeight,
    `hsl(0 0% ${lightness}% / ${alpha})`,
    `style="filter:blur(${blur}px)"`
  )}
  <!-- Optional warp color overlay -->
  ${
    warpIntensity > 0
      ? this.createRect(
          0,
          0,
          width,
          height,
          `url(#warp-${this.filterId})`,
          `style="mix-blend-mode: lighten"`
        )
      : ""
  }
</svg>
      `;
    }

    // Standard mode: pure SVG gradients with blend modes
    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${this.createGradient(`red-${this.filterId}`, "horizontal")}
          ${this.createGradient(`blue-${this.filterId}`, "vertical")}
          ${this.createWarpGradient()}
        </defs>
        
        <!-- Black background provides base for gradients -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
        
        <!-- Red gradient controls horizontal (X-axis) displacement -->
        ${this.createRect(0, 0, width, height, `url(#red-${this.filterId})`)}
        
        <!-- Blue gradient controls vertical (Y-axis) displacement, blended for interaction -->
        ${this.createRect(
          0,
          0,
          width,
          height,
          `url(#blue-${this.filterId})`,
          `style="mix-blend-mode: ${blend}"`
        )}
        
        <!-- Center blur reduces distortion in middle area, creates edge-focused glass effect -->
        ${this.createRect(
          borderSize,
          borderSize,
          innerWidth,
          innerHeight,
          `hsl(0 0% ${lightness}% / ${alpha})`,
          `style="filter:blur(${blur}px)"`
        )}
        
        <!-- Optional warp effect adds directional color gradient -->
        ${
          warpIntensity > 0
            ? this.createRect(
                0,
                0,
                width,
                height,
                `url(#warp-${this.filterId})`,
                `style="mix-blend-mode: lighten"`
              )
            : ""
        }
      </svg>
    `;
  }
}

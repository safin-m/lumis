import { COLOR_MATRICES, SELECTORS } from "./constants.js";

/**
 * SVGFilterBuilder - Constructs SVG filter chains for glass effect with chromatic aberration
 *
 * Filter chain overview:
 * 1. feImage - Load displacement map
 * 2. feDisplacementMap - Warp each RGB channel separately (chromatic aberration)
 * 3. feColorMatrix - Extract individual color channels
 * 4. feBlend - Recombine channels with screen blend mode
 * 5. feGaussianBlur - Smooth final output (optional)
 *
 * Edge mask mode (when enabled):
 * - Applies aberration only at edges using alpha masking
 * - Keeps center clean and sharp
 * - Useful for reducing distraction in content areas
 *
 * @class SVGFilterBuilder
 */
export class SVGFilterBuilder {
  /**
   * Creates an SVG filter builder
   *
   * @param {string} filterId - Unique filter ID for CSS referencing
   * @param {Object} config - Configuration object
   * @param {string} config.x - X-axis channel selector: "R", "G", or "B"
   * @param {string} config.y - Y-axis channel selector: "R", "G", or "B"
   * @param {number} config.scale - Base displacement scale
   * @param {number} config.r - Red channel offset
   * @param {number} config.g - Green channel offset
   * @param {number} config.b - Blue channel offset
   * @param {number} config.displace - Output blur amount
   * @param {boolean} config.edgeMask - Enable edge-only aberration
   * @param {number} config.aberrationIntensity - Edge mask strength (2-10)
   * @param {string} config.mode - "standard" or "shader"
   */
  constructor(filterId, config) {
    this.filterId = filterId;
    this.config = config;
  }

  /**
   * Creates a displacement channel with color matrix extraction
   *
   * Process:
   * 1. feDisplacementMap - Warp the source graphic using displacement map
   * 2. feColorMatrix - Extract only this color channel (red, green, or blue)
   *
   * Each RGB channel is displaced by different amounts to create chromatic aberration
   * (color fringing like light through a prism or lens edge)
   *
   * @private
   * @param {string} channel - Color channel name: "Red", "Green", or "Blue"
   * @param {string} matrix - Color matrix values for channel extraction
   * @param {string} className - CSS class for dynamic scale updates
   * @returns {string} SVG filter primitives for this channel
   */
  createDisplacementChannel(channel, matrix, className) {
    const { x, y } = this.config;
    const channelLower = channel.toLowerCase();

    return `
      <feDisplacementMap 
        in="SourceGraphic" 
        in2="map" 
        class="${className}"
        xChannelSelector="${x}" 
        yChannelSelector="${y}" 
        result="disp${channel}"/>
      <feColorMatrix 
        in="disp${channel}" 
        type="matrix"
        values="${matrix}" 
        result="${channelLower}"/>
    `;
  }

  /**
   * Builds the complete SVG filter definition
   *
   * Creates either:
   * - Standard mode: Full chromatic aberration across entire element
   * - Edge mask mode: Aberration only at edges, clean center
   *
   * @public
   * @returns {string} Complete SVG filter definition with <defs> wrapper
   */
  build() {
    // Extract class names from selectors (remove leading dot)
    const feImageClass = SELECTORS.FE_IMAGE.slice(1);
    const redClass = SELECTORS.RED_CHANNEL.slice(1);
    const greenClass = SELECTORS.GREEN_CHANNEL.slice(1);
    const blueClass = SELECTORS.BLUE_CHANNEL.slice(1);
    const blurClass = SELECTORS.OUTPUT_BLUR.slice(1);

    const { edgeMask, aberrationIntensity, mode } = this.config;
    const { scale, r, g, b, displace } = this.config;

    // Calculate scale values for each channel
    // Shader mode inverts scale direction for different distortion effect
    const scaleDir = mode === "shader" ? -1 : 1;
    const redScale = scaleDir * (scale + r);
    const greenScale = scaleDir * (scale + g);
    const blueScale = scaleDir * (scale + b);

    return `
      <defs>
        <filter id="${this.filterId}" color-interpolation-filters="sRGB">
          <!-- Displacement map image source -->
          <feImage 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="none"
            result="map" 
            class="${feImageClass}">
          </feImage>
          ${
            edgeMask
              ? `
          <!-- Edge mask generation: isolates edges for selective aberration -->
          <!-- Convert displacement map to grayscale intensity -->
          <feColorMatrix in="map" type="matrix" values="0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0" result="edgeIntensity" class="${SELECTORS.EDGE_INTENSITY.slice(
            1
          )}"/>
          <!-- Create discrete mask: 0 at center, 1 at edges -->
          <feComponentTransfer in="edgeIntensity" result="edgeMask" class="${SELECTORS.EDGE_MASK.slice(
            1
          )}">
            <feFuncA type="discrete" tableValues="0 ${
              aberrationIntensity * 0.05
            } 1"/>
          </feComponentTransfer>
          `
              : ""
          }
          
          <!-- Chromatic aberration: displace and extract each RGB channel separately -->
          <!-- Red channel with its specific scale offset -->
          ${this.createDisplacementChannel(
            "Red",
            COLOR_MATRICES.RED,
            redClass
          ).replace(
            'result="dispRed"/>',
            `scale="${redScale}" result="dispRed"/>`
          )}
          <!-- Green channel with its specific scale offset -->
          ${this.createDisplacementChannel(
            "Green",
            COLOR_MATRICES.GREEN,
            greenClass
          ).replace(
            'result="dispGreen"/>',
            `scale="${greenScale}" result="dispGreen"/>`
          )}
          <!-- Blue channel with its specific scale offset -->
          ${this.createDisplacementChannel(
            "Blue",
            COLOR_MATRICES.BLUE,
            blueClass
          ).replace(
            'result="dispBlue"/>',
            `scale="${blueScale}" result="dispBlue"/>`
          )}
          
          <!-- Blend separated channels back together using screen mode for additive color -->
          <feBlend in="red" in2="green" mode="screen" result="rg"/>
          <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>
          
          ${
            edgeMask
              ? `
          <!-- Edge mask mode: apply aberration only at edges -->
          <!-- Slight blur on aberrated result for smoother transition -->
          <feGaussianBlur in="rgb" stdDeviation="${Math.max(
            0.1,
            0.5 - aberrationIntensity * 0.1
          )}" result="aberratedBlurred"/>
          <!-- Composite aberration with edge mask (only keeps edges) -->
          <feComposite in="aberratedBlurred" in2="edgeMask" operator="in" result="edgeAberration"/>
          
          <!-- Inverted mask for center area (no aberration) -->
          <feComponentTransfer in="edgeMask" result="invertedMask" class="${SELECTORS.INVERTED_MASK.slice(
            1
          )}">
            <feFuncA type="table" tableValues="1 0"/>
          </feComponentTransfer>
          <!-- Composite clean source with inverted mask (keeps center sharp) -->
          <feComposite in="SourceGraphic" in2="invertedMask" operator="in" result="centerClean"/>
          
          <!-- Combine aberrated edges over clean center -->
          <feComposite in="edgeAberration" in2="centerClean" operator="over" result="output"/>
          `
              : `
          <!-- Standard mode: apply blur to smooth final result -->
          <feGaussianBlur 
            in="rgb" 
            class="${blurClass}" 
            stdDeviation="${displace}" 
            result="output"/>
          `
          }
        </filter>
      </defs>
    `;
  }
}

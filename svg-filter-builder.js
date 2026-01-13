import { COLOR_MATRICES, SELECTORS } from "./constants.js";

/**
 * Builds SVG filter for glass effect with chromatic aberration
 */
export class SVGFilterBuilder {
  constructor(filterId, config) {
    this.filterId = filterId;
    this.config = config;
  }

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

  build() {
    const feImageClass = SELECTORS.FE_IMAGE.slice(1);
    const redClass = SELECTORS.RED_CHANNEL.slice(1);
    const greenClass = SELECTORS.GREEN_CHANNEL.slice(1);
    const blueClass = SELECTORS.BLUE_CHANNEL.slice(1);
    const blurClass = SELECTORS.OUTPUT_BLUR.slice(1);

    const { edgeMask, aberrationIntensity, mode } = this.config;
    const { scale, r, g, b, displace } = this.config;

    // Calculate scale values
    const scaleDir = mode === "shader" ? -1 : 1;
    const redScale = scaleDir * (scale + r);
    const greenScale = scaleDir * (scale + g);
    const blueScale = scaleDir * (scale + b);

    return `
      <defs>
        <filter id="${this.filterId}" color-interpolation-filters="sRGB">
          <!-- Displacement map image -->
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
          <!-- Edge mask generation -->
          <feColorMatrix in="map" type="matrix" values="0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0" result="edgeIntensity" class="${SELECTORS.EDGE_INTENSITY.slice(
            1
          )}"/>
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
          
          <!-- Chromatic aberration: separate RGB channels -->
          ${this.createDisplacementChannel(
            "Red",
            COLOR_MATRICES.RED,
            redClass
          ).replace(
            'result="dispRed"/>',
            `scale="${redScale}" result="dispRed"/>`
          )}
          ${this.createDisplacementChannel(
            "Green",
            COLOR_MATRICES.GREEN,
            greenClass
          ).replace(
            'result="dispGreen"/>',
            `scale="${greenScale}" result="dispGreen"/>`
          )}
          ${this.createDisplacementChannel(
            "Blue",
            COLOR_MATRICES.BLUE,
            blueClass
          ).replace(
            'result="dispBlue"/>',
            `scale="${blueScale}" result="dispBlue"/>`
          )}
          
          <!-- Blend channels back together -->
          <feBlend in="red" in2="green" mode="screen" result="rg"/>
          <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>
          
          ${
            edgeMask
              ? `
          <!-- Apply edge mask to aberration effect -->
          <feGaussianBlur in="rgb" stdDeviation="${Math.max(
            0.1,
            0.5 - aberrationIntensity * 0.1
          )}" result="aberratedBlurred"/>
          <feComposite in="aberratedBlurred" in2="edgeMask" operator="in" result="edgeAberration"/>
          
          <!-- Inverted mask for clean center -->
          <feComponentTransfer in="edgeMask" result="invertedMask" class="${SELECTORS.INVERTED_MASK.slice(
            1
          )}">
            <feFuncA type="table" tableValues="1 0"/>
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="invertedMask" operator="in" result="centerClean"/>
          
          <!-- Combine masked edges with clean center -->
          <feComposite in="edgeAberration" in2="centerClean" operator="over" result="output"/>
          `
              : `
          <!-- Final blur for smoothing -->
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

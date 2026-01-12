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

    return `
      <defs>
        <filter id="${this.filterId}" color-interpolation-filters="sRGB">
          <!-- Displacement map image -->
          <feImage 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            result="map" 
            class="${feImageClass}">
          </feImage>
          
          <!-- Chromatic aberration: separate RGB channels -->
          ${this.createDisplacementChannel("Red", COLOR_MATRICES.RED, redClass)}
          ${this.createDisplacementChannel(
            "Green",
            COLOR_MATRICES.GREEN,
            greenClass
          )}
          ${this.createDisplacementChannel(
            "Blue",
            COLOR_MATRICES.BLUE,
            blueClass
          )}
          
          <!-- Blend channels back together -->
          <feBlend in="red" in2="green" mode="screen" result="rg"/>
          <feBlend in="rg" in2="blue" mode="screen" result="output"/>
          
          <!-- Final blur for smoothing -->
          <feGaussianBlur 
            in="output" 
            class="${blurClass}" 
            stdDeviation="${this.config.displace}"/>
        </filter>
      </defs>
    `;
  }
}

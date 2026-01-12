// Constants
const SELECTORS = {
  GLASS_EFFECT: "[data-glass-effect]",
  FE_IMAGE: ".fe-image",
  RED_CHANNEL: ".red-channel",
  GREEN_CHANNEL: ".green-channel",
  BLUE_CHANNEL: ".blue-channel",
  OUTPUT_BLUR: ".output-blur",
};

const COLOR_MATRICES = {
  RED: "1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0",
  GREEN: "0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 0 0 1 0",
  BLUE: "0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 0 1 0",
};

const CONFIG_TYPES = {
  INT: ["scale", "radius", "blur", "lightness", "r", "g", "b"],
  FLOAT: ["frost", "saturation", "displace", "border", "alpha"],
  STRING: ["blend", "x", "y"],
};

// Base configuration for glass effect
const baseConfig = {
  scale: -180,
  radius: 16,
  border: 0.07,
  lightness: 50,
  displace: 0,
  blend: "difference",
  x: "R",
  y: "B",
  alpha: 0.93,
  blur: 11,
  r: 0,
  g: 10,
  b: 20,
  frost: 0,
  saturation: 1,
};

// Helper Functions
const generateUniqueId = () =>
  `glass-filter-${Math.random().toString(36).substr(2, 9)}`;

const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const parseDatasetConfig = (element) => {
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

  return config;
};

/**
 * Builds SVG filter for glass effect with chromatic aberration
 */
class SVGFilterBuilder {
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

/**
 * Builds displacement map SVG for distortion effect
 */
class DisplacementMapBuilder {
  constructor(filterId, config) {
    this.filterId = filterId;
    this.config = config;
  }

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

  build() {
    const { width, height, border, lightness, alpha, blur, blend } =
      this.config;

    // Calculate border size and inner dimensions
    const borderSize = Math.min(width, height) * (border * 0.5);
    const innerWidth = width - borderSize * 2;
    const innerHeight = height - borderSize * 2;

    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${this.createGradient(`red-${this.filterId}`, "horizontal")}
          ${this.createGradient(`blue-${this.filterId}`, "vertical")}
        </defs>
        
        <!-- Black background -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
        
        <!-- Red gradient for horizontal displacement -->
        ${this.createRect(0, 0, width, height, `url(#red-${this.filterId})`)}
        
        <!-- Blue gradient for vertical displacement -->
        ${this.createRect(
          0,
          0,
          width,
          height,
          `url(#blue-${this.filterId})`,
          `style="mix-blend-mode: ${blend}"`
        )}
        
        <!-- Center blur to reduce edge distortion -->
        ${this.createRect(
          borderSize,
          borderSize,
          innerWidth,
          innerHeight,
          `hsl(0 0% ${lightness}% / ${alpha})`,
          `style="filter:blur(${blur}px)"`
        )}
      </svg>
    `;
  }
}

/**
 * Glass Effect - Creates backdrop filter with displacement mapping
 * @class GlassEffect
 */
class GlassEffect {
  constructor(element, config = {}) {
    this.element = element;
    this.config = { ...baseConfig, ...config };
    this.filterId = generateUniqueId();

    this.createFilter();
    this.cacheFilterElements();
    this.init();
    this.setupResizeObserver();
  }

  /**
   * Creates the SVG filter element and appends to DOM
   */
  createFilter() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Hide SVG element (only used for filter definition)
    Object.assign(svg.style, {
      position: "absolute",
      width: "0",
      height: "0",
      pointerEvents: "none",
    });

    const filterBuilder = new SVGFilterBuilder(this.filterId, this.config);
    svg.innerHTML = filterBuilder.build();

    document.body.appendChild(svg);
    this.svgElement = svg;
  }

  /**
   * Cache references to filter elements for performance
   */
  cacheFilterElements() {
    this.feImage = this.svgElement.querySelector(SELECTORS.FE_IMAGE);
    this.redChannel = this.svgElement.querySelector(SELECTORS.RED_CHANNEL);
    this.greenChannel = this.svgElement.querySelector(SELECTORS.GREEN_CHANNEL);
    this.blueChannel = this.svgElement.querySelector(SELECTORS.BLUE_CHANNEL);
    this.outputBlur = this.svgElement.querySelector(SELECTORS.OUTPUT_BLUR);
  }

  /**
   * Measures container dimensions from bounding box
   */
  measureContainer() {
    const rect = this.element.getBoundingClientRect();
    this.config.width = Math.round(rect.width);
    this.config.height = Math.round(rect.height);
  }

  /**
   * Builds displacement map as data URI
   */
  buildDisplacementMap() {
    const mapBuilder = new DisplacementMapBuilder(this.filterId, this.config);
    const svgString = mapBuilder.build();
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  }

  /**
   * Updates SVG filter attributes with current config values
   */
  updateFilterAttributes() {
    const { width, height, scale, r, g, b, displace } = this.config;

    // Set displacement map dimensions
    this.feImage.setAttribute("width", width);
    this.feImage.setAttribute("height", height);

    // Set chromatic aberration scale for each channel
    this.redChannel.setAttribute("scale", scale + r);
    this.greenChannel.setAttribute("scale", scale + g);
    this.blueChannel.setAttribute("scale", scale + b);

    // Set output blur amount
    this.outputBlur.setAttribute("stdDeviation", displace);
  }

  /**
   * Applies visual styles to the glass element
   */
  applyElementStyles() {
    const { filterId, config } = this;
    const { saturation, frost, radius } = config;

    Object.assign(this.element.style, {
      backdropFilter: `url(#${filterId}) saturate(${saturation})`,
      background: `hsl(0 0% 100% / ${frost})`,
      borderRadius: `${radius}px`,
    });
  }

  /**
   * Updates all aspects of the glass effect
   */
  update() {
    this.measureContainer();
    this.feImage.setAttribute("href", this.buildDisplacementMap());
    this.updateFilterAttributes();
    this.applyElementStyles();
  }

  /**
   * Sets up resize observer to update on size changes
   */
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => this.update());
    this.resizeObserver.observe(this.element);
  }

  /**
   * Initializes the glass effect
   */
  init() {
    this.update();
  }

  /**
   * Cleans up resources when destroying the effect
   */
  destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.svgElement) this.svgElement.remove();
  }
}

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

// Export for manual usage
export { baseConfig, GlassEffect };

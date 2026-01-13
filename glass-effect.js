import { baseConfig, generateUniqueId } from "./config.js";
import { SELECTORS } from "./constants.js";
import { DisplacementMapBuilder } from "./displacement-map-builder.js";
import { SVGFilterBuilder } from "./svg-filter-builder.js";

/**
 * Glass Effect - Creates backdrop filter with displacement mapping
 * @class GlassEffect
 */
export class GlassEffect {
  constructor(element, config = {}) {
    this.element = element;
    // Deep merge for nested objects
    this.config = {
      ...baseConfig,
      ...config,
      warp: { ...baseConfig.warp, ...config.warp },
      shine: { ...baseConfig.shine, ...config.shine },
      hover: { ...baseConfig.hover, ...config.hover },
      interactions: {
        ...baseConfig.interactions,
        ...(config.interactions || {}),
      },
      overlays: { ...baseConfig.overlays, ...(config.overlays || {}) },
    };
    this.filterId = generateUniqueId();

    // Performance optimization flags
    this.cachedDisplacementMap = null;
    this.cachedDimensions = { width: 0, height: 0 };
    this.updateScheduled = false;

    this.createFilter();
    this.cacheFilterElements();
    this.createShineOverlay();
    this.setupHoverEffects();
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
   * Creates style element for pseudo-element shine effect
   */
  createShineOverlay() {
    if (!document.getElementById("glass-effect-shine-styles")) {
      const style = document.createElement("style");
      style.id = "glass-effect-shine-styles";
      style.textContent = `
        .glass-effect-shine::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          mix-blend-mode: screen;
          background: var(--shine-background, none);
          box-shadow: var(--shine-shadow, none);
        }
      `;
      document.head.appendChild(style);
    }
    this.element.classList.add("glass-effect-shine");
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
   * Builds displacement map as data URI (memoized)
   */
  buildDisplacementMap() {
    const { width, height } = this.config;

    // Return cached map if dimensions haven't changed
    if (
      this.cachedDisplacementMap &&
      this.cachedDimensions.width === width &&
      this.cachedDimensions.height === height
    ) {
      return this.cachedDisplacementMap;
    }

    const mapBuilder = new DisplacementMapBuilder(this.filterId, this.config);
    const svgString = mapBuilder.build();
    // Fix: handle SVG with leading whitespace and shader mode data URLs
    const dataUri = svgString.trim().startsWith("data:")
      ? svgString
      : `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    // Cache the result
    this.cachedDisplacementMap = dataUri;
    this.cachedDimensions = { width, height };

    return dataUri;
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

    const backdropFilterValue = `url(#${filterId}) saturate(${saturation})`;

    Object.assign(this.element.style, {
      WebkitBackdropFilter: backdropFilterValue, // Safari/older Chrome
      backdropFilter: backdropFilterValue,
      background: `hsl(0 0% 100% / ${frost})`,
      borderRadius: `${radius}px`,
      position: this.element.style.position || "relative",
      // Performance hints
      willChange: "transform, backdrop-filter",
      contain: "layout style paint",
    });

    this.applyShineEffect();
    this.applyOverlayLayers();
  }

  /**
   * Applies shine effect using gradient or shadow based on shineType
   */
  applyShineEffect() {
    const { intensity, type } = this.config.shine;

    if (intensity === 0) {
      this.element.style.setProperty("--shine-background", "none");
      return;
    }

    if (type === "shadow") {
      this.applyShadowShine();
    } else {
      this.applyGradientShine();
    }
  }

  /**
   * Applies shine using linear gradient
   */
  applyGradientShine() {
    const { angle, intensity, color, spread } = this.config.shine;

    // Create directional linear gradient based on angle
    const gradientAngle = angle + 90; // Adjust for CSS gradient angle convention
    const fadeDistance = spread;

    const gradient = `linear-gradient(${gradientAngle}deg, 
      transparent 0%, 
      ${color} ${fadeDistance}%, 
      transparent ${fadeDistance * 2}%)`;

    this.element.style.setProperty("--shine-background", gradient);
    this.element.style.setProperty("--shine-shadow", "none");
  }

  /**
   * Applies shine using box-shadow
   */
  applyShadowShine() {
    const { angle, intensity, color, spread } = this.config.shine;

    // Convert angle to radians and calculate offset direction
    const angleRad = (angle * Math.PI) / 180;
    const offsetX = Math.cos(angleRad) * 20 * intensity;
    const offsetY = Math.sin(angleRad) * 20 * intensity;

    // Create inset box-shadow for directional shine
    const shadow = `inset ${offsetX}px ${offsetY}px ${spread}px ${color}, 
            inset ${-offsetX}px ${-offsetY}px ${spread}px ${color}`;

    this.element.style.setProperty("--shine-background", "none");
    this.element.style.setProperty("--shine-shadow", shadow);
  }

  /**
   * Sets up hover effects for border glow and transitions
   */
  setupHoverEffects() {
    const { borderWidth, borderColor, scale, duration, easing } =
      this.config.hover;
    const interactionsEnabled = this.config.interactions?.enabled;

    if (borderWidth > 0) {
      // Set default border with transparent color
      this.element.style.border = `${borderWidth}px solid transparent`;
      this.element.style.transition = `transform ${duration}s ${easing}, border-color ${duration}s ${easing}`;

      this.element.addEventListener("mouseenter", () => {
        if (!interactionsEnabled && scale !== 1) {
          this.element.style.transform = `scale(${scale})`;
        }
        this.element.style.borderColor = borderColor;
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0.5";
        if (this.hoverOverlay2) this.hoverOverlay2.style.opacity = "0";
      });

      this.element.addEventListener("mouseleave", () => {
        if (!interactionsEnabled) this.element.style.transform = "";
        this.element.style.borderColor = "transparent";
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0";
        if (this.hoverOverlay2) this.hoverOverlay2.style.opacity = "0";
      });
    } else if (scale !== 1) {
      // Only scale, no border
      this.element.style.transition = `transform ${duration}s ${easing}`;
      this.element.addEventListener("mouseenter", () => {
        if (!interactionsEnabled)
          this.element.style.transform = `scale(${scale})`;
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0.4";
      });
      this.element.addEventListener("mouseleave", () => {
        if (!interactionsEnabled) this.element.style.transform = "";
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0";
      });
    }
  }

  /**
   * Applies optional overlay layers for advanced borders and hover effects
   */
  applyOverlayLayers() {
    const { overlays } = this.config;
    if (!overlays?.enabled) return;

    // Two border layers
    if (!this.borderLayer1) {
      this.borderLayer1 = document.createElement("span");
      Object.assign(this.borderLayer1.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: "0.2",
        padding: "1.5px",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        boxShadow:
          "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
      });
      this.element.appendChild(this.borderLayer1);
    }

    if (!this.borderLayer2) {
      this.borderLayer2 = document.createElement("span");
      Object.assign(this.borderLayer2.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        mixBlendMode: "overlay",
        padding: "1.5px",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        boxShadow:
          "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
      });
      this.element.appendChild(this.borderLayer2);
    }

    // Hover overlay layers
    if (!this.hoverOverlay1) {
      this.hoverOverlay1 = document.createElement("div");
      Object.assign(this.hoverOverlay1.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        transition: "opacity 0.2s ease-out",
        opacity: "0",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)",
        mixBlendMode: "overlay",
      });
      this.element.appendChild(this.hoverOverlay1);
    }

    if (!this.hoverOverlay2) {
      this.hoverOverlay2 = document.createElement("div");
      Object.assign(this.hoverOverlay2.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        transition: "opacity 0.2s ease-out",
        opacity: "0",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)",
        mixBlendMode: "overlay",
      });
      this.element.appendChild(this.hoverOverlay2);
    }
  }

  /**
   * Updates all aspects of the glass effect (debounced with RAF)
   */
  update() {
    if (this.updateScheduled) return;

    this.updateScheduled = true;
    requestAnimationFrame(() => {
      this.measureContainer();
      this.feImage.setAttribute("href", this.buildDisplacementMap());
      this.updateFilterAttributes();
      this.applyElementStyles();
      this.updateScheduled = false;
    });
  }

  /**
   * Sets up resize observer to update on size changes (throttled)
   */
  setupResizeObserver() {
    let resizeTimeout;
    this.resizeObserver = new ResizeObserver(() => {
      // Throttle updates to max once per 100ms
      if (resizeTimeout) return;
      resizeTimeout = setTimeout(() => {
        this.update();
        resizeTimeout = null;
      }, 100);
    });
    this.resizeObserver.observe(this.element);
  }

  /**
   * Initializes the glass effect
   */
  init() {
    this.update();
    this.setupInteractions();
  }

  /**
   * Sets up optional elastic mouse interactions
   */
  setupInteractions() {
    const { interactions } = this.config;
    if (!interactions?.enabled) return;

    this.onMouseMove = (e) => {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Elastic translation with activation fade
      const edgeDistanceX = Math.max(0, Math.abs(deltaX) - rect.width / 2);
      const edgeDistanceY = Math.max(0, Math.abs(deltaY) - rect.height / 2);
      const edgeDistance = Math.hypot(edgeDistanceX, edgeDistanceY);
      const activation = interactions.activationZone || 200;
      const fade =
        edgeDistance > activation ? 0 : 1 - edgeDistance / activation;

      const tx = deltaX * (interactions.elasticity || 0.15) * 0.1 * fade;
      const ty = deltaY * (interactions.elasticity || 0.15) * 0.1 * fade;

      // Directional scaling
      const dist = Math.hypot(deltaX, deltaY) || 1;
      const nx = deltaX / dist;
      const ny = deltaY / dist;
      const stretch =
        Math.min(dist / 300, 1) * (interactions.elasticity || 0.15) * fade;
      const scaleX = Math.max(
        0.8,
        1 + Math.abs(nx) * stretch * 0.3 - Math.abs(ny) * stretch * 0.15
      );
      const scaleY = Math.max(
        0.8,
        1 + Math.abs(ny) * stretch * 0.3 - Math.abs(nx) * stretch * 0.15
      );

      this.element.style.transform = `translate(${tx}px, ${ty}px) scaleX(${scaleX}) scaleY(${scaleY})`;

      // Update border gradient if overlays are enabled
      if (this.borderLayer1 && this.borderLayer2) {
        const offsetX = ((e.clientX - centerX) / rect.width) * 100;
        const offsetY = ((e.clientY - centerY) / rect.height) * 100;
        const start = Math.max(10, 33 + offsetY * 0.3);
        const end = Math.min(90, 66 + offsetY * 0.4);
        const c1 = 0.12 + Math.abs(offsetX) * 0.008;
        const c2 = 0.4 + Math.abs(offsetX) * 0.012;
        const angle = 135 + offsetX * 1.2;
        const gradient1 = `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${c1}) ${start}%, rgba(255,255,255,${c2}) ${end}%, rgba(255,255,255,0) 100%)`;
        const gradient2 = `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${
          c1 + 0.2
        }) ${start}%, rgba(255,255,255,${
          c2 + 0.2
        }) ${end}%, rgba(255,255,255,0) 100%)`;
        this.borderLayer1.style.background = gradient1;
        this.borderLayer2.style.background = gradient2;
      }
    };

    this.element.addEventListener("mousemove", this.onMouseMove);
  }

  /**
   * Cleans up resources when destroying the effect
   */
  destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.onMouseMove)
      this.element.removeEventListener("mousemove", this.onMouseMove);
    if (this.svgElement) this.svgElement.remove();
    // Clear caches
    this.cachedDisplacementMap = null;
    this.cachedDimensions = null;
  }
}

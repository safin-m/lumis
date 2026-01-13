import { baseConfig, generateUniqueId } from "./config.js";
import { SELECTORS } from "./constants.js";
import { DisplacementMapBuilder } from "./displacement-map-builder.js";
import { SVGFilterBuilder } from "./svg-filter-builder.js";

/**
 * GlassEffect - Creates a sophisticated glass morphism effect using SVG filters and CSS backdrop-filter
 *
 * Features:
 * - SVG displacement mapping with chromatic aberration
 * - Elastic mouse interactions with physics-based transformations
 * - Multi-layer borders with customizable colors and blend modes
 * - Dynamic hover light effects positioned by angle
 * - Custom overlay gradients with configurable blend modes
 * - Automatic resize handling with memoization
 *
 * @class GlassEffect
 * @example
 * const effect = new GlassEffect(element, {
 *   backdropBlur: 0.15,
 *   overlays: {
 *     borderColor: "100, 200, 255, 0.8",
 *     hoverLightAngle: 45
 *   }
 * });
 */
export class GlassEffect {
  /**
   * Creates a new glass effect instance
   *
   * @param {HTMLElement} element - The DOM element to apply the glass effect to
   * @param {Object} config - Configuration object (merged with baseConfig defaults)
   * @param {number} [config.backdropBlur=0.2] - Blur amount (0-1), multiplied by 32 for pixels
   * @param {boolean} [config.overLight=false] - Adds +12px blur boost and extra overlays
   * @param {Object} [config.overlays] - Overlay customization options
   * @param {string} [config.overlays.borderColor="255, 255, 255, 1"] - RGBA border color
   * @param {number} [config.overlays.borderThickness=1.5] - Border thickness in pixels
   * @param {string} [config.overlays.hoverLightColor] - RGBA hover light color (defaults to borderColor)
   * @param {number} [config.overlays.hoverLightAngle=0] - Hover light angle (0-360°)
   * @param {number} [config.overlays.hoverLightIntensity=1] - Hover light opacity multiplier (0-1)
   * @param {Object} [config.overlays.extraOverlay] - Custom overlay configuration
   * @param {boolean} [config.overlays.extraOverlay.enabled=false] - Enable extra overlay
   * @param {string} [config.overlays.extraOverlay.background] - CSS background value
   * @param {number} [config.overlays.extraOverlay.opacity=1] - Overlay opacity (0-1)
   * @param {string} [config.overlays.extraOverlay.blendMode="color"] - CSS mix-blend-mode
   */
  constructor(element, config = {}) {
    this.element = element;

    // Deep merge config with defaults to handle nested objects properly
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
      overlays: {
        ...baseConfig.overlays,
        ...(config.overlays || {}),
        extraOverlay: {
          ...(baseConfig.overlays?.extraOverlay || {}),
          ...(config.overlays?.extraOverlay || {}),
        },
      },
    };

    // Generate unique filter ID to avoid conflicts when multiple instances exist
    this.filterId = generateUniqueId();

    // Performance optimization: cache displacement map to avoid regeneration
    this.cachedDisplacementMap = null;
    this.cachedDimensions = { width: 0, height: 0 };
    this.updateScheduled = false;

    // Initialize all components in order
    this.createFilter();
    this.cacheFilterElements();
    this.createShineOverlay();
    this.setupHoverEffects();
    this.init();
    this.setupResizeObserver();
  }

  /**
   * Creates the SVG filter element and appends it to the DOM
   * The SVG is hidden but provides the filter definition referenced by the element
   *
   * @private
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

    // Build the SVG filter content using the filter builder
    const filterBuilder = new SVGFilterBuilder(this.filterId, this.config);
    svg.innerHTML = filterBuilder.build();

    document.body.appendChild(svg);
    this.svgElement = svg;
  }

  /**
   * Creates a global style element for the pseudo-element shine effect
   * Uses CSS custom properties for dynamic control of background and shadow
   *
   * @private
   */
  createShineOverlay() {
    // Only create the style tag once globally
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
   * Caches references to frequently accessed filter elements for performance
   * Avoids repeated DOM queries during updates
   *
   * @private
   */
  cacheFilterElements() {
    this.feImage = this.svgElement.querySelector(SELECTORS.FE_IMAGE);
    this.redChannel = this.svgElement.querySelector(SELECTORS.RED_CHANNEL);
    this.greenChannel = this.svgElement.querySelector(SELECTORS.GREEN_CHANNEL);
    this.blueChannel = this.svgElement.querySelector(SELECTORS.BLUE_CHANNEL);
    this.outputBlur = this.svgElement.querySelector(SELECTORS.OUTPUT_BLUR);
  }

  /**
   * Measures the element's current dimensions from its bounding box
   * Stores rounded values in config for use in displacement map generation
   *
   * @private
   */
  measureContainer() {
    const rect = this.element.getBoundingClientRect();
    this.config.width = Math.round(rect.width);
    this.config.height = Math.round(rect.height);
  }

  /**
   * Builds displacement map as a data URI with memoization
   * Returns cached result if dimensions haven't changed for better performance
   *
   * @private
   * @returns {string} Data URI of the displacement map SVG
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

    // Handle both SVG strings and shader mode data URLs
    const dataUri = svgString.trim().startsWith("data:")
      ? svgString
      : `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    // Cache the result for next time
    this.cachedDisplacementMap = dataUri;
    this.cachedDimensions = { width, height };

    return dataUri;
  }

  /**
   * Updates SVG filter attributes based on current config values
   * Sets displacement map dimensions and chromatic aberration scale per channel
   *
   * @private
   */
  updateFilterAttributes() {
    const { width, height, scale, r, g, b, displace } = this.config;

    // Set displacement map dimensions to match element size
    this.feImage.setAttribute("width", width);
    this.feImage.setAttribute("height", height);

    // Set chromatic aberration scale for each RGB channel
    // Each channel gets base scale + its specific offset
    this.redChannel.setAttribute("scale", scale + r);
    this.greenChannel.setAttribute("scale", scale + g);
    this.blueChannel.setAttribute("scale", scale + b);

    // Set output blur amount for smoothing the displaced result
    this.outputBlur.setAttribute("stdDeviation", displace);
  }

  /**
   * Applies all visual styles to the glass element including backdrop-filter,
   * background frost, border radius, and triggers shine and overlay rendering
   *
   * Blur Formula:
   * - Base: backdropBlur * 32 (e.g., 0.2 → 6.4px)
   * - With overLight: backdropBlur * 32 + 12 (e.g., 0.2 → 18.4px)
   * - Setting backdropBlur to 0 completely disables blur
   *
   * @private
   */
  applyElementStyles() {
    const { filterId, config } = this;
    const { saturation, frost, radius, backdropBlur, overLight } = config;

    // Calculate backdrop blur amount
    // Pure multiplicative: backdropBlur * 32 pixels
    // Optional overLight boost: adds +12px for enhanced frosted effect
    const blurPx = overLight ? backdropBlur * 32 + 12 : backdropBlur * 32;

    // Build backdrop-filter value: only add blur() if blurPx > 0
    const backdropFilterValue =
      blurPx > 0
        ? `url(#${filterId}) blur(${blurPx}px) saturate(${saturation})`
        : `url(#${filterId}) saturate(${saturation})`;

    // Apply core glass styles
    Object.assign(this.element.style, {
      WebkitBackdropFilter: backdropFilterValue, // Safari/older Chrome
      backdropFilter: backdropFilterValue,
      background: `hsl(0 0% 100% / ${frost})`, // White background with opacity
      borderRadius: `${radius}px`,
      position: this.element.style.position || "relative",
      // Performance hints for the browser
      willChange: "transform, backdrop-filter",
      contain: "layout style paint",
    });

    // Apply additional visual effects
    this.applyShineEffect();
    this.applyOverlayLayers();
  }

  /**
   * Applies the shine effect using either gradient or shadow based on config
   * Uses CSS custom properties to control the ::before pseudo-element
   *
   * @private
   */
  applyShineEffect() {
    const { intensity, type } = this.config.shine;

    // Disable shine if intensity is 0
    if (intensity === 0) {
      this.element.style.setProperty("--shine-background", "none");
      return;
    }

    // Choose rendering method based on type
    if (type === "shadow") {
      this.applyShadowShine();
    } else {
      this.applyGradientShine();
    }
  }

  /**
   * Applies shine using a linear gradient
   * Creates a directional light sweep based on angle and spread
   *
   * @private
   */
  applyGradientShine() {
    const { angle, intensity, color, spread } = this.config.shine;

    // Adjust angle for CSS gradient convention (+90° offset)
    const gradientAngle = angle + 90;
    const fadeDistance = spread;

    // Create directional gradient with transparent → color → transparent
    const gradient = `linear-gradient(${gradientAngle}deg, 
      transparent 0%, 
      ${color} ${fadeDistance}%, 
      transparent ${fadeDistance * 2}%)`;

    this.element.style.setProperty("--shine-background", gradient);
    this.element.style.setProperty("--shine-shadow", "none");
  }

  /**
   * Applies shine using inset box-shadow
   * Creates a directional highlight by calculating offset from angle
   * Uses dual shadows (positive and negative offset) for balanced effect
   *
   * @private
   */
  applyShadowShine() {
    const { angle, intensity, color, spread } = this.config.shine;

    // Convert angle to radians and calculate shadow offsets
    const angleRad = (angle * Math.PI) / 180;
    const offsetX = Math.cos(angleRad) * 20 * intensity;
    const offsetY = Math.sin(angleRad) * 20 * intensity;

    // Create dual inset shadows for directional light effect
    const shadow = `inset ${offsetX}px ${offsetY}px ${spread}px ${color}, 
            inset ${-offsetX}px ${-offsetY}px ${spread}px ${color}`;

    this.element.style.setProperty("--shine-background", "none");
    this.element.style.setProperty("--shine-shadow", shadow);
  }

  /**
   * Sets up hover event listeners for border glow and scale transformations
   * Only applies if interactions are disabled (to avoid conflicts)
   *
   * @private
   */
  setupHoverEffects() {
    const { borderWidth, borderColor, scale, duration, easing } =
      this.config.hover;
    const interactionsEnabled = this.config.interactions?.enabled;

    if (borderWidth > 0) {
      // Set default transparent border and transition
      this.element.style.border = `${borderWidth}px solid transparent`;
      // Only add transform transition if interactions are disabled
      const transitionProps = interactionsEnabled
        ? `border-color ${duration}s ${easing}`
        : `transform ${duration}s ${easing}, border-color ${duration}s ${easing}`;
      this.element.style.transition = transitionProps;

      // Mouse enter: show border and hover overlays
      this.element.addEventListener("mouseenter", () => {
        // Only apply scale if interactions are disabled (to avoid conflicts)
        if (!interactionsEnabled && scale !== 1) {
          this.element.style.transform = `scale(${scale})`;
        }
        // Always show border and hover overlays on mouse enter
        this.element.style.borderColor = borderColor;
        if (this.hoverOverlay1)
          this.hoverOverlay1.style.opacity = String(
            this.config.overlays?.hoverOverlay1Opacity ?? 0.5
          );
        if (this.hoverOverlay2)
          this.hoverOverlay2.style.opacity = String(
            this.config.overlays?.hoverOverlay2Opacity ?? 0
          );
      });

      // Mouse leave: hide border and overlays
      this.element.addEventListener("mouseleave", () => {
        if (!interactionsEnabled) this.element.style.transform = "";
        // Always hide border and overlays on mouse leave
        this.element.style.borderColor = "transparent";
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0";
        if (this.hoverOverlay2) this.hoverOverlay2.style.opacity = "0";
      });
    } else if (scale !== 1) {
      // Only scale, no border
      // Only add transform transition if interactions are disabled
      if (!interactionsEnabled) {
        this.element.style.transition = `transform ${duration}s ${easing}`;
      }
      this.element.addEventListener("mouseenter", () => {
        // Only apply scale if interactions are disabled (to avoid conflicts)
        if (!interactionsEnabled)
          this.element.style.transform = `scale(${scale})`;
        // Always show hover overlays on mouse enter
        if (this.hoverOverlay1)
          this.hoverOverlay1.style.opacity = String(
            this.config.overlays?.hoverOverlay1Opacity ?? 0.5
          );
      });
      this.element.addEventListener("mouseleave", () => {
        if (!interactionsEnabled) this.element.style.transform = "";
        // Always hide hover overlays on mouse leave
        if (this.hoverOverlay1) this.hoverOverlay1.style.opacity = "0";
      });
    }
  }

  /**
   * Creates and applies all overlay layers including borders, extra overlay, and hover effects
   * Layer order (bottom to top):
   * 1. borderLayer1 (screen blend)
   * 2. borderLayer2 (overlay blend)
   * 3. extraOverlay (custom blend mode, positioned after borders for color blending)
   * 4. hoverOverlay1 & hoverOverlay2 (radial gradients positioned by angle)
   *
   * @private
   */
  applyOverlayLayers() {
    const { overlays } = this.config;
    if (!overlays?.enabled) return;

    // Create or update each overlay type
    this.createBorderLayers(overlays);
    this.createExtraOverlay(overlays);
    this.createHoverOverlays(overlays);
  }

  /**
   * Creates two border layers with different blend modes for depth
   * Uses CSS mask to create a border-only effect (hollow center)
   *
   * @private
   * @param {Object} overlays - Overlay configuration object
   */
  createBorderLayers(overlays) {
    const borderColor = overlays?.borderColor || "255, 255, 255, 1";
    const borderThickness = overlays?.borderThickness || 1.5;

    // First border layer with screen blend mode
    if (!this.borderLayer1) {
      this.borderLayer1 = document.createElement("span");
      Object.assign(this.borderLayer1.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: "0.2",
        padding: `${borderThickness}px`,
        // CSS mask creates hollow center effect
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        // Multi-layered box-shadow for depth
        boxShadow: `0 0 0 0.5px rgba(${borderColor}) inset, 0 1px 3px rgba(${borderColor}) inset, 0 1px 4px rgba(0, 0, 0, 0.35)`,
        // Match container's border radius
        borderRadius: `${this.config.radius}px`,
      });
      this.element.appendChild(this.borderLayer1);
    } else {
      // Update existing border layer radius
      this.borderLayer1.style.borderRadius = `${this.config.radius}px`;
    }

    // Second border layer with overlay blend mode
    if (!this.borderLayer2) {
      this.borderLayer2 = document.createElement("span");
      Object.assign(this.borderLayer2.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        mixBlendMode: "overlay",
        padding: `${borderThickness}px`,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        boxShadow: `0 0 0 0.5px rgba(${borderColor}) inset, 0 1px 3px rgba(${borderColor}) inset, 0 1px 4px rgba(0, 0, 0, 0.35)`,
        // Match container's border radius
        borderRadius: `${this.config.radius}px`,
      });
      this.element.appendChild(this.borderLayer2);
    } else {
      // Update existing border layer radius
      this.borderLayer2.style.borderRadius = `${this.config.radius}px`;
    }
  }

  /**
   * Creates or removes the extra overlay layer for custom gradients/colors
   * Positioned after borders to enable color blending with border layers
   * Uses "color" blend mode by default to tint borders while preserving luminance
   *
   * @private
   * @param {Object} overlays - Overlay configuration object
   */
  createExtraOverlay(overlays) {
    const extraOverlay = overlays?.extraOverlay;

    if (extraOverlay?.enabled) {
      if (!this.extraOverlay) {
        this.extraOverlay = document.createElement("div");
        Object.assign(this.extraOverlay.style, {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          background: extraOverlay.background || "none",
          opacity: extraOverlay.opacity ?? 1,
          // "color" blend mode tints borders while preserving their structure
          mixBlendMode: extraOverlay.blendMode || "color",
          // Match container's border radius for seamless integration
          borderRadius: `${this.config.radius}px`,
        });
        this.element.appendChild(this.extraOverlay);
      } else {
        // Update existing extra overlay radius
        this.extraOverlay.style.borderRadius = `${this.config.radius}px`;
      }
    } else if (this.extraOverlay) {
      // Remove overlay if disabled
      this.extraOverlay.remove();
      this.extraOverlay = null;
    }
  }

  /**
   * Creates hover overlay layers with radial gradients positioned by angle
   * Angle system: 0° = top, 90° = right, 180° = bottom, 270° = left
   *
   * Position calculation:
   * - x = 50 + 50 * sin(angle) - Maps angle to horizontal position (0-100%)
   * - y = 50 - 50 * cos(angle) - Maps angle to vertical position (0-100%)
   *
   * @private
   * @param {Object} overlays - Overlay configuration object
   */
  createHoverOverlays(overlays) {
    const hoverLightAngle = overlays?.hoverLightAngle ?? 0;
    const hoverLightIntensity = overlays?.hoverLightIntensity ?? 1;
    const borderColor = overlays?.borderColor || "255, 255, 255, 1";
    const hoverLightColor = overlays?.hoverLightColor || borderColor;

    // Convert angle to gradient position using trigonometry
    const angleRad = (hoverLightAngle * Math.PI) / 180;
    const x = 50 + 50 * Math.sin(angleRad);
    const y = 50 - 50 * Math.cos(angleRad);

    // Parse RGBA color string and apply intensity multiplier to alpha channel
    const colorParts = hoverLightColor.split(",").map((v) => v.trim());
    const baseAlpha = parseFloat(colorParts[3] || "1");
    const intensifiedAlpha = baseAlpha * hoverLightIntensity;
    const hoverColor = `${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${intensifiedAlpha}`;

    // First hover overlay (tighter gradient)
    if (!this.hoverOverlay1) {
      this.hoverOverlay1 = document.createElement("div");
      Object.assign(this.hoverOverlay1.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        transition: "opacity 0.2s ease-out",
        opacity: "0",
        // Radial gradient positioned at calculated x, y coordinates
        backgroundImage: `radial-gradient(circle at ${x}% ${y}%, rgba(${hoverColor}) 0%, rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, 0) 50%)`,
        mixBlendMode: "overlay",
        // Match container's border radius
        borderRadius: `${this.config.radius}px`,
      });
      this.element.appendChild(this.hoverOverlay1);
    } else {
      // Update existing hover overlay radius
      this.hoverOverlay1.style.borderRadius = `${this.config.radius}px`;
    }

    // Second hover overlay (wider spread)
    if (!this.hoverOverlay2) {
      this.hoverOverlay2 = document.createElement("div");
      Object.assign(this.hoverOverlay2.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        transition: "opacity 0.2s ease-out",
        opacity: "0",
        // Wider gradient (80% spread vs 50%)
        backgroundImage: `radial-gradient(circle at ${x}% ${y}%, rgba(${hoverColor}) 0%, rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, 0) 80%)`,
        mixBlendMode: "overlay",
        // Match container's border radius
        borderRadius: `${this.config.radius}px`,
      });
      this.element.appendChild(this.hoverOverlay2);
    } else {
      // Update existing hover overlay radius
      this.hoverOverlay2.style.borderRadius = `${this.config.radius}px`;
    }
  }

  /**
   * Updates all aspects of the glass effect (debounced with RAF)
   * Measures dimensions, rebuilds displacement map, updates SVG filter, and reapplies styles
   * Uses requestAnimationFrame to batch updates and prevent redundant work
   *
   * @public
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
   * Sets up a ResizeObserver to automatically update when element size changes
   * Throttled to maximum once per 100ms for performance
   *
   * @private
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
   * Initializes the glass effect by performing initial update and setting up interactions
   *
   * @private
   */
  init() {
    this.update();
    this.setupInteractions();
  }

  /**
   * Sets up optional elastic mouse interactions with physics-based transformations
   *
   * Interaction features:
   * - Elastic translation following mouse position
   * - Directional scaling based on mouse angle
   * - Activation fade based on distance from element
   * - Dynamic border gradients that follow mouse movement
   *
   * Only activates if config.interactions.enabled is true
   *
   * @private
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

      // Calculate distance from edge for activation fade
      const edgeDistanceX = Math.max(0, Math.abs(deltaX) - rect.width / 2);
      const edgeDistanceY = Math.max(0, Math.abs(deltaY) - rect.height / 2);
      const edgeDistance = Math.hypot(edgeDistanceX, edgeDistanceY);
      const activation = interactions.activationZone || 200;
      // Fade from 1 (at edge) to 0 (at activation distance)
      const fade =
        edgeDistance > activation ? 0 : 1 - edgeDistance / activation;

      // Elastic translation: mouse delta * elasticity * fade
      const tx = deltaX * (interactions.elasticity || 0.15) * 0.1 * fade;
      const ty = deltaY * (interactions.elasticity || 0.15) * 0.1 * fade;

      // Directional scaling: stretch toward mouse direction
      const dist = Math.hypot(deltaX, deltaY) || 1;
      const nx = deltaX / dist; // Normalized x direction
      const ny = deltaY / dist; // Normalized y direction
      const stretch =
        Math.min(dist / 300, 1) * (interactions.elasticity || 0.15) * fade;
      // Scale more in mouse direction, less perpendicular to it
      const scaleX = Math.max(
        0.8,
        1 + Math.abs(nx) * stretch * 0.3 - Math.abs(ny) * stretch * 0.15
      );
      const scaleY = Math.max(
        0.8,
        1 + Math.abs(ny) * stretch * 0.3 - Math.abs(nx) * stretch * 0.15
      );

      // Apply transformation
      this.element.style.transform = `translate(${tx}px, ${ty}px) scaleX(${scaleX}) scaleY(${scaleY})`;

      // Update border gradient to follow mouse position
      if (this.borderLayer1 && this.borderLayer2) {
        // Calculate offset percentages relative to element center
        const offsetX = ((e.clientX - centerX) / rect.width) * 100;
        const offsetY = ((e.clientY - centerY) / rect.height) * 100;

        // Dynamic gradient parameters based on mouse position
        const start = Math.max(10, 33 + offsetY * 0.3);
        const end = Math.min(90, 66 + offsetY * 0.4);
        const c1 = 0.12 + Math.abs(offsetX) * 0.008; // Color stop opacity
        const c2 = 0.4 + Math.abs(offsetX) * 0.012;
        const angle = 135 + offsetX * 1.2; // Rotate gradient with mouse

        // Create dynamic gradients for both border layers
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

    // Reset transform on mouse leave
    this.onMouseLeave = () => {
      this.element.style.transform = "";
      // Reset border gradients to default
      if (this.borderLayer1 && this.borderLayer2) {
        this.borderLayer1.style.background = "";
        this.borderLayer2.style.background = "";
      }
    };

    this.element.addEventListener("mousemove", this.onMouseMove);
    this.element.addEventListener("mouseleave", this.onMouseLeave);
  }

  /**
   * Cleans up all resources and event listeners when destroying the effect
   * Removes SVG filter, disconnects observer, and clears caches
   *
   * @public
   */
  destroy() {
    // Disconnect resize observer
    if (this.resizeObserver) this.resizeObserver.disconnect();

    // Remove event listeners
    if (this.onMouseMove)
      this.element.removeEventListener("mousemove", this.onMouseMove);
    if (this.onMouseLeave)
      this.element.removeEventListener("mouseleave", this.onMouseLeave);

    // Remove SVG filter from DOM
    if (this.svgElement) this.svgElement.remove();

    // Clear caches to free memory
    this.cachedDisplacementMap = null;
    this.cachedDimensions = null;
  }
}

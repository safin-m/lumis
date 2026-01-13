# Glass Effect Library

A highly customizable glass morphism effect library with advanced features including SVG displacement mapping, chromatic aberration, elastic mouse interactions, dynamic overlays, and customizable visual effects.

## Features

- 🎨 **Realistic Glass Effect** - SVG displacement mapping with chromatic aberration
- 🖱️ **Elastic Mouse Interactions** - Smooth, physics-based element transformations
- 🌈 **Dynamic Overlays** - Multi-layer borders with hover effects and custom gradients
- ✨ **Customizable Visual Effects** - Shine, warp, blur, and color controls
- 🎯 **Edge-Only Aberration** - Optional masking for cleaner center areas
- 🎭 **Shader Mode** - CPU-generated liquid glass displacement
- ⚡ **Performance Optimized** - RAF scheduling, memoization, and efficient updates
- 📦 **Zero Dependencies** - Pure JavaScript, no external libraries
- 🎮 **Works Anywhere** - Apply to any HTML element

## Installation

```bash
npm install glass-effect
```

## Quick Start

```html
<!-- HTML -->
<div class="glass">Your content here</div>

<!-- JavaScript -->
<script type="module">
  import { GlassEffect } from "glass-effect";

  const element = document.querySelector(".glass");
  new GlassEffect(element);
</script>
```

## Configuration Options

### Core Glass Effect

| Parameter      | Type    | Default | Description                                                              |
| -------------- | ------- | ------- | ------------------------------------------------------------------------ |
| `scale`        | number  | -180    | Displacement intensity (negative for standard mode, positive for shader) |
| `radius`       | number  | 16      | Border radius in pixels                                                  |
| `frost`        | number  | 0       | Frosted glass opacity (0-1)                                              |
| `saturation`   | number  | 1       | Color saturation multiplier (0-200)                                      |
| `backdropBlur` | number  | 0.2     | Backdrop blur amount (0-1), formula: `backdropBlur * 32` pixels          |
| `overLight`    | boolean | false   | Enhances blur (+12px) and adds extra light overlays                      |

**Blur Formula:**

- Base: `backdropBlur * 32` (e.g., 0.2 → 6.4px)
- With `overLight: true`: `backdropBlur * 32 + 12` (e.g., 0.2 → 18.4px)
- Set to `0` for no blur, very small values like `0.002` for subtle effects

### Display Modes

| Parameter             | Type    | Default    | Description                                                              |
| --------------------- | ------- | ---------- | ------------------------------------------------------------------------ |
| `mode`                | string  | "standard" | Display mode: "standard" or "shader" (CPU-generated liquid displacement) |
| `edgeMask`            | boolean | false      | Enable edge-only chromatic aberration (keeps center clean)               |
| `aberrationIntensity` | number  | 2          | Edge mask strength when edgeMask is enabled                              |

### Mouse Interactions

Enable elastic, physics-based transformations that follow the mouse.

| Parameter                     | Type    | Default | Description                                     |
| ----------------------------- | ------- | ------- | ----------------------------------------------- |
| `interactions.enabled`        | boolean | true    | Enable/disable mouse interactions               |
| `interactions.elasticity`     | number  | 0.15    | Movement responsiveness (0-1, lower = smoother) |
| `interactions.activationZone` | number  | 200     | Distance in pixels for interaction activation   |

**Example:**

```javascript
new GlassEffect(element, {
  interactions: {
    enabled: true,
    elasticity: 0.2,
    activationZone: 300,
  },
});
```

### Overlay System

Multi-layer visual enhancements including borders, hover effects, and custom gradients.

| Parameter                      | Type    | Default            | Description                                                     |
| ------------------------------ | ------- | ------------------ | --------------------------------------------------------------- |
| `overlays.enabled`             | boolean | true               | Enable/disable all overlay layers                               |
| `overlays.advancedBorder`      | boolean | true               | Multi-layer border with blend modes                             |
| `overlays.borderColor`         | string  | "255, 255, 255, 1" | RGBA border color format: "R, G, B, A" (e.g., "255, 0, 0, 0.8") |
| `overlays.borderThickness`     | number  | 1.5                | Border thickness in pixels                                      |
| `overlays.hoverLightColor`     | string  | "255, 255, 255, 1" | RGBA hover light color (defaults to borderColor if not set)     |
| `overlays.hoverLightAngle`     | number  | 0                  | Hover light angle: 0=top, 90=right, 180=bottom, 270=left        |
| `overlays.hoverLightIntensity` | number  | 1                  | Hover light opacity multiplier (0-1)                            |

**Example:**

```javascript
new GlassEffect(element, {
  overlays: {
    enabled: true,
    borderColor: "100, 200, 255, 0.9",
    borderThickness: 2,
    hoverLightColor: "255, 100, 255, 0.8",
    hoverLightAngle: 45,
    hoverLightIntensity: 0.7,
  },
});
```

### Extra Overlay

Custom gradient or color layer that blends with borders for artistic effects.

| Parameter                          | Type    | Default | Description                               |
| ---------------------------------- | ------- | ------- | ----------------------------------------- |
| `overlays.extraOverlay.enabled`    | boolean | false   | Enable custom overlay layer               |
| `overlays.extraOverlay.background` | string  | ""      | CSS background (gradient, color, image)   |
| `overlays.extraOverlay.opacity`    | number  | 1       | Overlay opacity (0-1)                     |
| `overlays.extraOverlay.blendMode`  | string  | "color" | CSS mix-blend-mode for border interaction |

**Blend Modes:**

- `"color"` - Tints borders while preserving luminance (recommended for coloring borders)
- `"hue"` - Changes border color hue
- `"saturation"` - Adjusts color intensity
- `"overlay"` - Combines multiply and screen
- `"screen"` - Lightens
- `"multiply"` - Darkens
- `"color-dodge"` - Creates bright glowing effects

**Example:**

```javascript
new GlassEffect(element, {
  overlays: {
    extraOverlay: {
      enabled: true,
      background:
        "radial-gradient(circle, rgba(255,0,255,0.4) 0%, rgba(0,255,255,0.2) 100%)",
      opacity: 0.8,
      blendMode: "color",
    },
  },
});
```

### Displacement Map

Controls the distortion pattern of the glass effect.

| Parameter   | Type   | Default      | Description                                   |
| ----------- | ------ | ------------ | --------------------------------------------- |
| `border`    | number | 0.07         | Border fade amount (0-1)                      |
| `lightness` | number | 50           | Center area lightness (0-100)                 |
| `alpha`     | number | 0.93         | Center area opacity (0-1)                     |
| `blur`      | number | 11           | Center blur amount (softens distortion edges) |
| `displace`  | number | 0            | Output blur after displacement                |
| `blend`     | string | "difference" | Blend mode for displacement gradients         |

### Chromatic Aberration

RGB channel separation for depth and realism.

| Parameter | Type   | Default | Description                      |
| --------- | ------ | ------- | -------------------------------- |
| `x`       | string | "R"     | X-axis channel: "R", "G", or "B" |
| `y`       | string | "B"     | Y-axis channel: "R", "G", or "B" |
| `r`       | number | 0       | Red channel offset               |
| `g`       | number | 10      | Green channel offset             |
| `b`       | number | 20      | Blue channel offset              |

### Warp Effect

Directional color gradient overlay.

| Parameter        | Type   | Default                  | Description                       |
| ---------------- | ------ | ------------------------ | --------------------------------- |
| `warp.angle`     | number | 195                      | Gradient angle in degrees (0-360) |
| `warp.intensity` | number | 0                        | Warp visibility (0-1)             |
| `warp.color`     | string | "rgba(255, 221, 153, 0)" | CSS color value                   |

**Example:**

```javascript
new GlassEffect(element, {
  warp: {
    angle: 135,
    intensity: 0.5,
    color: "hsla(40, 100%, 80%, 0.6)",
  },
});
```

### Shine Effect

Adds directional highlights or shadows for depth.

| Parameter         | Type   | Default                     | Description                                     |
| ----------------- | ------ | --------------------------- | ----------------------------------------------- |
| `shine.angle`     | number | 135                         | Light direction in degrees (0-360)              |
| `shine.intensity` | number | 0.4                         | Effect strength (0-1)                           |
| `shine.color`     | string | "hsla(59, 100%, 75%, 0.29)" | CSS color value                                 |
| `shine.spread`    | number | 40                          | Light spread/falloff                            |
| `shine.type`      | string | "shadow"                    | Type: "shadow" (inset box-shadow) or "gradient" |

**Example:**

```javascript
new GlassEffect(element, {
  shine: {
    angle: 90,
    intensity: 0.6,
    color: "rgba(255, 255, 255, 0.4)",
    spread: 50,
    type: "gradient",
  },
});
```

### Hover Effects

Triggered when mouse enters the element.

| Parameter           | Type   | Default            | Description                                 |
| ------------------- | ------ | ------------------ | ------------------------------------------- |
| `hover.borderWidth` | number | 1                  | Hover border thickness in pixels            |
| `hover.borderColor` | string | "hsl(0, 0%, 100%)" | CSS border color                            |
| `hover.scale`       | number | 1.05               | Scale multiplier on hover (1.0 = no change) |
| `hover.duration`    | number | 0.3                | Transition duration in seconds              |
| `hover.easing`      | string | "ease-in-out"      | CSS easing function                         |

## Usage Examples

### Minimal Setup

```javascript
// Just apply the effect with defaults
new GlassEffect(document.querySelector(".glass"));
```

### Frosted Glass Card

```javascript
new GlassEffect(element, {
  backdropBlur: 0.15,
  frost: 0.1,
  radius: 24,
  interactions: {
    enabled: true,
    elasticity: 0.1,
  },
});
```

### Vibrant Colored Glass

```javascript
new GlassEffect(element, {
  overlays: {
    borderColor: "100, 200, 255, 0.8",
    borderThickness: 2,
    extraOverlay: {
      enabled: true,
      background:
        "linear-gradient(135deg, rgba(255,0,255,0.3), rgba(0,255,255,0.3))",
      blendMode: "color",
    },
  },
});
```

### Liquid Glass with Shader Mode

```javascript
new GlassEffect(element, {
  mode: "shader",
  scale: 180,
  backdropBlur: 0.1,
  interactions: {
    enabled: true,
    elasticity: 0.2,
  },
});
```

### Edge-Only Aberration

```javascript
new GlassEffect(element, {
  edgeMask: true,
  aberrationIntensity: 5,
  backdropBlur: 0.05,
});
```

### Custom Hover Light

```javascript
new GlassEffect(element, {
  overlays: {
    borderColor: "255, 255, 255, 1",
    hoverLightColor: "255, 100, 150, 0.9",
    hoverLightAngle: 315,
    hoverLightIntensity: 0.8,
  },
});
```

### Purple-Magenta Radial Gradient Overlay

```javascript
new GlassEffect(element, {
  overlays: {
    extraOverlay: {
      enabled: true,
      background:
        "radial-gradient(circle at 50% 50%, rgba(186, 85, 211, 0.4) 0%, rgba(255, 0, 255, 0.3) 100%)",
      opacity: 1,
      blendMode: "color",
    },
  },
});
```

## Using Data Attributes

Apply effects declaratively through HTML data attributes:

```html
<div
  class="glass"
  data-glass-backdrop-blur="0.15"
  data-glass-radius="24"
  data-glass-frost="0.1"
  data-glass-interactions-enabled="true"
  data-glass-interactions-elasticity="0.1"
  data-glass-overlays-border-color="100, 200, 255, 0.8"
  data-glass-overlays-border-thickness="2"
  data-glass-overlays-hover-light-angle="45"
  data-glass-shine-intensity="0.5"
  data-glass-shine-angle="135"
  data-glass-warp-intensity="0.3"
>
  Content
</div>
```

## Development & Building

### Setup

```bash
# Install dependencies
npm install
```

### Build

```bash
# Build all bundle formats (ESM, CommonJS, Browser IIFE)
npm run build
```

This creates:

- `dist/glass-effect.js` - ES Module (for modern bundlers)
- `dist/glass-effect.cjs` - CommonJS (for Node.js)
- `dist/glass-effect.browser.js` - Browser IIFE (for direct script tag usage)
- `dist/glass-effect.css` - Optional base styles

### Development Server

```bash
# Start local development server on port 8000
npm run dev
```

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Required Features**: CSS backdrop-filter, SVG filters, ResizeObserver

## Performance Tips

1. **Limit active effects**: Only enable features you need
2. **Reduce blur amounts**: Lower `backdropBlur` and `blur` values for better performance
3. **Disable interactions**: Set `interactions.enabled: false` if not needed
4. **Use standard mode**: `mode: "standard"` is faster than shader mode
5. **Optimize resize**: Fewer elements = smoother resize handling

## API Reference

### Constructor

```javascript
new GlassEffect(element, config);
```

**Parameters:**

- `element` (HTMLElement): Target element for the effect
- `config` (Object): Configuration object (see Configuration Options)

### Methods

```javascript
// Update configuration dynamically
glassEffect.update();

// Clean up and remove effect
glassEffect.destroy();
```

## Project Structure

```plaintext
glass-effect/
├── config.js              # Configuration defaults and parsing
├── constants.js           # Shared constants and selectors
├── glass-effect.js        # Main effect class
├── displacement-map-builder.js  # Displacement map generation
├── svg-filter-builder.js  # SVG filter creation
├── index.js               # Entry point and auto-initialization
├── build.js               # Build script
└── README.md              # Documentation
```

## License

MIT

## Credits

Inspired by modern glass morphism design trends and advanced CSS/SVG techniques.
